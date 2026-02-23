import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Hash } from 'lucide-react';
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
