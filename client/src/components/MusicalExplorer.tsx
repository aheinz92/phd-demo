import { useState, useEffect, useCallback } from 'react';
import { InteractiveTimeline } from './InteractiveTimeline';
import { RecordingsSection } from './RecordingsSection';
import { PieceInfo, Recording } from '@/types/music';
import { sectionAClips, sectionBClips } from '../data/recordingClips'; // Import the new data
import { RecordingClip } from '../types/music'; // Import RecordingClip type
import './MusicalExplorer.css'; // Import the new CSS file
// Define colors

const pieceInfo: PieceInfo = {
  composer: "Rachmaninoff",
  title: "Piano Sonata No. 2",
  movement: "2nd Movement",
  startTime: "0:53",
  endTime: "5:38"
};

// Helper function to capitalize first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper function to transform RecordingClip to Recording
const transformClipToRecording = (clip: RecordingClip): Recording => ({
  id: clip.id,
  artistFirstName: capitalize(clip.pianistFirstName), // Added
  artistLastName: capitalize(clip.pianistLastName), // Renamed and uses capitalized last name
  recordingYear: clip.year,
  colorCode: clip.graphLineColor,
  graphLineColor: clip.graphLineColor,
  recordLabel: capitalize(clip.recordLabel),
  audioSnippet: clip.audioSrc, // Use the audio path string
  albumArt: clip.frontArtSrc,
  albumArtBack: clip.backArtSrc,
  section: clip.section,
  isLive: clip.isLive, // Added
});

// Process clips and assign colors
const processClips = (clips: RecordingClip[]): Recording[] => {
  return clips.map(clip => transformClipToRecording(clip));
};

const recordingsA = processClips(sectionAClips);
const recordingsB = processClips(sectionBClips);

// Combine recordings: A section (Horowitz, Titova, others), then B section (Horowitz, Titova, others)
const recordings: Recording[] = [...recordingsA, ...recordingsB];


export function MusicalExplorer() {
  const [currentPosition, setCurrentPosition] = useState(30);
  // const [showExploreHint, setShowExploreHint] = useState(false); // Removed state
  const [recordingsSectionVisible, setRecordingsSectionVisible] = useState(false);
  const [activeTimelineSection, setActiveTimelineSection] = useState<'A' | 'B' | null>(null); // New state
  const [hoveredGraphLineId, setHoveredGraphLineId] = useState<string | null>(null);
  const [stickiedGraphLineId, setStickiedGraphLineId] = useState<string | null>(null);
  const [staffLines, setStaffLines] = useState<number[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playingAudioSection, setPlayingAudioSection] = useState<'A' | 'B' | null>(null);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [timelineShouldStopPlayback, setTimelineShouldStopPlayback] = useState<string | null>(null);

  // Generate staff lines for background
  useEffect(() => {
    const generateStaffLines = () => {
      const lineCount = Math.floor(window.innerHeight / 40);
      const lines = Array.from({ length: lineCount }, (_, i) => i * 40 + 100);
      setStaffLines(lines);
    };

    generateStaffLines();
    window.addEventListener('resize', generateStaffLines);
    return () => window.removeEventListener('resize', generateStaffLines);
  }, []);

  const handlePositionChange = (position: number) => { // This function seems unused if handlePositionUpdate covers all cases
    setCurrentPosition(position);
  };

  const handleInteractionStart = useCallback((incomingActiveSection: 'A' | 'B' | null) => {
    // setShowExploreHint(true); // Removed
    setRecordingsSectionVisible(incomingActiveSection !== null);
    setActiveTimelineSection(incomingActiveSection);
    
    // Hide hint after 3 seconds - Removed
    // setTimeout(() => {
    //   setShowExploreHint(false);
    // }, 3000);
  }, []); // No external dependencies from component scope

  const handlePositionUpdate = useCallback((update: { position: number; activeSection: 'A' | 'B' | null }) => {
    setCurrentPosition(update.position);
    setActiveTimelineSection(update.activeSection);
    // Update recordings visibility based on activeSection
    setRecordingsSectionVisible(update.activeSection !== null);

    // Logic for Clicking Outside Active Section During Playback
    if (isAudioPlaying && update.activeSection === null && playingAudioSection !== null) {
      setTimelineShouldStopPlayback(playingRecordingId);
      setIsAudioPlaying(false);
      setAudioDuration(0);
      setPlayingRecordingId(null);
      setPlayingAudioSection(null);
    }
  }, [isAudioPlaying, playingAudioSection, playingRecordingId]); // Dependencies for useCallback

  const handlePlaybackChange = useCallback((isPlaying: boolean, duration: number, section: 'A' | 'B' | null, recordingId: string | null) => {
    setIsAudioPlaying(isPlaying);
    setAudioDuration(duration);
    setPlayingAudioSection(section);
    setPlayingRecordingId(recordingId);
    if (isPlaying) {
      setActiveTimelineSection(section);
    } else {
      setTimelineShouldStopPlayback(null);
    }
  }, [timelineShouldStopPlayback]); // Added timelineShouldStopPlayback as it's read

  const handleTimelinePlaybackInterruption = useCallback(() => {
    setTimelineShouldStopPlayback(playingRecordingId);
    setIsAudioPlaying(false);
    setAudioDuration(0);
    // playingAudioSection can remain as is, or be set to null.
    setPlayingRecordingId(null);
  }, [playingRecordingId]); // Dependencies for useCallback

  const handleRecordingHover = (graphLineId: string | null) => {
    setHoveredGraphLineId(graphLineId);
  };

  const handleRecordingClick = (graphLineId: string) => {
    setStickiedGraphLineId(prevStickiedId =>
      prevStickiedId === graphLineId ? null : graphLineId
    );
  };

  const formatCurrentTime = (position: number) => {
    const startSeconds = 0 * 60 + 53; // 0:53
    const endSeconds = 5 * 60 + 38; // 5:38
    const currentSeconds = startSeconds + (position / 100) * (endSeconds - startSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Main Container - Optimized for narrow columns */}
      <div className="w-full max-w-3xl shadow-music-explorer-full-container sglass-effect rounded-2xl overflow-hidden animate-fade-in-up musical-explorer-background"> {/* Replaced Tailwind gradient with CSS class */}
        {/* Header - More compact */}
        <header className="p-2 md:p-3 pt-3 md:pt-5 text-center relative ornament"> {/* Removed background gradient and border */}
          <div className="font-sans-custom text-xs uppercase tracking-[2px] text-red-900 font-semibold mb-3 mt-2 opacity-50">
            Currently Exploring
          </div>
          {/* Composer, Title, Movement on one line */}
          <div className="flex justify-center w-full mt-1">
            <div className="flex items-center">
              <span className="font-display text-3xl italic text-red-900">
                {pieceInfo.composer}
              </span>
              <span className="text-red-900 font-bold text-sm mx-5">  </span>
              <span className="font-display text-3xl text-stone-800">
                {pieceInfo.title}
              </span>
              <span className="text-red-900 font-bold text-sm mx-5">  </span>
              <span className="font-display text-3xl text-stone-500 opacity-85">
                {pieceInfo.movement}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content - Reduced padding */}
        <main className="pt-2 md:pt-3 px-4 md:px-6 pb-4 md:pb-6"> {/* Reduced top padding */}
          {/* Variance Graph Section - More compact */}
          <section>
            {/* The div that previously held the hint has been removed entirely. */}

            {/* Interactive Timeline */}
            <InteractiveTimeline
              onPositionChange={handlePositionUpdate}
              onInteractionStart={handleInteractionStart}
              activeGraphLineId={stickiedGraphLineId ?? hoveredGraphLineId} // Prioritize stickied, then hovered
              className="mb-3"
              titleText="Interpretive Variance" // Pass the title text here
              isAudioPlaying={isAudioPlaying}
              audioDuration={audioDuration}
              playingAudioSection={playingAudioSection}
              onPlaybackInterruption={handleTimelinePlaybackInterruption}
            />


          </section>

          {/* Recordings Section - Only visible in climax area */}
          <RecordingsSection
            recordings={recordings}
            isVisible={recordingsSectionVisible}
            activeSection={activeTimelineSection} // Pass the active section
            onRecordingHover={handleRecordingHover} // Pass hover handler to recordings section
            stickiedGraphLineId={stickiedGraphLineId} // Pass stickied ID
            onRecordingClick={handleRecordingClick} // Pass click handler
            onPlaybackChange={handlePlaybackChange}
            stopPlayback={timelineShouldStopPlayback}
          />
        </main>
      </div>
    </>
  );
}

export default MusicalExplorer;
