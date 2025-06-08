import { useState, useEffect } from 'react';
import { InteractiveTimeline } from './InteractiveTimeline';
import { RecordingsSection } from './RecordingsSection';
import { PieceInfo, RecordingClip } from '@/types/music'; // Updated to RecordingClip

// Removed old audio imports

const pieceInfo: PieceInfo = {
  composer: "Rachmaninoff",
  title: "Piano Sonata No. 2",
  movement: "2nd Movement",
  startTime: "3:25",
  endTime: "4:17"
};

// Removed old hardcoded recordings array

interface MusicalExplorerProps {
  clips: RecordingClip[];
}

export function MusicalExplorer({ clips }: MusicalExplorerProps) {
console.log('MusicalExplorer: received clips:', clips);
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
    const startSeconds = 3 * 60 + 25; // 3:25
    const endSeconds = 4 * 60 + 17; // 4:17
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
            clips={clips} // Pass clips directly
            isVisible={recordingsSectionVisible}
            // onRecordingHover, stickiedGraphLineId, and onRecordingClick are removed
            // as they are not active props in RecordingsSectionProps
          />
        </main>
      </div>
    </div>
  );
}
