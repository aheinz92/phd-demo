import { useState, useEffect } from 'react';
import { InteractiveTimeline } from './InteractiveTimeline';
import { RecordingsSection } from './RecordingsSection';
import { PieceInfo, Recording } from '@/types/music';
import { sectionAClips, sectionBClips } from '../data/recordingClips'; // Import the new data
import { RecordingClip } from '../types/music'; // Import RecordingClip type

// Define colors
const HOROWITZ_COLOR = "#57534e";
const TITOVA_COLOR = "#d63384"; // Previously Rubinstein's color
const OTHER_COLORS = ["#2e8b57", "#8b4513", "#4169e1", "#9932cc"];

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
const transformClipToRecording = (clip: RecordingClip, color: string): Recording => ({
  id: clip.id,
  artistName: capitalize(clip.pianistLastName), // Use capitalized last name
  recordingYear: clip.year,
  colorCode: color,
  graphLineColor: color,
  recordLabel: capitalize(clip.recordLabel),
  audioSnippet: clip.audioSrc, // Use the audio path string
  albumArt: clip.frontArtSrc,
  albumArtBack: clip.backArtSrc,
  section: clip.section,
});

// Process clips and assign colors
const processClips = (clips: RecordingClip[]): Recording[] => {
  const horowitzClip = clips.find(clip => clip.pianistLastName.toLowerCase() === 'horowitz');
  const titovaClip = clips.find(clip => clip.pianistLastName.toLowerCase() === 'titova');
  const otherClips = clips.filter(
    clip => clip.pianistLastName.toLowerCase() !== 'horowitz' && clip.pianistLastName.toLowerCase() !== 'titova'
  );

  const processed: Recording[] = [];
  let otherColorIndex = 0;

  if (horowitzClip) {
    processed.push(transformClipToRecording(horowitzClip, HOROWITZ_COLOR));
  }
  if (titovaClip) {
    processed.push(transformClipToRecording(titovaClip, TITOVA_COLOR));
  }
  otherClips.forEach(clip => {
    processed.push(transformClipToRecording(clip, OTHER_COLORS[otherColorIndex % OTHER_COLORS.length]));
    otherColorIndex++;
  });
  return processed;
};

const recordingsA = processClips(sectionAClips);
const recordingsB = processClips(sectionBClips);

// Combine recordings: A section (Horowitz, Titova, others), then B section (Horowitz, Titova, others)
const recordings: Recording[] = [...recordingsA, ...recordingsB];


export function MusicalExplorer() {
  const [currentPosition, setCurrentPosition] = useState(30);
  // const [showExploreHint, setShowExploreHint] = useState(false); // Removed state
  const [recordingsSectionVisible, setRecordingsSectionVisible] = useState(false);
  const [hoveredGraphLineId, setHoveredGraphLineId] = useState<string | null>(null);
  const [stickiedGraphLineId, setStickiedGraphLineId] = useState<string | null>(null);
  const [staffLines, setStaffLines] = useState<number[]>([]);

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

  const handlePositionChange = (position: number) => {
    setCurrentPosition(position);
  };

  const handleInteractionStart = () => {
    // setShowExploreHint(true); // Removed
    setRecordingsSectionVisible(true);
    
    // Hide hint after 3 seconds - Removed
    // setTimeout(() => {
    //   setShowExploreHint(false);
    // }, 3000);
  };

  const handlePositionUpdate = (position: number) => {
    setCurrentPosition(position);
    // Update recordings visibility based on position
    const isInMainClimaxArea = position > 44 && position < 56; // Matches InteractiveTimeline
    const isInSecondaryClimaxArea = position > 76 && position < 84; // Matches InteractiveTimeline
    const isInAnyClimaxArea = isInMainClimaxArea || isInSecondaryClimaxArea;
    setRecordingsSectionVisible(isInAnyClimaxArea);
  };

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
    <div className="bg-gradient-to-br from-stone-100 to-stone-200 flex justify-center p-2 md:p-4"> {/* Changed amber-50 to stone-100 */}
      {/* Background Staff Lines */}
      <div className="staff-background">
        {staffLines.map((top, index) => (
          <div
            key={index}
            className="staff-line"
            style={{ top: `${top}px` }}
          />
        ))}
      </div>

      {/* Main Container - Optimized for narrow columns */}
      <div className="w-full max-w-3xl glass-effect rounded-2xl shadow-medium overflow-hidden animate-fade-in-up bg-gradient-to-b from-stone-100/95 via-stone-200/90 to-stone-300/95"> {/* Added vertical gradient, ensured high alpha for glass effect */}
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
              <span className="font-display text-3xl text-stone-500 opacity-80">
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
            />


          </section>

          {/* Recordings Section - Only visible in climax area */}
          <RecordingsSection
            recordings={recordings}
            isVisible={recordingsSectionVisible}
            onRecordingHover={handleRecordingHover} // Pass hover handler to recordings section
            stickiedGraphLineId={stickiedGraphLineId} // Pass stickied ID
            onRecordingClick={handleRecordingClick} // Pass click handler
          />
        </main>
      </div>
    </div>
  );
}
