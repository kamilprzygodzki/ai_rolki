import { useState } from 'react';
import { RetentionPrediction } from '../../types';
import { parseTimecode } from '../../utils/formatTime';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface RetentionOverlayProps {
  prediction: RetentionPrediction;
  duration: number;
  onSeek: (time: number) => void;
}

const severityColors: Record<string, string> = {
  critical: 'text-red-500',
  moderate: 'text-orange-400',
  minor: 'text-yellow-400',
};

export function RetentionOverlay({ prediction, duration, onSeek }: RetentionOverlayProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ type: 'drop' | 'peak'; index: number } | null>(null);

  if (!prediction || duration <= 0) return null;

  const retentionColor = prediction.estimated_avg_retention >= 60
    ? 'text-green-400 bg-green-500/15'
    : prediction.estimated_avg_retention >= 40
    ? 'text-yellow-400 bg-yellow-500/15'
    : 'text-red-400 bg-red-500/15';

  return (
    <div className="px-2 pb-2 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-dark-500">Retencja</span>
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${retentionColor}`}>
          ~{prediction.estimated_avg_retention}%
        </span>
      </div>

      <div className="relative h-4 bg-dark-800 rounded-full overflow-visible">
        {/* Drop points - red markers */}
        {prediction.drop_points.map((drop, i) => {
          const pos = (parseTimecode(drop.timecode) / duration) * 100;
          const isActive = activeTooltip?.type === 'drop' && activeTooltip.index === i;

          return (
            <div
              key={`drop-${i}`}
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${Math.min(pos, 98)}%` }}
            >
              <button
                onClick={() => onSeek(parseTimecode(drop.timecode))}
                onMouseEnter={() => setActiveTooltip({ type: 'drop', index: i })}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`relative -translate-x-1/2 ${severityColors[drop.severity] || 'text-red-400'} hover:scale-125 transition-transform`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
              </button>
              {isActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl text-xs whitespace-nowrap pointer-events-none">
                  <p className="font-medium text-white">{drop.timecode} — Odpływ widzów</p>
                  <p className="text-dark-300 mt-0.5">{drop.reason}</p>
                  <span className={`text-[10px] ${severityColors[drop.severity]}`}>{drop.severity}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Peak moments - green markers */}
        {prediction.peak_moments.map((peak, i) => {
          const pos = (parseTimecode(peak.timecode) / duration) * 100;
          const isActive = activeTooltip?.type === 'peak' && activeTooltip.index === i;

          return (
            <div
              key={`peak-${i}`}
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${Math.min(pos, 98)}%` }}
            >
              <button
                onClick={() => onSeek(parseTimecode(peak.timecode))}
                onMouseEnter={() => setActiveTooltip({ type: 'peak', index: i })}
                onMouseLeave={() => setActiveTooltip(null)}
                className="relative -translate-x-1/2 text-green-400 hover:scale-125 transition-transform"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              {isActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl text-xs whitespace-nowrap pointer-events-none">
                  <p className="font-medium text-white">{peak.timecode} — Szczyt zaangażowania</p>
                  <p className="text-dark-300 mt-0.5">{peak.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
