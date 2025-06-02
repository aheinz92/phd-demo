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
    <div className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-98 pointer-events-none'} ${className}`}>
      <div className="glass-effect border border-amber-200/40 rounded-xl p-4 shadow-medium">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-900 to-amber-600 animate-pulse"></div>
          <span className="font-sans-custom text-xs uppercase tracking-wider text-stone-700 font-semibold">
            Climax Section Recordings
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recordings.map((recording, index) => (
            <div
              key={recording.id}
              className="text-center group"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: isVisible ? 'staggerIn 0.4s ease-out forwards' : 'none'
              }}
            >
              {/* Color-coded border matching timeline */}
              <div 
                className="p-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border"
                style={{ 
                  borderColor: timelineColors[index],
                  backgroundColor: `${timelineColors[index]}06`
                }}
              >
                {/* Album Art Placeholder with color accent */}
                <div 
                  className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border"
                  style={{ 
                    borderColor: timelineColors[index],
                    background: `linear-gradient(135deg, ${timelineColors[index]}12, ${timelineColors[index]}04)`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
                  <div 
                    className="text-xl relative z-10"
                    style={{ color: timelineColors[index] }}
                  >
                    ♪
                  </div>
                </div>
                
                {/* Artist Info */}
                <h3 className="font-display text-sm font-semibold text-stone-800 mb-1 group-hover:scale-105 transition-transform leading-tight">
                  {recording.artistName}
                </h3>
                <div className="font-sans-custom text-xs text-stone-600 mb-3 font-medium">
                  {recording.recordingYear}
                </div>
                
                {/* Color-coded timeline reference */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <div 
                    className="w-6 h-0.5 rounded-full"
                    style={{ backgroundColor: timelineColors[index] }}
                  ></div>
                  <span className="font-sans-custom text-xs text-stone-500 uppercase tracking-wide">
                    Match
                  </span>
                </div>
                
                {/* Listen Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="font-sans-custom text-xs transition-all duration-200 hover:scale-105 border h-7 px-3"
                  style={{ 
                    borderColor: timelineColors[index],
                    color: timelineColors[index]
                  }}
                  onClick={() => handlePlayClick(recording.id)}
                  disabled={playingStates[recording.id]}
                >
                  {playingStates[recording.id] ? (
                    <>
                      <div className="w-2 h-2 mr-1.5">
                        <div className="animate-pulse w-full h-full bg-current rounded-full"></div>
                      </div>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-2.5 h-2.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Listen
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
