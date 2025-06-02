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
    <div className={`transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'} ${className}`}>
      <div className="glass-effect border border-amber-200/40 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 font-sans-custom text-xs uppercase tracking-wider text-stone-600 font-semibold">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-900 to-red-700"></div>
          <span>Featured Recordings</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recordings.map((recording, index) => (
            <div
              key={recording.id}
              className="text-center p-4 border border-transparent rounded-xl transition-all duration-300 hover:bg-red-950/5 hover:border-red-900/20 hover:-translate-y-2 group"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: isVisible ? 'staggerIn 0.4s ease-out forwards' : 'none'
              }}
            >
              {/* Album Art Placeholder */}
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300/60 rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="text-2xl text-red-900/70 relative z-10">♪</div>
              </div>
              
              {/* Artist Info */}
              <h3 className="font-display text-lg font-semibold text-stone-800 mb-1 group-hover:text-red-900 transition-colors">
                {recording.artistName}
              </h3>
              <div className="font-sans-custom text-sm text-stone-600 mb-4">
                {recording.recordingYear}
              </div>
              
              {/* Listen Button */}
              <Button
                variant="outline"
                size="sm"
                className="font-sans-custom text-xs border-red-900 text-red-900 hover:bg-red-900 hover:text-amber-50 transition-all duration-200 hover:scale-105"
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
                    Click to listen
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
