import { useState, useRef, useCallback, useEffect } from 'react';
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
    
    // Check if in climax area (narrow range where variance peaks)
    const isInClimaxArea = percentage > 45 && percentage < 55;
    if (isInClimaxArea && !timelineState.isRecordingsSectionVisible) {
      onInteractionStart();
      setTimelineState(prev => ({
        ...prev,
        hasInteracted: true,
        isRecordingsSectionVisible: true
      }));
    } else if (!isInClimaxArea && timelineState.isRecordingsSectionVisible) {
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
          d="M0,120 Q100,118 200,120 T400,120"
          stroke="#888"
          fill="none"
          strokeWidth="6"
          opacity="0.6"
        />
        
        {/* Individual interpretation lines extending upward */}
        {/* Rubinstein (red) - dramatic peaks at climax */}
        <path
          d="M0,120 Q50,105 100,90 Q150,60 200,45 Q250,70 300,100 Q350,110 400,115"
          stroke="hsl(var(--accent))"
          fill="none"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Horowitz (gold) - more controlled variation */}
        <path
          d="M0,120 Q50,112 100,105 Q150,75 200,65 Q250,82 300,102 Q350,115 400,118"
          stroke="#b8860b"
          fill="none"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Pires (teal) - subtle, nuanced interpretation */}
        <path
          d="M0,120 Q50,116 100,108 Q150,85 200,80 Q250,92 300,108 Q350,118 400,120"
          stroke="#2e8b57"
          fill="none"
          strokeWidth="2"
          opacity="0.8"
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
