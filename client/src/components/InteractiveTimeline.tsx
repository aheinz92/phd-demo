import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TimelineState } from '@/types/music';

interface InteractiveTimelineProps {
  onPositionChange: (position: number) => void;
  onInteractionStart: () => void;
  className?: string;
}

export function InteractiveTimeline({ 
  onPositionChange, 
  onInteractionStart, 
  className = "" 
}: InteractiveTimelineProps) {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentPosition: 30,
    isDragging: false,
    hasInteracted: false,
    isRecordingsSectionVisible: false
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const playheadGroupRef = useRef<SVGGElement>(null);

  // Helper function to generate variance paths with realistic interpretive differences
  const generateVariancePath = useCallback((
    width: number, 
    intensity: number, 
    seed: number // For consistent randomness
  ): string => {
    const numPoints = 40;
    const points = [];
    const baseline = 120;
    const mainClimaxCenter = 50; // Position of main climax (50% of timeline)
    const mainClimaxWidth = 12; // Width of main climax area
    const secondaryClimaxCenter = 80; // Position of secondary climax (80% of timeline)
    const secondaryClimaxWidth = 8; // Width of secondary climax area
    
    // Use seed for consistent "randomness"
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index * 1234) * 10000;
      return x - Math.floor(x);
    };
    
    points.push(`M0,${baseline}`);
    
    for (let i = 1; i <= numPoints; i++) {
      const x = (width * i) / numPoints;
      const xPercent = (i / numPoints) * 100;
      
      // Calculate distance from both climax points
      const distanceFromMainClimax = Math.abs(xPercent - mainClimaxCenter);
      const distanceFromSecondaryClimax = Math.abs(xPercent - secondaryClimaxCenter);
      
      let varianceFactor = 0.08 + (seededRandom(i) * 0.12); // Base variance
      
      // Main climax influence (stronger)
      if (distanceFromMainClimax < mainClimaxWidth) {
        const mainClimaxIntensity = 1 - (distanceFromMainClimax / mainClimaxWidth);
        varianceFactor += mainClimaxIntensity * 1.2; // Increased intensity for taller peaks
      }
      
      // Secondary climax influence (moderate)
      if (distanceFromSecondaryClimax < secondaryClimaxWidth) {
        const secondaryClimaxIntensity = 1 - (distanceFromSecondaryClimax / secondaryClimaxWidth);
        varianceFactor += secondaryClimaxIntensity * 0.6;
      }
      
      // Add musician-specific character
      const musicianVariance = seededRandom(i + 100) * 0.25;
      const finalVariance = (varianceFactor + musicianVariance) * intensity;
      
      // Calculate y position (upward from baseline) - increased range
      const y = baseline - Math.max(0, finalVariance * 95);
      
      points.push(`L${x},${y}`);
    }
    
    return points.join(" ");
  }, []);

  // Generate stable variance paths with more performers
  const variancePaths = useMemo(() => ({
    rubinstein: generateVariancePath(400, 1.0, 1.2),   // Most dramatic peaks
    horowitz: generateVariancePath(400, 0.85, 2.8),    // Strong controlled peaks
    pires: generateVariancePath(400, 0.6, 4.1),        // Moderate subtle peaks
    richter: generateVariancePath(400, 0.75, 6.7),     // Unique interpretation
    pollini: generateVariancePath(400, 0.8, 8.3),      // Technical precision
    ashkenazy: generateVariancePath(400, 0.65, 9.9)    // Lyrical approach
  }), [generateVariancePath]);

  const updatePlayheadPosition = useCallback((clientX: number) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 400;
    const clampedX = Math.max(10, Math.min(390, svgX));
    const percentage = (clampedX / 400) * 100;
    
    setTimelineState(prev => ({
      ...prev,
      currentPosition: percentage
    }));
    
    onPositionChange(percentage);
    
    // Check if in climax areas (main climax at 50% and secondary at 80%)
    const isInMainClimaxArea = percentage > 44 && percentage < 56;
    const isInSecondaryClimaxArea = percentage > 76 && percentage < 84;
    const isInAnyClimaxArea = isInMainClimaxArea || isInSecondaryClimaxArea;
    
    if (isInAnyClimaxArea && !timelineState.isRecordingsSectionVisible) {
      onInteractionStart();
      setTimelineState(prev => ({
        ...prev,
        hasInteracted: true,
        isRecordingsSectionVisible: true
      }));
    } else if (!isInAnyClimaxArea && timelineState.isRecordingsSectionVisible) {
      setTimelineState(prev => ({
        ...prev,
        isRecordingsSectionVisible: false
      }));
    }
  }, [onPositionChange, onInteractionStart, timelineState.hasInteracted]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (playheadGroupRef.current) {
      playheadGroupRef.current.style.transform = 'scale(1.1)';
    }
    updatePlayheadPosition(e.clientX);
  }, [updatePlayheadPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (timelineState.isDragging) {
      e.preventDefault();
      updatePlayheadPosition(e.clientX);
    }
  }, [timelineState.isDragging, updatePlayheadPosition]);

  const handleMouseUp = useCallback(() => {
    if (timelineState.isDragging) {
      setTimelineState(prev => ({ ...prev, isDragging: false }));
      if (playheadGroupRef.current) {
        playheadGroupRef.current.style.transform = 'scale(1)';
      }
    }
  }, [timelineState.isDragging]);

  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      updatePlayheadPosition(e.clientX);
    }
  }, [updatePlayheadPosition]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (playheadGroupRef.current) {
      playheadGroupRef.current.style.transform = 'scale(1.1)';
    }
    updatePlayheadPosition(e.touches[0].clientX);
  }, [updatePlayheadPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (timelineState.isDragging && e.touches.length > 0) {
      e.preventDefault();
      updatePlayheadPosition(e.touches[0].clientX);
    }
  }, [timelineState.isDragging, updatePlayheadPosition]);

  const handleTouchEnd = useCallback(() => {
    if (timelineState.isDragging) {
      setTimelineState(prev => ({ ...prev, isDragging: false }));
      if (playheadGroupRef.current) {
        playheadGroupRef.current.style.transform = 'scale(1)';
      }
    }
  }, [timelineState.isDragging]);

  // Set up global event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const playheadX = (timelineState.currentPosition / 100) * 400;

  return (
    <div className={`relative h-48 bg-gradient-to-b from-transparent to-red-950/5 rounded-xl border border-amber-200/30 overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full timeline-svg"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        onClick={handleSvgClick}
      >
        {/* Baseline (median recording range) */}
        <path
          d="M0,120 L400,120"
          stroke="#666"
          fill="none"
          strokeWidth="4"
          opacity="0.6"
        />
        
        {/* Dynamically generated variance paths - 6 different interpretations */}
        <path
          d={variancePaths.rubinstein}
          stroke="hsl(var(--accent))"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        <path
          d={variancePaths.horowitz}
          stroke="#b8860b"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        <path
          d={variancePaths.pires}
          stroke="#2e8b57"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        <path
          d={variancePaths.richter}
          stroke="#8b4513"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        <path
          d={variancePaths.pollini}
          stroke="#4169e1"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        <path
          d={variancePaths.ashkenazy}
          stroke="#9932cc"
          fill="none"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        {/* Interactive Playhead */}
        <g
          ref={playheadGroupRef}
          className="playhead-group"
        >
          <line
            x1={playheadX}
            y1="8"
            x2={playheadX}
            y2="132"
            stroke="hsl(var(--accent))"
            strokeWidth="2.5"
            strokeDasharray="4,2"
          />
          <circle
            cx={playheadX}
            cy="120"
            r="6"
            fill="hsl(var(--accent))"
            stroke="hsl(var(--parchment))"
            strokeWidth="2"
          />
          <circle
            cx={playheadX}
            cy="8"
            r="4"
            fill="hsl(var(--accent))"
            opacity="0.7"
          />
          {/* Invisible hit area for easier dragging */}
          <rect
            x={playheadX - 8}
            y="0"
            width="16"
            height="140"
            fill="transparent"
            className="playhead-hitarea"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </g>
      </svg>
      
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-3 font-sans-custom text-xs text-stone-600 opacity-70">
        <span>3:25</span>
        <span>4:17</span>
      </div>
    </div>
  );
}
