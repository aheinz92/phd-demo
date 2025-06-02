import { useState } from 'react';
import { Recording } from '@/types/music';
import { Button } from '@/components/ui/button';

interface RecordingsSectionProps {
  recordings: Recording[];
  isVisible: boolean;
  className?: string;
}

export function RecordingsSection({ recordings, isVisible, className = "" }: RecordingsSectionProps) {
  const [playingStates, setPlayingStates] = useState<Record<string, boolean>>({});

  // Color mapping that matches the timeline lines
  const timelineColors = [
    'hsl(var(--accent))', // Rubinstein - red
    '#b8860b',            // Horowitz - gold
    '#2e8b57'            // Pires - teal
  ];

  const handlePlayClick = (recordingId: string) => {
    setPlayingStates(prev => ({
      ...prev,
      [recordingId]: !prev[recordingId]
    }));

    // Simulate audio playback
    setTimeout(() => {
      setPlayingStates(prev => ({
        ...prev,
        [recordingId]: false
      }));
    }, 3000);
  };

  return (
    <div className={`transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'} ${className}`}>
      <div className="glass-effect border border-amber-200/40 rounded-2xl p-8 shadow-medium">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-900 to-amber-600 animate-pulse"></div>
          <span className="font-sans-custom text-sm uppercase tracking-wider text-stone-700 font-semibold">
            Climax Section Recordings
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recordings.map((recording, index) => (
            <div
              key={recording.id}
              className="text-center group"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: isVisible ? 'staggerIn 0.5s ease-out forwards' : 'none'
              }}
            >
              {/* Color-coded border matching timeline */}
              <div 
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-3 hover:shadow-lg border-2"
                style={{ 
                  borderColor: timelineColors[index],
                  backgroundColor: `${timelineColors[index]}08`
                }}
              >
                {/* Album Art Placeholder with color accent */}
                <div 
                  className="w-28 h-28 mx-auto mb-4 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm border-2"
                  style={{ 
                    borderColor: timelineColors[index],
                    background: `linear-gradient(135deg, ${timelineColors[index]}15, ${timelineColors[index]}05)`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div 
                    className="text-3xl relative z-10"
                    style={{ color: timelineColors[index] }}
                  >
                    ♪
                  </div>
                </div>
                
                {/* Artist Info */}
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-2 group-hover:scale-105 transition-transform">
                  {recording.artistName}
                </h3>
                <div className="font-sans-custom text-sm text-stone-600 mb-4 font-medium">
                  {recording.recordingYear}
                </div>
                
                {/* Color-coded timeline reference */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div 
                    className="w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: timelineColors[index] }}
                  ></div>
                  <span className="font-sans-custom text-xs text-stone-500 uppercase tracking-wider">
                    Timeline Match
                  </span>
                </div>
                
                {/* Listen Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="font-sans-custom text-xs transition-all duration-200 hover:scale-105 border-2"
                  style={{ 
                    borderColor: timelineColors[index],
                    color: timelineColors[index]
                  }}
                  onClick={() => handlePlayClick(recording.id)}
                  disabled={playingStates[recording.id]}
                >
                  {playingStates[recording.id] ? (
                    <>
                      <div className="w-3 h-3 mr-2">
                        <div className="animate-pulse w-full h-full bg-current rounded-full"></div>
                      </div>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Listen to snippet
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
