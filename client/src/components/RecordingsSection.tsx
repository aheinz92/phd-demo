import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import './RecordingsSection.css'; // Ensure this CSS file is correctly named and placed


// Example audio imports - you'll need to ensure your 'recordings' data uses these or similar paths
// import alkanSonataExcerpt from '../assets/audio/alkanSonata8XFugue_excerpt.mp3'; // Removed
// import rachConcerto2Excerpt from '../assets/audio/rachconcerto2opening_excerpt.mp3'; // Removed
// import rachSonataClimaxExcerpt from '../assets/audio/rachsonata2climax_excerpt.mp3'; // Removed
// import scriabinOp11Excerpt from '../assets/audio/scriabinOp11no13choir.mp3'; // Removed


import { RecordingClip } from '../types/music';

interface RecordingsSectionProps {
  clips: RecordingClip[];
  isVisible: boolean; // This prop will control the visibility, similar to selectedMoment in prototype
  className?: string;
  // Comments about old props removed
}

export function RecordingsSection({ clips, isVisible, className = "" }: RecordingsSectionProps) {
console.log('RecordingsSection: received clips:', clips);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [hoveredControlId, setHoveredControlId] = useState<string | null>(null);
  const [expandedRecordingId, setExpandedRecordingId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Magnifier States
  const MAGNIFIER_SIZE = 150; // px
  const MIN_ZOOM = 1.5;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.25;

  const [isMagnifierVisible, setIsMagnifierVisible] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const backImageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      setShouldRender(true);
      setIsHiding(false); // Ensure hiding class is removed if it was appearing after hiding
    } else {
      // Only trigger hiding animation if it's currently rendered and not already hiding
      if (shouldRender && !isHiding) {
        setIsHiding(true);
        timeoutId = setTimeout(() => {
          setShouldRender(false);
          setIsHiding(false); // Reset for next time
        }, 400); // Duration of the slide-up animation
      } else if (!shouldRender) {
        // If it's already not rendered, ensure isHiding is false
        setIsHiding(false);
      }
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isVisible, shouldRender, isHiding]); // Added isHiding to dependencies to handle rapid toggles correctly

  useEffect(() => {
    if (!isFlipped) {
      setIsMagnifierVisible(false);
      setZoomLevel(MIN_ZOOM); // Reset zoom when flipping away from back
    }
  }, [isFlipped]);

  // Effect for audio player setup and cleanup
  useEffect(() => {
    audioRef.current = new Audio();
    const currentAudio = audioRef.current;

    const handleAudioEnded = () => {
      setPlayingRecording(null);
    };

    currentAudio.addEventListener('ended', handleAudioEnded);

    return () => {
      currentAudio.removeEventListener('ended', handleAudioEnded);
      currentAudio.pause();
      currentAudio.src = ''; // Release the audio resource
    };
  }, []);


  // Magnifier Handlers
  const handleMouseMoveOnBack = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!backImageRef.current || !isMagnifierVisible || !isFlipped) return;
    const rect = backImageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMagnifierPosition({ x: x - MAGNIFIER_SIZE / 2, y: y - MAGNIFIER_SIZE / 2 });

    const bgX = -(x * zoomLevel - MAGNIFIER_SIZE / 2);
    const bgY = -(y * zoomLevel - MAGNIFIER_SIZE / 2);
    setBackgroundPosition({ x: bgX, y: bgY });
  };

  const handleMouseLeaveBack = () => {
    setIsMagnifierVisible(false);
  };

  const handleMouseEnterBack = () => {
    if (isFlipped) { // Only show if back is visible
      setIsMagnifierVisible(true);
    }
  };

  const handleWheelOnBack = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isMagnifierVisible || !backImageRef.current || !isFlipped) return;
    event.preventDefault();

    const rect = backImageRef.current.getBoundingClientRect();
    const mouseXOnImage = event.clientX - rect.left;
    const mouseYOnImage = event.clientY - rect.top;

    setZoomLevel(prevZoom => {
      let newZoom = prevZoom;
      if (event.deltaY < 0) {
        newZoom = Math.min(MAX_ZOOM, prevZoom + ZOOM_STEP);
      } else {
        newZoom = Math.max(MIN_ZOOM, prevZoom - ZOOM_STEP);
      }

      const bgX = -(mouseXOnImage * newZoom - MAGNIFIER_SIZE / 2);
      const bgY = -(mouseYOnImage * newZoom - MAGNIFIER_SIZE / 2);
      setBackgroundPosition({ x: bgX, y: bgY });
      
      setMagnifierPosition({ x: mouseXOnImage - MAGNIFIER_SIZE / 2, y: mouseYOnImage - MAGNIFIER_SIZE / 2 });

      return newZoom;
    });
  };

  const handleRecordingPlay = (clipId: string) => {
    console.log('[handleRecordingPlay] Clicked:', clipId, 'Current playing:', playingRecording);
    const selectedClip = clips.find(c => c.id === clipId);

    if (!audioRef.current) {
      console.error("[handleRecordingPlay] audioRef.current is null! Cannot play audio.");
      return;
    }
    const currentAudio = audioRef.current;

    if (!selectedClip || !selectedClip.audioSrc) {
      console.warn("[handleRecordingPlay] Audio snippet not found for recording:", clipId, "Selected recording:", selectedClip);
      // Stop any currently playing audio if a button for a record without a snippet is clicked
      if (!currentAudio.paused) {
        console.log('[handleRecordingPlay] No snippet, stopping current audio if any.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      setPlayingRecording(null); // Ensure UI reflects no playback
      return;
    }
    console.log('[handleRecordingPlay] Audio snippet found:', selectedClip.audioSrc);

    if (playingRecording === clipId) {
      console.log('[handleRecordingPlay] Stopping and resetting current audio:', clipId);
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingRecording(null);
    } else {
      console.log('[handleRecordingPlay] Attempting to play new/different audio:', clipId);
      if (!currentAudio.paused) {
        console.log('[handleRecordingPlay] Pausing previous audio first.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      currentAudio.src = selectedClip.audioSrc;
      console.log('[handleRecordingPlay] Set audio src to:', currentAudio.src);
      
      currentAudio.load(); // Explicitly call load after setting new src
      currentAudio.play().then(() => {
        console.log('[handleRecordingPlay] Playback started successfully for:', clipId);
        setPlayingRecording(clipId);
      }).catch(error => {
        console.error("[handleRecordingPlay] Error playing audio for:", clipId, error);
        setPlayingRecording(null); // Reset if play fails
      });
    }
  };

  if (!shouldRender && !isHiding) { // Only return null if fully hidden and not in the process of hiding
    return null;
  }

if (!clips || !Array.isArray(clips) || clips.length === 0) {
    console.log('RecordingsSection: No valid clips to render');
    return null;
  }
  return (
    <div className={`recordings-section ${isHiding ? 'hiding' : ''} ${className}`}>
      <div className="recordings-grid">
        <div className="section-header">
          <h3>How have artists shaped this moment differently?</h3>
        </div>
        
        <div className="recordings-list">
          {/* Add a check to ensure clips is defined and is an array */}
          {(!clips || !Array.isArray(clips)) ? null : clips.map((clip, index) => {
console.log('RecordingsSection: mapping clip', index, clip);
            const isPlaying = playingRecording === clip.id;
            const isControlHovered = hoveredControlId === clip.id;

            return (
              <div
                key={clip.id}
                className={`recording-card ${isPlaying ? 'playing' : ''}`}
              >
                <div
                  className="album-art-container"
                  onClick={() => {
                    setExpandedRecordingId(clip.id);
                    setIsFlipped(false); // Reset flip state when opening new art
                  }}
                >
                  <img
                    src={clip.frontArtSrc}
                    alt={`Album art for ${clip.pianistLastName} - ${clip.year}`}
                    className="album-art-image"
                  />
                </div>
                
                <div className="recording-info">
                  <h4 className="pianist-name">{clip.pianistLastName}</h4>
                  <p className="recording-details">
                    {clip.year} {clip.isLive && "(Live)"}
                    {clip.recordLabel && ` • ${clip.recordLabel}`}
                  </p>
                </div>

                <div className="interactive-controls">
                  <button
                    className="play-button"
                    onClick={() => handleRecordingPlay(clip.id)}
                    onMouseEnter={() => setHoveredControlId(clip.id)}
                    onMouseLeave={() => setHoveredControlId(null)}
                    aria-label={isPlaying ? `Stop recording by ${clip.pianistLastName}` : `Play recording by ${clip.pianistLastName}`}
                  >
                    {isPlaying ? (
                      isControlHovered ? (
                        <Square size={16} />
                      ) : (
                        <div className="sound-wave-animated">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )
                    ) : (
                      isControlHovered ? (
                        <Play size={16} />
                      ) : (
                        <Volume2 size={16} />
                      )
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expandedRecordingId && (() => {
        const currentExpandedClip = clips.find(rec => rec.id === expandedRecordingId);
        const frontArtUrl = currentExpandedClip?.frontArtSrc; // Fallback handled by recordingClips.ts
        const backArtUrl = currentExpandedClip?.backArtSrc;   // Fallback handled by recordingClips.ts

        return (
          <div className="album-art-modal-overlay" onClick={() => setExpandedRecordingId(null)}>
            <div className="album-art-modal-content" onClick={(e) => e.stopPropagation()}>
              <div
                className={`modal-art-flipper ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)} // Click art to flip
              >
                <div className="modal-art-front">
                  <img
                    src={frontArtUrl}
                    alt="Enlarged album art - front"
                    className="modal-album-art-image"
                  />
                </div>
                <div
                  className="modal-art-back"
                  ref={backImageRef}
                  onMouseMove={handleMouseMoveOnBack}
                  onMouseLeave={handleMouseLeaveBack}
                  onMouseEnter={handleMouseEnterBack}
                  onWheel={handleWheelOnBack}
                >
                  <img
                    src={backArtUrl}
                    alt="Enlarged album art - back"
                    className="modal-album-art-image"
                  />
                  {isMagnifierVisible && isFlipped && backImageRef.current && (
                    <div
                      className="magnifier-glass"
                      style={{
                        width: `${MAGNIFIER_SIZE}px`,
                        height: `${MAGNIFIER_SIZE}px`,
                        left: `${magnifierPosition.x}px`,
                        top: `${magnifierPosition.y}px`,
                        backgroundImage: `url(${backArtUrl})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: `${backImageRef.current.offsetWidth * zoomLevel}px ${backImageRef.current.offsetHeight * zoomLevel}px`,
                        backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px`,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="modal-controls">
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }} className="modal-button">
                  {isFlipped ? 'View Front' : 'View Back'}
                </button>
                <button onClick={() => setExpandedRecordingId(null)} className="modal-button close-button">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
