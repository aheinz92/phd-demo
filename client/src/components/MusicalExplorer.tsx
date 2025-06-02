import { useState, useEffect } from 'react';
import { InteractiveTimeline } from './InteractiveTimeline';
import { RecordingsSection } from './RecordingsSection';
import { PieceInfo, Recording } from '@/types/music';

const pieceInfo: PieceInfo = {
  composer: "Rachmaninoff",
  title: "Piano Sonata No. 2",
  movement: "2nd Movement",
  startTime: "3:25",
  endTime: "4:17"
};

const recordings: Recording[] = [
  {
    id: "rubinstein-1937",
    artistName: "Arthur Rubinstein",
    recordingYear: 1937,
    colorCode: "#8b2942"
  },
  {
    id: "horowitz-1957",
    artistName: "Vladimir Horowitz",
    recordingYear: 1957,
    colorCode: "#b8860b"
  },
  {
    id: "pires-1996",
    artistName: "Maria João Pires",
    recordingYear: 1996,
    colorCode: "#2e8b57"
  },
  {
    id: "richter-1971",
    artistName: "Sviatoslav Richter",
    recordingYear: 1971,
    colorCode: "#8b4513"
  },
  {
    id: "pollini-1989",
    artistName: "Maurizio Pollini",
    recordingYear: 1989,
    colorCode: "#4169e1"
  },
  {
    id: "ashkenazy-1982",
    artistName: "Vladimir Ashkenazy",
    recordingYear: 1982,
    colorCode: "#9932cc"
  }
];

export function MusicalExplorer() {
  const [currentPosition, setCurrentPosition] = useState(30);
  const [showExploreHint, setShowExploreHint] = useState(false);
  const [recordingsSectionVisible, setRecordingsSectionVisible] = useState(false);
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
    setShowExploreHint(true);
    setRecordingsSectionVisible(true);
    
    // Hide hint after 3 seconds
    setTimeout(() => {
      setShowExploreHint(false);
    }, 3000);
  };

  const handlePositionUpdate = (position: number) => {
    setCurrentPosition(position);
    // Update recordings visibility based on position
    const isInClimaxArea = position > 45 && position < 55;
    setRecordingsSectionVisible(isInClimaxArea);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-2 md:p-4">
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
      <div className="w-full max-w-3xl glass-effect border border-amber-200/60 rounded-2xl shadow-medium overflow-hidden animate-fade-in-up">
        {/* Header - More compact */}
        <header className="bg-gradient-to-r from-amber-50/90 to-stone-50/90 p-4 md:p-6 text-center border-b border-amber-200 relative ornament">
          <div className="font-sans-custom text-xs uppercase tracking-[2px] text-red-900 font-semibold mb-2">
            Currently Exploring
          </div>
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 mb-1">
            {pieceInfo.composer}
          </h1>
          <div className="font-display text-lg md:text-xl italic text-red-900 mb-1">
            {pieceInfo.title}
          </div>
          <div className="font-sans-custom text-sm md:text-base text-stone-700 opacity-80">
            {pieceInfo.movement}
          </div>
        </header>

        {/* Main Content - Reduced padding */}
        <main className="p-4 md:p-6">
          {/* Variance Graph Section - More compact */}
          <section className="glass-effect border border-amber-200/40 rounded-xl p-4 md:p-5 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h2 className="font-display text-lg md:text-xl font-semibold text-stone-800">
                Interpretive Variance
              </h2>
              <div
                className={`font-sans-custom text-xs text-red-900 font-medium transition-opacity duration-300 flex items-center gap-1.5 ${
                  showExploreHint ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Drag to explore this moment
              </div>
            </div>

            {/* Interactive Timeline */}
            <InteractiveTimeline
              onPositionChange={handlePositionUpdate}
              onInteractionStart={handleInteractionStart}
              className="mb-3"
            />

            {/* Current Time Display - Smaller */}
            <div className="text-center">
              <div className="inline-block bg-red-900 text-amber-50 px-3 py-1.5 rounded-full font-sans-custom text-xs font-semibold">
                <svg className="w-3 h-3 inline mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                </svg>
                {formatCurrentTime(currentPosition)}
              </div>
            </div>
          </section>

          {/* Recordings Section - Only visible in climax area */}
          <RecordingsSection
            recordings={recordings}
            isVisible={recordingsSectionVisible}
          />
        </main>
      </div>
    </div>
  );
}
