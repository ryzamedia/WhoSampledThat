import { memo, useMemo } from 'react';

interface WaveformPlayerProps {
  isPlaying: boolean;
  duration?: number; // duration in seconds (optional)
  currentTime?: number;
}

const WaveformPlayer = memo(({ isPlaying, duration, currentTime = 0 }: WaveformPlayerProps) => {
  const remainingTime = duration ? Math.max(0, duration - currentTime) : 0;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = Math.floor(remainingTime % 60);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Memoize bar heights to avoid regeneration on every render
  const barHeights = useMemo(() => 
    Array.from({ length: 12 }, () => Math.random() * 40 + 30),
    []
  );
  
  // Memoize bars to avoid recreation on every render
  const bars = useMemo(() => 
    barHeights.map((height, i) => (
      <div
        key={i}
        className={`waveform-bar ${isPlaying ? 'animate' : ''}`}
        style={{
          height: `${height}%`,
          animationDelay: `${i * 0.1}s`,
          animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
        }}
      />
    )),
    [barHeights, isPlaying]
  );

  if (!isPlaying) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Waveform */}
      <div className="flex items-center gap-1 h-6">
        {bars}
      </div>
      
      {/* Countdown - only show if duration exists */}
      {duration && (
        <div className="text-white font-mono text-sm font-bold">
          {formattedTime}
        </div>
      )}
    </div>
  );
});

export default WaveformPlayer; 