import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import './RecordingsSection.css'; // Ensure this CSS file is correctly named and placed
// Changed from direct imports to string paths for files in public directory
const placeholderAlbumArt = "/assets/images/front_horowitz_rachmaninoff_rca_1.jpg";
const placeholderAlbumBack = "/assets/images/back_ogdon_rachmaninoff_rca_1.jpg";

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
}

export function RecordingsSection({ recordings, isVisible, className = "", onRecordingHover, stickiedGraphLineId, onRecordingClick, activeSection }: RecordingsSectionProps) {
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
  const [modalArtAspectRatio, setModalArtAspectRatio] = useState<string>('1 / 1'); // Default to square

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

  const handleRecordingPlay = (recordingId: string) => {
    console.log('[handleRecordingPlay] Clicked:', recordingId, 'Current playing:', playingRecording);
    const selectedRecording = recordings.find(r => r.id === recordingId);

    if (!audioRef.current) {
      console.error("[handleRecordingPlay] audioRef.current is null! Cannot play audio.");
      return;
    }
    const currentAudio = audioRef.current;

    if (!selectedRecording || !selectedRecording.audioSnippet) {
      console.warn("[handleRecordingPlay] Audio snippet not found for recording:", recordingId, "Selected recording:", selectedRecording);
      // Stop any currently playing audio if a button for a record without a snippet is clicked
      if (!currentAudio.paused) {
        console.log('[handleRecordingPlay] No snippet, stopping current audio if any.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      setPlayingRecording(null); // Ensure UI reflects no playback
      return;
    }
    console.log('[handleRecordingPlay] Audio snippet found:', selectedRecording.audioSnippet);

    if (playingRecording === recordingId) {
      console.log('[handleRecordingPlay] Stopping and resetting current audio:', recordingId);
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingRecording(null);
    } else {
      console.log('[handleRecordingPlay] Attempting to play new/different audio:', recordingId);
      if (!currentAudio.paused) {
        console.log('[handleRecordingPlay] Pausing previous audio first.');
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      currentAudio.src = selectedRecording.audioSnippet;
      console.log('[handleRecordingPlay] Set audio src to:', currentAudio.src);
      
      currentAudio.load(); // Explicitly call load after setting new src
      currentAudio.play().then(() => {
        console.log('[handleRecordingPlay] Playback started successfully for:', recordingId);
        setPlayingRecording(recordingId);
      }).catch(error => {
        console.error("[handleRecordingPlay] Error playing audio for:", recordingId, error);
        setPlayingRecording(null); // Reset if play fails
      });
    }
  };

  if (!shouldRender && !isHiding) { // Only return null if fully hidden and not in the process of hiding
    return null;
  }

  // Log activeSection and recordings before rendering the list
  console.log('[RecordingsSection] Props received - activeSection:', activeSection, 'isVisible:', isVisible);
  
  const filteredRecordings = recordings.filter(recording => {
    if (!activeSection) return false; // If no active section, show nothing from this list
    return recording.section === activeSection;
  });
  console.log('[RecordingsSection] Filtered recordings:', filteredRecordings);


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
              {/* Modal controls are removed as per the new design */}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
