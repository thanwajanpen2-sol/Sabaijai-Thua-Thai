import React from 'react';

interface WaveformProps {
  isListening: boolean;
  audioLevel?: number; // 0 - 100 from real AudioContext
  barCount?: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  isListening,
  audioLevel = 0,
  barCount = 32,
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const mid = barCount / 2;
    const dist = Math.abs(i - mid) / mid;
    // Base curve
    const wave = Math.sin((i / barCount) * Math.PI) * 0.7 + 0.3;
    // Combine with real audioLevel if available, else smooth baseline
    const dynamicBoost = audioLevel > 0 ? (audioLevel / 100) * 80 * wave : 0;
    const heightPercent = isListening
      ? Math.min(100, Math.max(14, dynamicBoost > 5 ? dynamicBoost : wave * 45))
      : 8;

    const delay = (i % 8) * 0.08;
    const duration = 0.5 + (i % 6) * 0.08;

    return { id: i, heightPercent, delay, duration };
  });

  return (
    <div className="flex h-16 w-full items-center justify-center space-x-1 sm:space-x-1.5 px-2 overflow-hidden">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="w-1 sm:w-1.5 rounded-full transition-all duration-150"
          style={{
            height: `${bar.heightPercent}%`,
            backgroundColor: isListening
              ? bar.id % 4 === 0
                ? '#00C2A8'
                : bar.id % 3 === 0
                ? '#6C63FF'
                : bar.id % 2 === 0
                ? '#A78BFA'
                : '#FFD166'
              : 'rgba(255, 255, 255, 0.12)',
            animation:
              isListening && audioLevel < 5
                ? `pulseWave ${bar.duration}s ease-in-out infinite alternate ${bar.delay}s`
                : 'none',
            boxShadow:
              isListening && audioLevel > 15
                ? '0 0 10px rgba(0, 194, 168, 0.6)'
                : isListening
                ? '0 0 6px rgba(108, 99, 255, 0.3)'
                : 'none',
          }}
        />
      ))}
    </div>
  );
};
