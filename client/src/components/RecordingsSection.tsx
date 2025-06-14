import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import './RecordingsSection.css'; // Ensure this CSS file is correctly named and placed
// Changed from direct imports to string paths for files in public directory
const placeholderAlbumArt = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/images/front_horowitz_rachmaninoff_rca_1.jpg`;
const placeholderAlbumBack = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/images/back_ogdon_rachmaninoff_rca_1.jpg`;

// Example audio imports - these are likely unused if audioSnippet is sourced from recordingClips.ts
// import alkanSonataExcerpt from '../assets/audio/alkanSonata8XFugue_excerpt.mp3';
// import rachConcerto2Excerpt from '../assets/audio/rachconcerto2opening_excerpt.mp3';
// import rachSonataClimaxExcerpt from '../assets/audio/rachsonata2climax_excerpt.mp3';
// import scriabinOp11Excerpt from '../assets/audio/scriabinOp11no13choir.mp3';


import { Recording } from '../types/music';

interface RecordingsSectionProps {
  recordings: Recording[];
  isVisible: boolean; // This prop will control the visibility, similar to selectedMoment in prototype
  className?: string;
  activeSection?: 'A' | 'B' | null; // New prop to determine which set of recordings to show
  onRecordingHover: (graphLineId: string | null) => void; // Callback for hover events
  stickiedGraphLineId?: string | null; // Optional: ID of the currently "stickied" card
  onRecordingClick?: (graphLineId: string) => void; // Optional: Callback for click events
  onPlaybackChange?: (isPlaying: boolean, duration: number, section: 'A' | 'B' | null, recordingId: string | null) => void;
  stopPlayback?: string | null;
}

interface CurrentPlayingInfo {
  id: string;
  section: 'A' | 'B';
  duration: number;
}

export function RecordingsSection({ recordings, isVisible, className = "", onRecordingHover, stickiedGraphLineId, onRecordingClick, activeSection, onPlaybackChange, stopPlayback }: RecordingsSectionProps) {
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [currentPlayingInfo, setCurrentPlayingInfo] = useState<CurrentPlayingInfo | null>(null);
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
  const flipperRef = useRef<HTMLDivElement>(null); // Ref for the flipper
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [modalArtAspectRatio, setModalArtAspectRatio] = useState<string>('1 / 1'); // Default to square
  const initialStylesRef = useRef<{
    body: { overflow: string; paddingRight: string; cursor: string };
    flipper: { cursor: string };
  } | null>(null);

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

  const getScrollbarWidth = () => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);
    return scrollbarWidth;
  };

  // Effect to lock/unlock page scroll when magnifier is active
  useEffect(() => {
    if (!initialStylesRef.current && flipperRef.current) {
      const bodyComputedStyle = window.getComputedStyle(document.body);
      const flipperComputedStyle = window.getComputedStyle(flipperRef.current);
      initialStylesRef.current = {
        body: {
          overflow: bodyComputedStyle.overflow,
          paddingRight: bodyComputedStyle.paddingRight,
          cursor: bodyComputedStyle.cursor,
        },
        flipper: {
          cursor: flipperComputedStyle.cursor,
        },
      };
    }

    const originalBodyStyles = initialStylesRef.current?.body;
    const originalFlipperStyles = initialStylesRef.current?.flipper;

    if (isMagnifierVisible) {
      document.body.style.overflow = 'hidden';
      document.body.style.cursor = 'none';
      if (flipperRef.current) {
        flipperRef.current.style.cursor = 'none';
      }

      const wouldHaveScrollbar = document.body.scrollHeight > window.innerHeight;
      if (wouldHaveScrollbar) {
        const scrollbarWidth = getScrollbarWidth();
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
    } else {
      if (originalBodyStyles) {
        document.body.style.overflow = originalBodyStyles.overflow;
        document.body.style.paddingRight = originalBodyStyles.paddingRight;
        document.body.style.cursor = originalBodyStyles.cursor;
      }
      if (flipperRef.current && originalFlipperStyles) {
        flipperRef.current.style.cursor = originalFlipperStyles.cursor;
      }
    }

    return () => {
      if (originalBodyStyles) {
        document.body.style.overflow = originalBodyStyles.overflow;
        document.body.style.paddingRight = originalBodyStyles.paddingRight;
        document.body.style.cursor = originalBodyStyles.cursor;
      }
      if (flipperRef.current && originalFlipperStyles) {
        flipperRef.current.style.cursor = originalFlipperStyles.cursor;
      }
    };
  }, [isMagnifierVisible]);

  // Effect for audio player setup (create instance once) and unmount cleanup
  useEffect(() => {
    audioRef.current = new Audio();
    const audioInstance = audioRef.current; // Capture instance for cleanup

    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = ''; // Release the audio resource
      }
    };
  }, []); // Empty array: runs once on mount, cleans up on unmount

  // Effect for 'ended' event listener management
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    const handleAudioEnded = () => {
      console.log(`[RecordingsSection] handleAudioEnded: Audio finished for ${currentPlayingInfo?.id}.`);
      setPlayingRecording(null); // Reset playing state
      if (onPlaybackChange && currentPlayingInfo) {
        // Notify parent that playback ended, pass relevant info
        onPlaybackChange(false, 0, currentPlayingInfo.section, currentPlayingInfo.id);
      }
      setCurrentPlayingInfo(null); // Clear current playing info
    };

    currentAudio.addEventListener('ended', handleAudioEnded);

    return () => {
      currentAudio.removeEventListener('ended', handleAudioEnded);
    };
  }, [onPlaybackChange, currentPlayingInfo]); // Dependencies for the ended handler logic

  // Effect to handle stopPlayback prop
  useEffect(() => {
    console.log(`[RecordingsSection] stopPlayback useEffect: stopPlaybackProp=${stopPlayback}, currentPlayingRecordingId=${playingRecording}, currentPlayingInfoId=${currentPlayingInfo?.id}`);
    if (stopPlayback && currentPlayingInfo && stopPlayback === currentPlayingInfo.id) {
      console.log(`[RecordingsSection] stopPlayback useEffect: PAUSING audio for ${currentPlayingInfo.id}`);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (onPlaybackChange) {
        onPlaybackChange(false, 0, currentPlayingInfo.section, currentPlayingInfo.id);
      }
      setPlayingRecording(null);
      setCurrentPlayingInfo(null);
    }
  }, [stopPlayback, playingRecording, currentPlayingInfo, onPlaybackChange]);


  useEffect(() => {
    if (expandedRecordingId) {
      const currentExpandedRecording = recordings.find(rec => rec.id === expandedRecordingId);
      if (!currentExpandedRecording) {
        setModalArtAspectRatio('1 / 1'); // Reset if recording not found
        return;
      }

      const imageUrl = isFlipped
        ? (currentExpandedRecording.albumArtBack || placeholderAlbumBack)
        : (currentExpandedRecording.albumArt || placeholderAlbumArt);

      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
          setModalArtAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
        } else {
          setModalArtAspectRatio('1 / 1'); // Fallback if dimensions are zero or invalid
        }
      };
      img.onerror = () => {
        console.error("Error loading image for aspect ratio calculation:", imageUrl);
        setModalArtAspectRatio('1 / 1'); // Fallback on error
      };
      img.src = imageUrl;

    } else {
      setModalArtAspectRatio('1 / 1'); // Reset when modal is closed
    }
  }, [expandedRecordingId, isFlipped, recordings, placeholderAlbumArt, placeholderAlbumBack]);


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

  const handleWheelOnBack = useCallback((event: WheelEvent) => {
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
  }, [isMagnifierVisible, isFlipped, MAGNIFIER_SIZE, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP, setZoomLevel, setBackgroundPosition, setMagnifierPosition]);

  // Effect to handle wheel event listener with passive: false
  useEffect(() => {
    const backImageElement = backImageRef.current;

    // The wheel event should only be active when the magnifier is visible.
    if (backImageElement && isFlipped && isMagnifierVisible) {
      const wheelListener = (event: Event) => handleWheelOnBack(event as WheelEvent);
      
      backImageElement.addEventListener('wheel', wheelListener, { passive: false });

      return () => {
        backImageElement.removeEventListener('wheel', wheelListener);
      };
    }
  }, [isFlipped, isMagnifierVisible, handleWheelOnBack]);

  const handleRecordingPlay = (recordingId: string) => {
    const selectedRecording = recordings.find(r => r.id === recordingId);

    if (!audioRef.current) {
      console.error("[handleRecordingPlay] audioRef.current is null! Cannot play audio.");
      return;
    }
    const currentAudio = audioRef.current;

    if (!selectedRecording || !selectedRecording.audioSnippet) {
      console.warn("[handleRecordingPlay] Audio snippet not found for recording:", recordingId, "Selected recording:", selectedRecording);
      if (!currentAudio.paused) {
        console.log('[handleRecordingPlay] No snippet, stopping current audio if any.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (onPlaybackChange && currentPlayingInfo) {
          onPlaybackChange(false, 0, currentPlayingInfo.section, currentPlayingInfo.id);
        }
      }
      setPlayingRecording(null);
      setCurrentPlayingInfo(null);
      return;
    }
    console.log('[handleRecordingPlay] Audio snippet found:', selectedRecording.audioSnippet);

    if (playingRecording === recordingId) {
      console.log('[handleRecordingPlay] Stopping and resetting current audio:', recordingId);
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (onPlaybackChange && currentPlayingInfo) {
        onPlaybackChange(false, 0, currentPlayingInfo.section, playingRecording);
      }
      setPlayingRecording(null);
      setCurrentPlayingInfo(null);
    } else {
      console.log('[handleRecordingPlay] Attempting to play new/different audio:', recordingId);
      if (!currentAudio.paused && currentPlayingInfo) { // If something was playing, notify parent
        console.log('[handleRecordingPlay] Pausing previous audio first.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (onPlaybackChange) {
          onPlaybackChange(false, 0, currentPlayingInfo.section, currentPlayingInfo.id);
        }
      }
      currentAudio.src = selectedRecording.audioSnippet;
      console.log('[handleRecordingPlay] Set audio src to:', currentAudio.src);
      
      console.log(`[RecordingsSection] handleRecordingPlay: About to call play() for ${recordingId}. Src: ${currentAudio.src}`);
      const playPromise = currentAudio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlayingRecording(recordingId);
          
          const idToPlay = recordingId; // Capture recordingId for use in async handler
          const handleLoadedMetadata = () => {
            if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
              const duration = audioRef.current.duration;
              const rSection = selectedRecording.section;

              if (rSection) { // rSection is 'A' | 'B'
                setCurrentPlayingInfo({ id: idToPlay, section: rSection, duration });
                if (onPlaybackChange) {
                  onPlaybackChange(true, duration, rSection, idToPlay);
                }
              } else {
                console.error(`Recording ${idToPlay} is missing a 'section' property. Playback started, but internal state for section might be incomplete.`);
                if (onPlaybackChange) {
                  onPlaybackChange(true, duration, null, idToPlay);
                }
              }
            }
            currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          };

          if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
            const duration = audioRef.current.duration;
            const rSection = selectedRecording.section;
            console.log(`[RecordingsSection] loadedmetadata (immediate): Audio duration for ${idToPlay} is ${duration}. Calling onPlaybackChange.`);

            if (rSection) { // rSection is 'A' | 'B'
              setCurrentPlayingInfo({ id: idToPlay, section: rSection, duration });
              if (onPlaybackChange) {
                onPlaybackChange(true, duration, rSection, idToPlay);
              }
            } else {
              console.error(`Recording ${idToPlay} is missing a 'section' property. Playback started, but internal state for section might be incomplete.`);
              if (onPlaybackChange) {
                onPlaybackChange(true, duration, null, idToPlay);
              }
            }
          } else {
            currentAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
          }
        }).catch(error => {
          console.error(`[RecordingsSection] handleRecordingPlay: Error playing audio for ${recordingId}. Error: ${error.name} - ${error.message}`, error);
          setPlayingRecording(null);
          setCurrentPlayingInfo(null);
          if (onPlaybackChange) { // Notify parent about failed playback attempt
            const rSection = selectedRecording.section;
            const sectionForCallback = rSection ?? null;
            onPlaybackChange(false, 0, sectionForCallback, recordingId);
          }
        });
      }
    }
  };

  if (!shouldRender && !isHiding) { // Only return null if fully hidden and not in the process of hiding
    return null;
  }
  
  const filteredRecordings = recordings.filter(recording => {
    if (!activeSection) return false; // If no active section, show nothing from this list
    return recording.section === activeSection;
  });

  return (
    <div className={`recordings-section ${isHiding ? 'hiding' : ''} ${className}`}>

      <div className="recordings-grid">
        <div className="section-header">
          <h3>How have artists shaped this moment differently?</h3>
        </div>
        
        <div className="recordings-list">
          {filteredRecordings.map((recording) => {
            const isPlaying = playingRecording === recording.id;
            const isControlHovered = hoveredControlId === recording.id;
            const isStickied = stickiedGraphLineId === (recording.graphLineColor || recording.id);

            return (
              <div
                key={recording.id}
                className={`recording-card ${isPlaying ? 'playing' : ''} ${isStickied ? 'stickied-card' : ''}`}
                onMouseEnter={() => onRecordingHover(recording.graphLineColor || recording.id)} // Use graphLineColor or fallback to id
                onMouseLeave={() => onRecordingHover(null)}
                onClick={() => onRecordingClick && onRecordingClick(recording.graphLineColor || recording.id)}
              >
                {recording.graphLineColor && (
                  <div
                    className="recording-card-color-border"
                    style={{ backgroundColor: recording.graphLineColor }}
                  ></div>
                )}
                <div
                  className="album-art-container"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from bubbling to parent card
                    setExpandedRecordingId(recording.id);
                    setIsFlipped(false); // Reset flip state when opening new art
                  }}
                >
                  <img
                    src={recording.albumArt || placeholderAlbumArt}
                    alt={`Album art for ${recording.artistFirstName} ${recording.artistLastName} - ${recording.recordingYear}`}
                    className="album-art-image"
                  />
                </div>
                
                <div className="recording-info">
                  <h4 className="pianist-name">{`${recording.artistFirstName} ${recording.artistLastName}`}</h4>
                  <p className="recording-details">
                    {recording.recordingYear}
                    {recording.recordLabel && ` • ${recording.recordLabel}${recording.isLive ? ' (Live)' : ''}`}
                  </p>
                </div>

                <div className="interactive-controls">
                  <button
                    className="play-button" // This class will be restyled in CSS in the next step
                    onClick={() => handleRecordingPlay(recording.id)}
                    onMouseEnter={() => setHoveredControlId(recording.id)}
                    onMouseLeave={() => setHoveredControlId(null)}
                    aria-label={isPlaying ? `Stop recording by ${recording.artistFirstName} ${recording.artistLastName}` : `Play recording by ${recording.artistFirstName} ${recording.artistLastName}`}
                  >
                    {isPlaying ? (
                      isControlHovered ? (
                        <Square size={16} /> // Represents Stop button
                      ) : (
                        <div className="sound-wave-animated"> {/* Renamed for clarity, styles to be added in CSS */}
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )
                    ) : (
                      isControlHovered ? (
                        <Play size={16} />
                      ) : (
                        <Volume2 size={16} /> // Default icon
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
        const currentExpandedRecording = recordings.find(rec => rec.id === expandedRecordingId);
        const frontArtUrl = currentExpandedRecording?.albumArt || placeholderAlbumArt;
        const backArtUrl = currentExpandedRecording?.albumArtBack || placeholderAlbumBack;

        return (
          <div className="album-art-modal-overlay" onClick={() => setExpandedRecordingId(null)}>
            {/* The modal-content div is kept for structure but will be styled to be transparent */}
            <div className="album-art-modal-content" onClick={(e) => e.stopPropagation()}>
              <div
                className={`modal-art-flipper ${isFlipped ? 'flipped' : ''}`}
                style={{ aspectRatio: modalArtAspectRatio }}
                onClick={() => setIsFlipped(!isFlipped)} // Click art to flip
                ref={flipperRef}
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
                  // onWheel={handleWheelOnBack} // Removed direct prop, handled by useEffect
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
              {/* Modal controls are removed as per the new design */}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
