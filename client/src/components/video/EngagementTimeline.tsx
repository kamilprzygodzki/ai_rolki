import { useState } from 'react';
import { EngagementSegment } from '../../types';
import { parseTimecode } from '../../utils/formatTime';

interface EngagementTimelineProps {
  segments: EngagementSegment[];
  duration: number;
  onSeek: (time: number) => void;
}

const levelColors: Record<string, string> = {
  peak: 'bg-green-500',
  high: 'bg-emerald-400',
  medium: 'bg-yellow-500',
  low: 'bg-red-500',
};

const levelLabels: Record<string, string> = {
  peak: 'Szczyt',
  high: 'Wysokie',
  medium: 'Średnie',
  low: 'Niskie',
};

export function EngagementTimeline({ segments, duration, onSeek }: EngagementTimelineProps) {
  const [tooltip, setTooltip] = useState<{ x: number; segment: EngagementSegment } | null>(null);

  if (!segments || segments.length === 0 || duration <= 0) return null;

  return (
    <div className="px-2 pb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-dark-500">Zaangażowanie</span>
        <div className="flex items-center gap-1.5">
          {Object.entries(levelColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-0.5">
              <div className={`w-2 h-2 rounded-sm ${color}`} />
              <span className="text-[9px] text-dark-600">{levelLabels[level]}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative h-3 bg-dark-800 rounded-full overflow-hidden cursor-pointer"
        onMouseLeave={() => setTooltip(null)}
      >
        {segments.map((seg, i) => {
          const startSec = parseTimecode(seg.start);
          const endSec = parseTimecode(seg.end);
          const left = (startSec / duration) * 100;
          const width = ((endSec - startSec) / duration) * 100;

          return (
            <div
              key={i}
              className={`absolute top-0 h-full ${levelColors[seg.level] || 'bg-dark-600'} hover:brightness-125 transition-all`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
              onClick={() => onSeek(startSec)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                setTooltip({ x: e.clientX - rect.left, segment: seg });
              }}
            />
          );
        })}
      </div>

      {tooltip && (
        <div
          className="absolute z-20 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl text-xs pointer-events-none mt-1"
          style={{ left: `${Math.min(Math.max(tooltip.x, 60), 240)}px`, transform: 'translateX(-50%)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={`w-2 h-2 rounded-sm ${levelColors[tooltip.segment.level]}`} />
            <span className="font-medium text-white">{tooltip.segment.emotion}</span>
          </div>
          <p className="text-dark-400">{tooltip.segment.start} – {tooltip.segment.end}</p>
          <p className="text-dark-300 mt-0.5">{tooltip.segment.note}</p>
        </div>
      )}
    </div>
  );
}
