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

  const formatCurrentTime = (position: number) => {
    const startSeconds = 3 * 60 + 25; // 3:25
    const endSeconds = 4 * 60 + 17; // 4:17
    const currentSeconds = startSeconds + (position / 100) * (endSeconds - startSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-4 md:p-8">
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

      {/* Main Container */}
      <div className="w-full max-w-6xl glass-effect border border-amber-200/60 rounded-3xl shadow-medium overflow-hidden animate-fade-in-up">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-50/90 to-stone-50/90 p-8 md:p-12 text-center border-b-2 border-amber-200 relative ornament">
          <div className="font-sans-custom text-sm uppercase tracking-[3px] text-red-900 font-semibold mb-4">
            Currently Exploring
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-2">
            {pieceInfo.composer}
          </h1>
          <div className="font-display text-xl md:text-2xl lg:text-3xl italic text-red-900 mb-2">
            {pieceInfo.title}
          </div>
          <div className="font-sans-custom text-base md:text-lg text-stone-700 opacity-80">
            {pieceInfo.movement}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 md:p-12">
          {/* Variance Graph Section */}
          <section className="glass-effect border border-amber-200/40 rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-stone-800">
                Interpretive Variance
              </h2>
              <div
                className={`font-sans-custom text-sm text-red-900 font-medium transition-opacity duration-300 flex items-center gap-2 ${
                  showExploreHint ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Drag to explore this moment
              </div>
            </div>

            {/* Interactive Timeline */}
            <InteractiveTimeline
              onPositionChange={handlePositionChange}
              onInteractionStart={handleInteractionStart}
              className="mb-4"
            />

            {/* Current Time Display */}
            <div className="text-center">
              <div className="inline-block bg-red-900 text-amber-50 px-4 py-2 rounded-full font-sans-custom text-sm font-semibold">
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                </svg>
                {formatCurrentTime(currentPosition)}
              </div>
            </div>
          </section>

          {/* Legend and Recordings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Legend */}
            <div className="lg:col-span-1">
              <div className="glass-effect border border-amber-200/40 rounded-2xl p-6">
                <div className="font-sans-custom text-xs uppercase tracking-wider text-stone-600 font-semibold mb-4">
                  Recording Range
                </div>
                
                {/* Median Indicator */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-stone-100/50 rounded-lg">
                  <div className="w-5 h-1 bg-stone-400 opacity-60 rounded-sm"></div>
                  <span className="font-sans-custom text-sm font-medium text-stone-700">
                    Median Recording Range
                  </span>
                </div>

                {/* Individual Recordings */}
                <ul className="space-y-3">
                  {recordings.map((recording, index) => {
                    const colors = ['#8b2942', '#b8860b', '#2e8b57'];
                    return (
                      <li
                        key={recording.id}
                        className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-red-950/5 hover:translate-x-1 cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index] }}
                        ></div>
                        <span className="font-sans-custom text-sm text-stone-700">
                          {recording.artistName}
                        </span>
                        <span className="font-sans-custom text-xs text-stone-500">
                          ({recording.recordingYear})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Recordings Section */}
            <div className="lg:col-span-2">
              <RecordingsSection
                recordings={recordings}
                isVisible={recordingsSectionVisible}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
