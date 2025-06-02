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

  // Helper function to generate smooth variance paths with realistic interpretive differences
  const generateVariancePath = useCallback((
    width: number, 
    intensity: number, 
    seed: number // For consistent randomness
  ): string => {
    const numPoints = 60; // More points for smoother curves
    const rawPoints: { x: number; y: number }[] = [];
    const baseline = 172; // Move baseline down to near bottom of new taller view
    const mainClimaxCenter = 50; // Position of main climax (50% of timeline)
    const mainClimaxWidth = 12; // Width of main climax area
    const secondaryClimaxCenter = 80; // Position of secondary climax (80% of timeline)
    const secondaryClimaxWidth = 8; // Width of secondary climax area
    
    // Use seed for consistent "randomness"
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index * 1234) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate raw points first
    for (let i = 0; i <= numPoints; i++) {
      const x = (width * i) / numPoints;
      const xPercent = (i / numPoints) * 100;
      
      // Calculate distance from both climax points
      const distanceFromMainClimax = Math.abs(xPercent - mainClimaxCenter);
      const distanceFromSecondaryClimax = Math.abs(xPercent - secondaryClimaxCenter);
      
      let varianceFactor = 0.08 + (seededRandom(i) * 0.12); // Base variance
      
      // Main climax influence (stronger)
      if (distanceFromMainClimax < mainClimaxWidth) {
        const mainClimaxIntensity = 1 - (distanceFromMainClimax / mainClimaxWidth);
        varianceFactor += mainClimaxIntensity * 1.2;
      }
      
      // Secondary climax influence (moderate)
      if (distanceFromSecondaryClimax < secondaryClimaxWidth) {
        const secondaryClimaxIntensity = 1 - (distanceFromSecondaryClimax / secondaryClimaxWidth);
        varianceFactor += secondaryClimaxIntensity * 0.6;
      }
      
      // Add musician-specific character
      const musicianVariance = seededRandom(i + 100) * 0.25;
      const finalVariance = (varianceFactor + musicianVariance) * intensity;
      
      // Calculate y position (upward from baseline) - ensure lines get very close to baseline
      const y = baseline - Math.max(0.5, finalVariance * 95);
      
      rawPoints.push({ x, y });
    }
    
    // Apply simple smoothing
    const smoothedPoints = rawPoints.map((point, i) => {
      if (i === 0 || i === rawPoints.length - 1) return point;
      
      const prev = rawPoints[i - 1];
      const next = rawPoints[i + 1];
      
      return {
        x: point.x,
        y: (prev.y + point.y + next.y) / 3 // Simple 3-point average
      };
    });
    
    // Create smooth curve using quadratic curves
    const pathParts = [`M${smoothedPoints[0].x},${smoothedPoints[0].y}`];
    
    for (let i = 1; i < smoothedPoints.length - 1; i++) {
      const current = smoothedPoints[i];
      const next = smoothedPoints[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      pathParts.push(`Q${current.x},${current.y} ${midX},${midY}`);
    }
    
    // Final point
    const lastPoint = smoothedPoints[smoothedPoints.length - 1];
    pathParts.push(`L${lastPoint.x},${lastPoint.y}`);
    
    return pathParts.join(" ");
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

  const formatCurrentTime = (position: number) => {
    const startSeconds = 3 * 60 + 25; // 3:25
    const endSeconds = 4 * 60 + 17; // 4:17
    const currentSeconds = startSeconds + (position / 100) * (endSeconds - startSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative h-64 bg-gradient-to-b from-transparent to-red-950/5 rounded-xl border border-amber-200/30 overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full timeline-svg"
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
        onClick={handleSvgClick}
      >
        {/* Subtle highlighting for climax areas */}
        <rect
          x="176"
          y="0"
          width="48"
          height="180"
          fill="url(#mainClimaxGradient)"
          opacity="0.15"
          rx="4"
        />
        <rect
          x="304"
          y="0"
          width="32"
          height="180"
          fill="url(#secondaryClimaxGradient)"
          opacity="0.1"
          rx="4"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="mainClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b2942" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="#8b2942" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#8b2942" stopOpacity="0.1"/>
          </linearGradient>
          <linearGradient id="secondaryClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b8860b" stopOpacity="0.15"/>
            <stop offset="50%" stopColor="#b8860b" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#b8860b" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        
        {/* Baseline (median recording range) */}
        <path
          d="M0,172 L400,172"
          stroke="#666"
          fill="none"
          strokeWidth="3"
          opacity="0.5"
        />
        
        {/* Dynamically generated variance paths - 6 different interpretations */}
        <path
          d={variancePaths.rubinstein}
          stroke="#d63384"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
        />
        
        <path
          d={variancePaths.horowitz}
          stroke="#b8860b"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
        />
        
        <path
          d={variancePaths.pires}
          stroke="#2e8b57"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
        />
        
        <path
          d={variancePaths.richter}
          stroke="#8b4513"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
        />
        
        <path
          d={variancePaths.pollini}
          stroke="#4169e1"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
        />
        
        <path
          d={variancePaths.ashkenazy}
          stroke="#9932cc"
          fill="none"
          strokeWidth="1.5"
          opacity="0.75"
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
            y2="174"
            stroke="hsl(var(--accent))"
            strokeWidth="2.5"
            strokeDasharray="4,2"
          />
          <circle
            cx={playheadX}
            cy="172"
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
          {/* Current time display attached to playhead */}
          <rect
            x={playheadX - 18}
            y="178"
            width="36"
            height="16"
            fill="hsl(var(--accent))"
            rx="8"
            opacity="0.9"
          />
          <text
            x={playheadX}
            y="188"
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontFamily="Source Sans Pro, sans-serif"
            fontWeight="600"
          >
            {formatCurrentTime(timelineState.currentPosition)}
          </text>
          
          {/* Invisible hit area for easier dragging */}
          <rect
            x={playheadX - 8}
            y="0"
            width="16"
            height="180"
            fill="transparent"
            className="playhead-hitarea"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </g>
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 font-sans-custom text-xs text-stone-600 opacity-70 h-6 items-center bg-gradient-to-t from-amber-50/90 to-transparent">
        <span>3:25</span>
        <span>4:17</span>
      </div>
    </div>
  );
}
