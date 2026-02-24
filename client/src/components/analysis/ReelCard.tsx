import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Hash, TrendingUp, Eye } from 'lucide-react';
import { ReelSuggestion } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { EditingSuggestions } from './EditingSuggestions';
import { parseTimecode } from '../../utils/formatTime';
import { priorityColors } from '../../utils/colors';

interface ReelCardProps {
  reel: ReelSuggestion;
  index: number;
  onSeek: (time: number) => void;
}

export function ReelCard({ reel, index, onSeek }: ReelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = priorityColors[reel.priority];

  const handleTimecodeClick = (tc: string) => {
    onSeek(parseTimecode(tc));
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 animate-slide-up ${colors.border} ${colors.bg}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <PriorityBadge priority={reel.priority} />
              <span className="text-xs text-dark-500">#{index + 1}</span>
            </div>
            <h4 className="font-semibold text-white text-sm leading-tight">
              {reel.title}
            </h4>
          </div>
          <button className="p-1 shrink-0 text-dark-400">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {reel.duration}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTimecodeClick(reel.start);
            }}
            className="font-mono text-violet-400 hover:text-violet-300"
          >
            {reel.start}
          </button>
          <span>-</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTimecodeClick(reel.end);
            }}
            className="font-mono text-violet-400 hover:text-violet-300"
          >
            {reel.end}
          </button>
        </div>

        <p className="text-xs text-dark-300 mt-2 italic">"{reel.hook}"</p>

        {reel.ctr_potential > 0 && (
          <div className="flex items-center gap-2 mt-2.5">
            <TrendingUp className="w-3 h-3 text-dark-500 shrink-0" />
            <span className="text-[11px] text-dark-500">CTR</span>
            <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${reel.ctr_potential * 10}%`,
                  backgroundColor: reel.ctr_potential >= 8 ? '#22c55e' : reel.ctr_potential >= 5 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
            <span className="text-[11px] font-mono font-semibold text-dark-300">{reel.ctr_potential}/10</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-dark-800/50 pt-3 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-dark-400 mb-1">Dlaczego zadziala</p>
            <p className="text-sm text-dark-200">{reel.why}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-dark-400 mb-1">Zarys skryptu</p>
            <p className="text-sm text-dark-200">{reel.script_outline}</p>
          </div>

          {reel.retention_strategy && (
            <div>
              <p className="text-xs font-medium text-dark-400 mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Strategia retencji
              </p>
              <p className="text-sm text-dark-200">{reel.retention_strategy}</p>
            </div>
          )}

          <EditingSuggestions tips={reel.editing_tips} />

          {reel.hashtags && reel.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {reel.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
