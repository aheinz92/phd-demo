import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TimelineState } from '@/types/music';
import './InteractiveTimeline.css'; // Import the new CSS file

interface InteractiveTimelineProps {
  onPositionChange: (position: number) => void;
  onInteractionStart: () => void;
  activeGraphLineId?: string | null; // Added to receive hovered line ID
  className?: string;
  titleText?: string; // New prop for the title
}

export function InteractiveTimeline({
  onPositionChange,
  onInteractionStart,
  activeGraphLineId = null, // Default to null
  className = "",
  titleText // Destructure the new prop
}: InteractiveTimelineProps) {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentPosition: 30,
    isDragging: false,
    hasInteracted: false,
    isRecordingsSectionVisible: false
  });

  const timelineStateRef = useRef(timelineState);
  useEffect(() => {
    timelineStateRef.current = timelineState;
  }, [timelineState]);

  const svgRef = useRef<SVGSVGElement>(null);
  const playheadGroupRef = useRef<SVGGElement>(null);
  const [effectiveViewBoxWidth, setEffectiveViewBoxWidth] = useState(400);

  // Define ViewBox constants
  const VIEWBOX_MIN_Y = 20; // Align with top playhead marker
  const VIEWBOX_HEIGHT = 172; // Prev height 184 - (20 - 8) = 172. Keeps bottom edge at 192.

  // Define climax areas (percentages)
  const MAIN_CLIMAX_AREA = useMemo(() => ({ start: 44, end: 56, center: 50 }), []);
  const SECONDARY_CLIMAX_AREA = useMemo(() => ({ start: 76, end: 84, center: 80 }), []);


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
    rubinstein: generateVariancePath(effectiveViewBoxWidth, 1.0, 1.2),
    horowitz: generateVariancePath(effectiveViewBoxWidth, 0.85, 2.8),
    pires: generateVariancePath(effectiveViewBoxWidth, 0.6, 4.1),
    richter: generateVariancePath(effectiveViewBoxWidth, 0.75, 6.7),
    pollini: generateVariancePath(effectiveViewBoxWidth, 0.8, 8.3),
    ashkenazy: generateVariancePath(effectiveViewBoxWidth, 0.65, 9.9)
  }), [generateVariancePath, effectiveViewBoxWidth]);

  const updatePlayheadPosition = useCallback((clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();

    // Determine the effective viewBox width to make content fill the SVG area
    const svgElementWidth = rect.width;
    const svgElementHeight = rect.height;
    let newViewBoxWidth = 400; // Default
    if (svgElementHeight > 0) { // Avoid division by zero
        // Maintain a viewBox height of VIEWBOX_HEIGHT, adjust width based on element aspect ratio
        newViewBoxWidth = (svgElementWidth / svgElementHeight) * VIEWBOX_HEIGHT;
    }
    if (newViewBoxWidth !== effectiveViewBoxWidth) {
      setEffectiveViewBoxWidth(newViewBoxWidth);
    }

    const viewBoxMeta = { width: newViewBoxWidth, height: VIEWBOX_HEIGHT };
    const rectAspectRatio = rect.width / rect.height;
    const viewBoxAspectRatio = viewBoxMeta.width / viewBoxMeta.height;

    let visualContentWidth: number;
    let visualPaddingLeft: number;

    if (rect.width === 0 || rect.height === 0) {
      // Avoid division by zero or incorrect calculations if SVG isn't rendered yet
      return;
    }

    if (rectAspectRatio > viewBoxAspectRatio) {
      const scale = rect.height / viewBoxMeta.height;
      visualContentWidth = viewBoxMeta.width * scale;
      visualPaddingLeft = (rect.width - visualContentWidth) / 2;
    } else { // Covers letterboxed and matching aspect ratios
      visualContentWidth = rect.width;
      visualPaddingLeft = 0;
    }

    const mouseXRelativeToVisualSvg = clientX - rect.left - visualPaddingLeft;
    // currentSvgX is now in the coordinate system of the newViewBoxWidth
    const currentSvgX = visualContentWidth > 0 ? (mouseXRelativeToVisualSvg / visualContentWidth) * newViewBoxWidth : 0;
    
    // Clamp based on 2.5% padding on each side of the newViewBoxWidth
    const padding = newViewBoxWidth * 0.025;
    const clampedX = Math.max(padding, Math.min(newViewBoxWidth - padding, currentSvgX));
    const percentage = newViewBoxWidth > 0 ? (clampedX / newViewBoxWidth) * 100 : 0;
    
    setTimelineState(prev => ({
      ...prev,
      currentPosition: percentage
    }));
    
    onPositionChange(percentage);
    
    setTimelineState(prev => {
      const isInMainClimaxArea = percentage > MAIN_CLIMAX_AREA.start && percentage < MAIN_CLIMAX_AREA.end;
      const isInSecondaryClimaxArea = percentage > SECONDARY_CLIMAX_AREA.start && percentage < SECONDARY_CLIMAX_AREA.end;
      const isInAnyClimaxArea = isInMainClimaxArea || isInSecondaryClimaxArea;

      let newHasInteracted = prev.hasInteracted;
      let newIsRecordingsSectionVisible = prev.isRecordingsSectionVisible;
      let shouldCallOnInteractionStart = false;

      if (isInAnyClimaxArea && !prev.isRecordingsSectionVisible) { // Becoming visible
        if (!prev.hasInteracted) { // First time interaction leading to visibility
           shouldCallOnInteractionStart = true;
        }
        newHasInteracted = true;
        newIsRecordingsSectionVisible = true;
      } else if (!isInAnyClimaxArea && prev.isRecordingsSectionVisible) { // Becoming hidden
        newIsRecordingsSectionVisible = false;
      }
      
      if (shouldCallOnInteractionStart) {
          onInteractionStart();
      }

      return {
        ...prev,
        currentPosition: percentage,
        hasInteracted: newHasInteracted,
        isRecordingsSectionVisible: newIsRecordingsSectionVisible,
      };
    });
  }, [onPositionChange, onInteractionStart, effectiveViewBoxWidth, MAIN_CLIMAX_AREA, SECONDARY_CLIMAX_AREA]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (playheadGroupRef.current) {
      // playheadGroupRef.current.style.transform = 'scale(1.1)'; // Removed to prevent floating effect
    }
    updatePlayheadPosition(e.clientX);
  }, [updatePlayheadPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (timelineState.isDragging) {
      e.preventDefault();
      updatePlayheadPosition(e.clientX);
    }
  }, [updatePlayheadPosition]); // timelineState.isDragging is accessed via timelineStateRef in the effect

  const handleInteractionEnd = useCallback(() => {
    const currentTimelineState = timelineStateRef.current;
    if (!currentTimelineState.isDragging) return;

    const { currentPosition: droppedPosition, isRecordingsSectionVisible: prevIsVisible, hasInteracted: prevHasInteracted } = currentTimelineState;

    let snapToPercentage: number | null = null;
    if (droppedPosition > MAIN_CLIMAX_AREA.start && droppedPosition < MAIN_CLIMAX_AREA.end) {
      snapToPercentage = MAIN_CLIMAX_AREA.center;
    } else if (droppedPosition > SECONDARY_CLIMAX_AREA.start && droppedPosition < SECONDARY_CLIMAX_AREA.end) {
      snapToPercentage = SECONDARY_CLIMAX_AREA.center;
    }

    if (snapToPercentage !== null) {
      const finalPosition = snapToPercentage;

      const finalIsInMain = finalPosition > MAIN_CLIMAX_AREA.start && finalPosition < MAIN_CLIMAX_AREA.end;
      const finalIsInSecondary = finalPosition > SECONDARY_CLIMAX_AREA.start && finalPosition < SECONDARY_CLIMAX_AREA.end;
      const finalIsInAny = finalIsInMain || finalIsInSecondary;

      let shouldCallOnInteractionStart = false;
      if (finalIsInAny && !prevIsVisible) {
          if (!prevHasInteracted) {
              shouldCallOnInteractionStart = true;
          }
      }
      
      if (shouldCallOnInteractionStart) {
          onInteractionStart();
      }

      setTimelineState(prev => ({
        ...prev,
        isDragging: false,
        currentPosition: finalPosition,
        isRecordingsSectionVisible: finalIsInAny,
        hasInteracted: prev.hasInteracted || finalIsInAny,
      }));
      onPositionChange(finalPosition);
    } else {
      setTimelineState(prev => ({ ...prev, isDragging: false }));
    }
  }, [onPositionChange, onInteractionStart, MAIN_CLIMAX_AREA, SECONDARY_CLIMAX_AREA]);


  const handleMouseUp = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (playheadGroupRef.current) {
      // playheadGroupRef.current.style.transform = 'scale(1.1)'; // Removed to prevent floating effect
    }
    updatePlayheadPosition(e.touches[0].clientX);
  }, [updatePlayheadPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Access isDragging via ref for stability if this callback is memoized with fewer deps
    if (timelineStateRef.current.isDragging && e.touches.length > 0) {
      e.preventDefault();
      updatePlayheadPosition(e.touches[0].clientX);
    }
  }, [updatePlayheadPosition]);

  const handleTouchEnd = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    updatePlayheadPosition(e.clientX);
  }, [updatePlayheadPosition]);

  const handleSvgTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (e.touches.length > 0) {
      updatePlayheadPosition(e.touches[0].clientX);
    }
  }, [updatePlayheadPosition]);

  // Set up global event listeners
  useEffect(() => {
    // Initial calculation of effectiveViewBoxWidth on mount
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgElementWidth = rect.width;
      const svgElementHeight = rect.height;
      if (svgElementHeight > 0) {
        const newInitialWidth = (svgElementWidth / svgElementHeight) * VIEWBOX_HEIGHT;
        setEffectiveViewBoxWidth(newInitialWidth);
      }
    }

    const stableHandleMouseMove = (e: MouseEvent) => {
      if (timelineStateRef.current.isDragging) {
        handleMouseMove(e);
      }
    };
    const stableHandleTouchMove = (e: TouchEvent) => {
      if (timelineStateRef.current.isDragging && e.touches.length > 0) {
        handleTouchMove(e);
      }
    };

    document.addEventListener('mousemove', stableHandleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', stableHandleTouchMove, { passive: false }); // passive: false if preventDefault is used
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', stableHandleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', stableHandleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, VIEWBOX_HEIGHT]); // Added VIEWBOX_HEIGHT dependency
 
  const playheadX = (timelineState.currentPosition / 100) * effectiveViewBoxWidth;

  const formatCurrentTime = (position: number) => {
    const startSeconds = 3 * 60 + 25; // 3:25
    const endSeconds = 4 * 60 + 17; // 4:17
    const currentSeconds = startSeconds + (position / 100) * (endSeconds - startSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`timeline-container ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full timeline-svg"
        viewBox={`0 ${VIEWBOX_MIN_Y} ${effectiveViewBoxWidth} ${VIEWBOX_HEIGHT}`} // Use defined constants
        preserveAspectRatio="xMidYMid meet" // This will ensure content scales correctly with new viewBox
        onMouseDown={handleSvgMouseDown}
        onTouchStart={handleSvgTouchStart}
      >
        {/* Subtle highlighting for climax areas - These will need adjustment based on effectiveViewBoxWidth */}
        {/* For now, let's use percentages of effectiveViewBoxWidth for x and width */}
        <rect
          x={effectiveViewBoxWidth * 0.44} // Corresponds to 176/400
          y="0"
          width={effectiveViewBoxWidth * 0.12} // Corresponds to 48/400
          height="172"
          fill="url(#mainClimaxGradient)"
          opacity="0.3"
        />
        <rect
          x={effectiveViewBoxWidth * 0.76} // Corresponds to 304/400
          y="0"
          width={effectiveViewBoxWidth * 0.08} // Corresponds to 32/400
          height="172"
          fill="url(#secondaryClimaxGradient)"
          opacity="0.25"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="mainClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b2942" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#8b2942" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#8b2942" stopOpacity="0.2"/>
          </linearGradient>
          <linearGradient id="secondaryClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78716c" stopOpacity="0.25"/> {/* stone-500 */}
            <stop offset="50%" stopColor="#78716c" stopOpacity="0.5"/> {/* stone-500 */}
            <stop offset="100%" stopColor="#78716c" stopOpacity="0.15"/> {/* stone-500 */}
          </linearGradient>
        </defs>
        
        {/* Baseline (median recording range) */}
        <path
          d={`M0,172 L${effectiveViewBoxWidth},172`}
          stroke="#666"
          fill="none"
          strokeWidth="1.5"
          opacity="0.5"
        />
        
        {/* Dynamically generated variance paths - 6 different interpretations */}
        <path
          d={variancePaths.rubinstein}
          stroke="#d63384"
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#d63384" ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        <path
          d={variancePaths.horowitz}
          stroke="#57534e" /* Changed from #b8860b to stone-600 (gray) */
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#57534e" ? 1 : 0.2} /* Updated ID here */
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        <path
          d={variancePaths.pires}
          stroke="#2e8b57"
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#2e8b57" ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        <path
          d={variancePaths.richter}
          stroke="#8b4513"
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#8b4513" ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        <path
          d={variancePaths.pollini}
          stroke="#4169e1"
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#4169e1" ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        <path
          d={variancePaths.ashkenazy}
          stroke="#9932cc"
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#9932cc" ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        
        {/* Interactive Playhead */}
        <g
          ref={playheadGroupRef}
          className={`playhead-group ${timelineState.isDragging ? 'playhead-marker-active' : ''}`}
          onMouseEnter={() => {
            if (playheadGroupRef.current) {
              playheadGroupRef.current.classList.add('playhead-marker-active');
            }
          }}
          onMouseLeave={() => {
            if (playheadGroupRef.current && !timelineState.isDragging) {
              playheadGroupRef.current.classList.remove('playhead-marker-active');
            }
          }}
        >
          <line
            x1={playheadX}
            y1="25.2"
            x2={playheadX}
            y2="166.1"
            stroke="#8b2942"
            strokeWidth="0.5"
            strokeDasharray="4,4.1"
            opacity="0.6"
          />
          {/* Bottom Marker (pointing upwards) */}
          <PlayheadMarkerIcon x={playheadX - 5} y={144.5} rotation={180} width={10} height={12.5} />
          {/* Top Marker (pointing downwards) */}
          <PlayheadMarkerIcon x={playheadX - 5} y={20} rotation={0} width={10} height={12.5} />
          
          {/* Current time display attached to playhead */}
          <text
            x={playheadX}
            y="38"
            textAnchor="middle"
            className="playhead-time-text" // Added class for styling
          >
            {formatCurrentTime(timelineState.currentPosition)}
          </text>
          
          {/* Invisible hit area for easier dragging */}
          <rect
            x={playheadX - 16}
            y="0"
            width="32"
            height="180"
            fill="transparent"
            className="playhead-hitarea"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </g>

        {/* Interpretive Variance Title */}
        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.423} // Positioned near the left padding
            y="185" // Positioned below the top playhead circle, adjust as needed
            textAnchor="start" // Align text to the start (left)
            className="timeline-title" // Added class for styling
          >
            {titleText}
          </text>
        )}
        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.013} // Positioned near the left padding
            y="185" // Positioned below the top playhead circle, adjust as needed
            textAnchor="start" // Align text to the start (left)
            className="timeline-time-display" // Added class for styling
          >
            3:25
          </text>
        )}
        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.95} // Positioned near the left padding
            y="185" // Positioned below the top playhead circle, adjust as needed
            textAnchor="start" // Align text to the start (left)
            className="timeline-time-display" // Added class for styling
          >
            4:17
          </text>
        )}
      </svg>
    </div>
  );
}

// New SVG Marker Component
interface PlayheadMarkerIconProps {
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
}

const PlayheadMarkerIcon = ({ x, y, rotation = 0, width = 10, height = 12.5 }: PlayheadMarkerIconProps) => {
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 20 25" // New viewBox "0 0 20 25"
      xmlns="http://www.w3.org/2000/svg"
      className="playhead-marker"
      style={{ overflow: 'visible' }}
    >
      {/* Rotate group around center of new viewBox (10, 12.5) */}
      <g transform={`rotate(${rotation} 10 26.8)`}>
        {/* New SVG path for the marker */}
        <path d="M 9 10.5 L 3 4 L 3 0 L 17 0 L 17 4 L 11 10.5 Z" fill="currentColor"/>
      </g>
    </svg>
  );
};
