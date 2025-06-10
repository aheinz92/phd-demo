import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TimelineState } from '@/types/music';
import './InteractiveTimeline.css'; // Import the new CSS file

interface InteractiveTimelineProps {
  onPositionChange: (update: { position: number; activeSection: 'A' | 'B' | null }) => void;
  onInteractionStart: (activeSection: 'A' | 'B' | null) => void;
  activeGraphLineId?: string | null;
  className?: string;
  titleText?: string;
  isAudioPlaying?: boolean;
  audioDuration?: number; // in seconds
  playingAudioSection?: 'A' | 'B' | null;
  onPlaybackInterruption?: () => void;
}

export function InteractiveTimeline({
  onPositionChange,
  onInteractionStart,
  activeGraphLineId = null,
  className = "",
  titleText,
  isAudioPlaying = false,
  audioDuration = 0,
  playingAudioSection = null,
  onPlaybackInterruption,
}: InteractiveTimelineProps) {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentPosition: 30,
    isDragging: false,
    hasInteracted: false,
    isRecordingsSectionVisible: false,
    activeTimelineSection: null,
    isAnimatingPlayhead: false,
    animationPhase: 'idle', // Initialize animationPhase
  });

  const teleportTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For the new phase
  // const [isAnimatingPlayhead, setIsAnimatingPlayhead] = useState(false); // Removed
  const [animatedPlayheadPosition, setAnimatedPlayheadPosition] = useState(0);

  const timelineStateRef = useRef(timelineState);
  useEffect(() => {
    timelineStateRef.current = timelineState;
  }, [timelineState]);
const isAudioPlayingPropRef = useRef(isAudioPlaying);
  useEffect(() => {
    isAudioPlayingPropRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  const svgRef = useRef<SVGSVGElement>(null);
  const playheadGroupRef = useRef<SVGGElement>(null);
  const [effectiveViewBoxWidth, setEffectiveViewBoxWidth] = useState(400);

  const VIEWBOX_MIN_Y = 20; 
  const VIEWBOX_HEIGHT = 172; 

  const MAIN_CLIMAX_AREA = useMemo(() => ({ start: 43, end: 61, center: 52 }), []); // Later one for 'B'
  const SECONDARY_CLIMAX_AREA = useMemo(() => ({ start: 14, end: 28, center: 21 }), []); // Earlier one for 'A'

  const generateVariancePath = useCallback((
    width: number,
    intensity: number,
    seed: number 
  ): string => {
    const numPoints = 70; 
    const rawPoints: { x: number; y: number }[] = [];
    const baseline = 180; 
    const mainClimaxCenter = 45; 
    const mainClimaxWidth = 12; 
    const secondaryClimaxCenter = 77.5; 
    const secondaryClimaxWidth = 17; 
    
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index * 1234) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i <= numPoints; i++) {
      const x = width - ((width * i) / numPoints);
      const xPercent = (i / numPoints) * 100;
      
      const distanceFromMainClimax = Math.abs(xPercent - mainClimaxCenter);
      const distanceFromSecondaryClimax = Math.abs(xPercent - secondaryClimaxCenter);
      
      let varianceFactor = 0.08 + (seededRandom(i) * 0.42); 
      
      if (distanceFromMainClimax < mainClimaxWidth) {
        const mainClimaxIntensity = 1 - (distanceFromMainClimax / mainClimaxWidth);
        varianceFactor += mainClimaxIntensity * 1.2;
      }
      
      if (distanceFromSecondaryClimax < secondaryClimaxWidth) {
        const secondaryClimaxIntensity = 1 - (distanceFromSecondaryClimax / secondaryClimaxWidth);
        varianceFactor += secondaryClimaxIntensity * 0.6;
      }
      
      const musicianVariance = seededRandom(i + 100) * 0.25;
      const finalVariance = (varianceFactor + musicianVariance) * intensity;
      
      const y = baseline - Math.max(0.5, finalVariance * 95);
      
      rawPoints.push({ x, y });
    }
    
    const smoothedPoints = rawPoints.map((point, i) => {
      if (i === 0 || i === rawPoints.length - 1) return point;
      const prev = rawPoints[i - 1];
      const next = rawPoints[i + 1];
      return {
        x: point.x,
        y: (prev.y + point.y + next.y) / 3 
      };
    });
    
    const pathParts = [`M${smoothedPoints[0].x},${smoothedPoints[0].y}`];
    for (let i = 1; i < smoothedPoints.length - 1; i++) {
      const current = smoothedPoints[i];
      const next = smoothedPoints[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      pathParts.push(`Q${current.x},${current.y} ${midX},${midY}`);
    }
    const lastPoint = smoothedPoints[smoothedPoints.length - 1];
    pathParts.push(`L${lastPoint.x},${lastPoint.y}`);
    return pathParts.join(" ");
  }, []);

  const variancePaths = useMemo(() => ({
    rubinstein: generateVariancePath(effectiveViewBoxWidth, 1.0, 1.2),
    horowitz: generateVariancePath(effectiveViewBoxWidth, 0.85, 2.8),
    pires: generateVariancePath(effectiveViewBoxWidth, 0.6, 4.1),
    richter: generateVariancePath(effectiveViewBoxWidth, 0.75, 6.7),
    pollini: generateVariancePath(effectiveViewBoxWidth, 0.8, 8.3),
    ashkenazy: generateVariancePath(effectiveViewBoxWidth, 0.65, 9.9)
  }), [generateVariancePath, effectiveViewBoxWidth]);

  const updatePlayheadPosition = useCallback((clientX: number) => {
    if (timelineStateRef.current.isAnimatingPlayhead) { // Use ref for current state in callback
      
      onPlaybackInterruption?.();

      // Clear all animation-related timeouts
      if (teleportTimeoutRef.current) {
        clearTimeout(teleportTimeoutRef.current);
        teleportTimeoutRef.current = null;
      }
      if (animationTriggerTimeoutRef.current) {
        clearTimeout(animationTriggerTimeoutRef.current);
        animationTriggerTimeoutRef.current = null;
      }
      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current);
        animationEndTimeoutRef.current = null;
      }

      // Immediately reset transition styles on the playhead group
      if (playheadGroupRef.current && playheadGroupRef.current.style) {
        playheadGroupRef.current.style.transitionProperty = 'none';
        playheadGroupRef.current.style.transitionDuration = '0s';
        playheadGroupRef.current.style.transitionTimingFunction = '';
        // playheadGroupRef.current.style.transform = ''; // Optional: Reset transform if needed, but new position should override 
      }

      // Force animation state to idle and stop animation
      setTimelineState(prev => ({
        ...prev,
        isAnimatingPlayhead: false,
        animationPhase: 'idle', // Crucially reset the phase
      }));
    } else if (isAudioPlayingPropRef.current) {
      // If not animating but audio is playing according to props, user interaction should still interrupt.
      onPlaybackInterruption?.();
      // No need to change animationPhase here as it should already be idle or not relevant.
    }

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgElementWidth = rect.width;
    const svgElementHeight = rect.height;
    let newViewBoxWidth = 400; 
    if (svgElementHeight > 0) {
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

    if (rect.width === 0 || rect.height === 0) return;

    if (rectAspectRatio > viewBoxAspectRatio) {
      const scale = rect.height / viewBoxMeta.height;
      visualContentWidth = viewBoxMeta.width * scale;
      visualPaddingLeft = (rect.width - visualContentWidth) / 2;
    } else { 
      visualContentWidth = rect.width;
      visualPaddingLeft = 0;
    }

    const mouseXRelativeToVisualSvg = clientX - rect.left - visualPaddingLeft;
    const currentSvgX = visualContentWidth > 0 ? (mouseXRelativeToVisualSvg / visualContentWidth) * newViewBoxWidth : 0;
    
    const padding = newViewBoxWidth * 0.025;
    const clampedX = Math.max(padding, Math.min(newViewBoxWidth - padding, currentSvgX));
    const percentage = newViewBoxWidth > 0 ? (clampedX / newViewBoxWidth) * 100 : 0;
    
    let activeSection: 'A' | 'B' | null = null;
    if (percentage > SECONDARY_CLIMAX_AREA.start && percentage < SECONDARY_CLIMAX_AREA.end) {
      activeSection = 'A'; 
    } else if (percentage > MAIN_CLIMAX_AREA.start && percentage < MAIN_CLIMAX_AREA.end) {
      activeSection = 'B';
    }
    onPositionChange({ position: percentage, activeSection });

    const newIsRecordingsSectionVisible = activeSection !== null;
    const previousState = timelineStateRef.current; 
    let shouldCallInteractionStartFlag = false;

    if (newIsRecordingsSectionVisible && !previousState.isRecordingsSectionVisible && !previousState.hasInteracted) {
      onInteractionStart(activeSection); 
      shouldCallInteractionStartFlag = true; 
    }

    setTimelineState(prev => ({
      ...prev,
      currentPosition: percentage,
      isRecordingsSectionVisible: newIsRecordingsSectionVisible,
      activeTimelineSection: activeSection, // Correctly update local state
      hasInteracted: prev.hasInteracted || shouldCallInteractionStartFlag,
    }));
  }, [onPositionChange, onInteractionStart, effectiveViewBoxWidth, MAIN_CLIMAX_AREA, SECONDARY_CLIMAX_AREA, VIEWBOX_HEIGHT, onPlaybackInterruption]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    updatePlayheadPosition(e.clientX);
  }, [updatePlayheadPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (timelineStateRef.current.isDragging) { // Use ref to get current dragging state
      e.preventDefault();
      updatePlayheadPosition(e.clientX);
    }
  }, [updatePlayheadPosition]); 

  const handleInteractionEnd = useCallback(() => {
    const previousState = timelineStateRef.current; 
    if (!previousState.isDragging) return;

    const { currentPosition: droppedPosition } = previousState;

    let snapToPercentage: number | null = null;
    let activeSectionOnSnap: 'A' | 'B' | null = null;

    // Check SECONDARY_CLIMAX_AREA (earlier one, for 'A') first
    if (droppedPosition > SECONDARY_CLIMAX_AREA.start && droppedPosition < SECONDARY_CLIMAX_AREA.end) {
      snapToPercentage = SECONDARY_CLIMAX_AREA.center;
      activeSectionOnSnap = 'A';
    } else if (droppedPosition > MAIN_CLIMAX_AREA.start && droppedPosition < MAIN_CLIMAX_AREA.end) {
      // Then check MAIN_CLIMAX_AREA (later one, for 'B')
      snapToPercentage = MAIN_CLIMAX_AREA.center;
      activeSectionOnSnap = 'B';
    }

    if (snapToPercentage !== null) {
      const finalPosition = snapToPercentage;
      const newIsRecordingsSectionVisible = activeSectionOnSnap !== null;
      
      let shouldCallInteractionStartFlag = false;
      if (newIsRecordingsSectionVisible && !previousState.isRecordingsSectionVisible && !previousState.hasInteracted) {
        onInteractionStart(activeSectionOnSnap); 
        shouldCallInteractionStartFlag = true;
      }

      setTimelineState(prev => ({
        ...prev,
        isDragging: false,
        currentPosition: finalPosition,
        isRecordingsSectionVisible: newIsRecordingsSectionVisible,
        activeTimelineSection: activeSectionOnSnap,
        hasInteracted: prev.hasInteracted || shouldCallInteractionStartFlag,
      }));
      onPositionChange({ position: finalPosition, activeSection: activeSectionOnSnap });
    } else {
      setTimelineState(prev => ({
        ...prev,
        isDragging: false,
        activeTimelineSection: null,
        isRecordingsSectionVisible: false
      }));
      onPositionChange({ position: droppedPosition, activeSection: null });
    }
  }, [onPositionChange, onInteractionStart, MAIN_CLIMAX_AREA, SECONDARY_CLIMAX_AREA]);


  const handleMouseUp = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    updatePlayheadPosition(e.touches[0].clientX);
  }, [updatePlayheadPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
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

  const handleSvgTouchStart = useCallback((event: React.TouchEvent) => {
    // Direct cast to native TouchEvent if needed by addEventListener,
    // but React.TouchEvent should be compatible enough for clientX.
    // The preventDefault is the key part for passive listener issue.
    event.preventDefault(); 
    setTimelineState(prev => ({ ...prev, isDragging: true }));
    if (event.touches.length > 0) {
      updatePlayheadPosition(event.touches[0].clientX);
    }
  }, [updatePlayheadPosition]);
 
  useEffect(() => {
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
    
    const svgElement = svgRef.current;

    document.addEventListener('mousemove', stableHandleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', stableHandleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    if (svgElement) {
      // Cast to EventListener for addEventListener compatibility
      svgElement.addEventListener('touchstart', handleSvgTouchStart as unknown as EventListener, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', stableHandleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', stableHandleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (svgElement) {
        svgElement.removeEventListener('touchstart', handleSvgTouchStart as unknown as EventListener);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, VIEWBOX_HEIGHT, handleSvgTouchStart]); 
 
// Removed isAnimatingPlayheadRef as direct state check is preferred.
// const isAnimatingPlayheadRef = useRef(isAnimatingPlayhead);
// useEffect(() => {
//   isAnimatingPlayheadRef.current = isAnimatingPlayhead;
// }, [isAnimatingPlayhead]);

const animationTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationEndTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Renamed for clarity

  // Effect to initiate or stop animation based on audio state from props
  useEffect(() => {
    if (isAudioPlaying && audioDuration > 0 && playingAudioSection) {
      // Only start if currently idle or stopping (to allow restart after interruption)
      if (timelineState.animationPhase === 'idle' || timelineState.animationPhase === 'stopping') {
        console.log(`[InteractiveTimeline] Audio detected playing. Phase: ${timelineState.animationPhase} -> starting. Section: ${playingAudioSection}`);
        const targetSectionDetails = playingAudioSection === 'A' ? SECONDARY_CLIMAX_AREA : MAIN_CLIMAX_AREA;
        
        // Update main timeline state to reflect animation starting
        setTimelineState(prev => ({
          ...prev,
          currentPosition: targetSectionDetails.start, // Snap visual position to start
          activeTimelineSection: playingAudioSection,
          isRecordingsSectionVisible: true,
          isDragging: false,
          isAnimatingPlayhead: true, // Mark as animating
          animationPhase: 'teleportingToStart', // Transition to new intermediate phase
        }));
        // Inform parent about the position change
        onPositionChange({ position: targetSectionDetails.start, activeSection: playingAudioSection });
        // Set the specific state that drives the playhead's visual X coordinate for animation
        setAnimatedPlayheadPosition(targetSectionDetails.start);
      }
    } else {
      // Audio is not playing, or parameters are invalid. If an animation is running, transition to 'stopping'.
      if (timelineState.isAnimatingPlayhead && timelineState.animationPhase !== 'stopping' && timelineState.animationPhase !== 'idle') {
        setTimelineState(prev => ({ ...prev, animationPhase: 'stopping' }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, audioDuration, playingAudioSection]); // Dependencies: props that control audio state. MAIN_CLIMAX_AREA etc are stable. onPositionChange is stable.

  // Effect to manage animation steps based on animationPhase
  useEffect(() => {
    const cleanupTimeoutsAndStyles = (resetPhaseToIdle = false) => {
      if (teleportTimeoutRef.current) clearTimeout(teleportTimeoutRef.current);
      if (animationTriggerTimeoutRef.current) clearTimeout(animationTriggerTimeoutRef.current);
      if (animationEndTimeoutRef.current) clearTimeout(animationEndTimeoutRef.current);
      teleportTimeoutRef.current = null;
      animationTriggerTimeoutRef.current = null;
      animationEndTimeoutRef.current = null;

      if (playheadGroupRef.current && playheadGroupRef.current.style) {
        playheadGroupRef.current.style.transitionProperty = '';
        playheadGroupRef.current.style.transitionDuration = '';
        playheadGroupRef.current.style.transitionTimingFunction = '';
        playheadGroupRef.current.style.transform = ''; // Reset transform
      }
      if (resetPhaseToIdle) {
        setTimelineState(prev => ({ ...prev, isAnimatingPlayhead: false, animationPhase: 'idle' }));
      }
    };

    if (timelineState.animationPhase === 'teleportingToStart') {
      const targetSectionDetails = playingAudioSection === 'A' ? SECONDARY_CLIMAX_AREA : MAIN_CLIMAX_AREA;
      if (playheadGroupRef.current && playheadGroupRef.current.style && targetSectionDetails) {
        // Remove transition to ensure immediate jump
        playheadGroupRef.current.style.transitionProperty = 'none';
        playheadGroupRef.current.style.transitionDuration = '0s';
        
        // animatedPlayheadPosition should already be targetSectionDetails.start from the audio watcher
        // but we ensure the transform is applied directly for this "teleport"
        const initialX = (targetSectionDetails.start / 100) * effectiveViewBoxWidth;
        playheadGroupRef.current.style.transform = `translateX(${initialX}px)`;

        // Force a reflow after direct style manipulation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = playheadGroupRef.current.getBBox();

        if (teleportTimeoutRef.current) clearTimeout(teleportTimeoutRef.current);
        teleportTimeoutRef.current = setTimeout(() => {
          if (timelineStateRef.current.isAnimatingPlayhead && timelineStateRef.current.animationPhase === 'teleportingToStart') {
            setTimelineState(prev => ({ ...prev, animationPhase: 'starting' }));
          } else {
            console.log('[InteractiveTimeline] Teleport timeout: Animation no longer in "teleportingToStart" or not animating. Aborting transition to "starting".');
          }
        }, 0); // 0ms delay
      } else {
        console.warn('[InteractiveTimeline] Phase: teleportingToStart - Missing details for teleport. Reverting to idle.');
        cleanupTimeoutsAndStyles(true);
      }
    } else if (timelineState.animationPhase === 'starting') {
      const targetSectionDetails = playingAudioSection === 'A' ? SECONDARY_CLIMAX_AREA : MAIN_CLIMAX_AREA;
      
      if (playheadGroupRef.current && playheadGroupRef.current.style && targetSectionDetails && audioDuration > 0) {
        playheadGroupRef.current.style.transitionProperty = 'transform';
        playheadGroupRef.current.style.transitionDuration = `${audioDuration}s`;
        playheadGroupRef.current.style.transitionTimingFunction = 'linear';
        
        if (animationTriggerTimeoutRef.current) clearTimeout(animationTriggerTimeoutRef.current);
        animationTriggerTimeoutRef.current = setTimeout(() => {
          // Check ref for isAnimatingPlayhead, as state might be stale in timeout
          const currentPhaseFromRef = timelineStateRef.current.animationPhase;
          const isAnimatingFromRef = timelineStateRef.current.isAnimatingPlayhead;

          if (isAnimatingFromRef && currentPhaseFromRef === 'starting') {
            // Force a reflow to try and ensure styles are applied before animation starts
            if (playheadGroupRef.current) {
              // Accessing getBBox() can trigger a reflow for SVG elements
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const _ = playheadGroupRef.current.getBBox(); // Force reflow
            }
            // The state update to animatedPlayheadPosition will cause playheadX to update,
            // which in turn updates the transform style on playheadGroupRef, triggering the animation.
            setAnimatedPlayheadPosition(targetSectionDetails.end);
            setTimelineState(prev => ({ ...prev, animationPhase: 'running' }));
          } else {
            console.log(`[InteractiveTimeline] Trigger timeout: Animation no longer in "starting" phase (actual: ${currentPhaseFromRef}) or not animating (actual: ${isAnimatingFromRef}). Aborting trigger.`);
          }
        }, 100); // Increased delay for styles to apply
      } else {
        console.warn(`[InteractiveTimeline] Phase: starting - Missing details for animation (playheadGroupRef: ${!!playheadGroupRef.current}, targetSectionDetails: ${!!targetSectionDetails}, audioDuration: ${audioDuration}). Reverting to idle.`);
        cleanupTimeoutsAndStyles(true);
      }
    } else if (timelineState.animationPhase === 'running') {
      console.log(`[InteractiveTimeline] Phase: running. audioDuration: ${audioDuration}, isAudioPlaying: ${isAudioPlaying}. Attempting to set animation end timeout.`);
      
      // Clear any existing timeout first. This is important if this block re-runs.
      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current);
        animationEndTimeoutRef.current = null;
      }

      // Only set a new timeout if audio is genuinely playing and has a valid duration.
      // This prevents resetting with a 0s duration if props change (e.g., audio stops).
      if (isAudioPlaying && audioDuration > 0) {
        const delay = audioDuration * 1000 + 50;
        const timeoutSetAt = Date.now();
        animationEndTimeoutRef.current = setTimeout(() => {
          const timeoutFiredAt = Date.now();
          // Check ref to ensure still in 'running' phase and animating (not interrupted by audio stopping or user interaction)
          if (timelineStateRef.current.isAnimatingPlayhead && timelineStateRef.current.animationPhase === 'running') {
            setTimelineState(prev => ({ ...prev, animationPhase: 'stopping' }));
          } else {
             console.log(`[InteractiveTimeline] End timeout: Animation no longer in "running" phase (current phase: ${timelineStateRef.current.animationPhase}, isAnimating: ${timelineStateRef.current.isAnimatingPlayhead}). Aborting natural end.`);
          }
        }, delay); // Use calculated delay
      } else {
        console.log('[InteractiveTimeline] Phase: running, but audio stopped or duration invalid. Not setting new end timeout. Expecting transition to stopping phase soon via audio watcher useEffect.');
      }
    } else if (timelineState.animationPhase === 'stopping') {
      cleanupTimeoutsAndStyles(); // Clear timeouts and reset styles first

      const snapToCenterAfterStop = !isAudioPlaying; // Only snap if audio has truly stopped (not just interrupted by user drag)
      const sectionThatWasPlaying = playingAudioSection || timelineStateRef.current.activeTimelineSection; // Determine which section was relevant

      if (snapToCenterAfterStop && sectionThatWasPlaying) {
        const targetSection = sectionThatWasPlaying === 'A' ? SECONDARY_CLIMAX_AREA : MAIN_CLIMAX_AREA;
        setTimelineState(prev => ({
          ...prev,
          currentPosition: targetSection.center,
          activeTimelineSection: sectionThatWasPlaying, // Keep it active
          isAnimatingPlayhead: false,
          animationPhase: 'idle',
        }));
        onPositionChange({ position: targetSection.center, activeSection: sectionThatWasPlaying });
      } else {
        // If not snapping (e.g., interruption by drag, or audio still marked as playing by parent for some reason)
        setTimelineState(prev => ({ ...prev, isAnimatingPlayhead: false, animationPhase: 'idle' }));
      }
    }

    return () => {
      // This cleanup runs if dependencies of this phase-management effect change,
      // or if the component unmounts.
      // If unmounting mid-animation, ensure timeouts are cleared.
      // console.log(`[InteractiveTimeline] Phase Manager useEffect CLEANUP for phase: ${timelineStateRef.current.animationPhase}`);
      // cleanupTimeoutsAndStyles(); // This might be too aggressive if phase changes are part of the flow.
      // The individual phase logic should handle its own timeout cleanup.
    };
  }, [timelineState.animationPhase, audioDuration, playingAudioSection, MAIN_CLIMAX_AREA, SECONDARY_CLIMAX_AREA, onPositionChange, isAudioPlaying]);


  const currentDisplayPosition = timelineState.isAnimatingPlayhead ? animatedPlayheadPosition : timelineState.currentPosition;
  // playheadX will now be used for the group's translateX
  const playheadX = (currentDisplayPosition / 100) * effectiveViewBoxWidth;

  const formatCurrentTime = (position: number) => {
    const startSeconds = 0 * 60 + 53;
    const endSeconds = 5 * 60 + 38;
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
        viewBox={`0 ${VIEWBOX_MIN_Y} ${effectiveViewBoxWidth} ${VIEWBOX_HEIGHT}`} 
        preserveAspectRatio="xMidYMid meet" 
        onMouseDown={handleSvgMouseDown}
        // onTouchStart is handled by manual event listener in useEffect
      >
        <rect
          x={effectiveViewBoxWidth * 0.43} 
          y="0"
          width={effectiveViewBoxWidth * 0.18} 
          height="172"
          fill="url(#mainClimaxGradient)"
          opacity="0.3"
        />
        <rect
          x={effectiveViewBoxWidth * 0.14} 
          y="0"
          width={effectiveViewBoxWidth * 0.14} 
          height="172"
          fill="url(#secondaryClimaxGradient)"
          opacity="0.25"
        />
        
        <defs>
          <linearGradient id="mainClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b2942" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#8b2942" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#8b2942" stopOpacity="0.2"/>
          </linearGradient>
          <linearGradient id="secondaryClimaxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78716c" stopOpacity="0.25"/> 
            <stop offset="50%" stopColor="#78716c" stopOpacity="0.5"/> 
            <stop offset="100%" stopColor="#78716c" stopOpacity="0.15"/> 
          </linearGradient>
        </defs>
        
        <path
          d={`M0,172 L${effectiveViewBoxWidth},172`}
          stroke="#666"
          fill="none"
          strokeWidth="1.5"
          opacity="0.5"
        />
        
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
          stroke="#57534e" 
          fill="none"
          strokeWidth="1.5"
          opacity={activeGraphLineId === null ? 0.65 : activeGraphLineId === "#57534e" ? 1 : 0.2} 
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
        
        <g
          ref={playheadGroupRef}
          className={`playhead-group ${timelineState.isDragging ? 'playhead-marker-active no-transition' : ''}`}
          style={{ transform: `translateX(${playheadX}px)` }} // Apply transform here
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
          {/* Child elements are now positioned relative to the group's x=0 */}
          <line
            x1="0"
            y1="25.2"
            x2="0"
            y2="166.1"
            stroke="#8b2942"
            strokeWidth="0.5"
            strokeDasharray="4,4.1"
            opacity="0.6"
          />
          <PlayheadMarkerIcon x={-5} y={144.5} rotation={180} width={10} height={12.5} />
          <PlayheadMarkerIcon x={-5} y={20} rotation={0} width={10} height={12.5} />
          
          <text
            x="0"
            y="34.5"
            textAnchor="middle"
            className={`playhead-time-text ${
              isAudioPlaying && timelineState.isAnimatingPlayhead && !timelineState.isDragging ? 'faded-out' : ''
            }`}
          >
            {formatCurrentTime(currentDisplayPosition)}
          </text>
          
          {/* Hit area remains relative to the group's new animated position */}
          <rect
            x={-16}
            y="0"
            width="32"
            height="180"
            fill="transparent"
            className="playhead-hitarea"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </g>

        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.423} 
            y="185" 
            textAnchor="start" 
            className="timeline-title" 
          >
            {titleText}
          </text>
        )}
        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.013} 
            y="185" 
            textAnchor="start" 
            className="timeline-time-display" 
          >
            0:53
          </text>
        )}
        {titleText && (
          <text
            x={effectiveViewBoxWidth * 0.95} 
            y="185" 
            textAnchor="start" 
            className="timeline-time-display" 
          >
            5:38
          </text>
        )}
      </svg>
    </div>
  );
}

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
      viewBox="0 0 20 25" 
      xmlns="http://www.w3.org/2000/svg"
      className="playhead-marker"
      style={{ overflow: 'visible' }}
    >
      <g transform={`rotate(${rotation} 10 26.8)`}>
        <path d="M 9 10.5 L 3 4 L 3 0 L 17 0 L 17 4 L 11 10.5 Z" fill="currentColor"/>
      </g>
    </svg>
  );
};
