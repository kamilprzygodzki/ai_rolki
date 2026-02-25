import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Hash, TrendingUp, Eye, Zap } from 'lucide-react';
import { ReelSuggestion } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { EditingSuggestions } from './EditingSuggestions';
import { EditingGuidePanel } from './EditingGuidePanel';
import { parseTimecode } from '../../utils/formatTime';
import { priorityColors } from '../../utils/colors';

const hookTypeLabels: Record<string, string> = {
  open_loop: 'Open Loop',
  pattern_interrupt: 'Pattern Interrupt',
  controversial: 'Controversial',
  direct_value: 'Direct Value',
};

const hookTypeColors: Record<string, string> = {
  open_loop: 'bg-violet-500/20 text-violet-400',
  pattern_interrupt: 'bg-rose-500/20 text-rose-400',
  controversial: 'bg-amber-500/20 text-amber-400',
  direct_value: 'bg-emerald-500/20 text-emerald-400',
};

interface ReelCardProps {
  reel: ReelSuggestion;
  index: number;
  onSeek: (time: number) => void;
}

export function ReelCard({ reel, index, onSeek }: ReelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHookVariants, setShowHookVariants] = useState(false);
  const colors = priorityColors[reel.priority];

  const handleTimecodeClick = (tc: string) => {
    onSeek(parseTimecode(tc));
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 motion-safe:animate-slide-up ${colors.border} ${colors.bg}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        className="w-full p-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset rounded-t-xl"
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
          <span className="p-2 shrink-0 text-dark-400" aria-hidden="true">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {reel.duration}
          </span>
          <span className="font-mono text-violet-400">
            {reel.start}
          </span>
          <span>–</span>
          <span className="font-mono text-violet-400">
            {reel.end}
          </span>
        </div>

        <p className="text-xs text-dark-300 mt-2 italic">"{reel.hook}"</p>

        {reel.ctr_potential > 0 && (
          <div className="flex items-center gap-2 mt-2.5">
            <TrendingUp className="w-3 h-3 text-dark-500 shrink-0" aria-hidden="true" />
            <span className="text-xs text-dark-500">CTR</span>
            <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={reel.ctr_potential} aria-valuemin={0} aria-valuemax={10}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  reel.ctr_potential >= 8 ? 'bg-green-500' : reel.ctr_potential >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${reel.ctr_potential * 10}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-dark-300">{reel.ctr_potential}/10</span>
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-dark-800/50 pt-3 motion-safe:animate-fade-in">
          <div className="flex gap-2">
            <button
              onClick={() => handleTimecodeClick(reel.start)}
              className="font-mono text-xs text-violet-400 hover:text-violet-300 min-h-[44px] px-3 bg-dark-800/50 rounded-lg transition-colors"
            >
              {reel.start}
            </button>
            <button
              onClick={() => handleTimecodeClick(reel.end)}
              className="font-mono text-xs text-violet-400 hover:text-violet-300 min-h-[44px] px-3 bg-dark-800/50 rounded-lg transition-colors"
            >
              {reel.end}
            </button>
          </div>
          <div>
            <p className="text-xs font-medium text-dark-400 mb-1">Dlaczego zadziała</p>
            <p className="text-sm text-dark-200">{reel.why}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-dark-400 mb-1">Zarys skryptu</p>
            <p className="text-sm text-dark-200">{reel.script_outline}</p>
          </div>

          {reel.retention_strategy && (
            <div>
              <p className="text-xs font-medium text-dark-400 mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3" aria-hidden="true" />
                Strategia retencji
              </p>
              <p className="text-sm text-dark-200">{reel.retention_strategy}</p>
            </div>
          )}

          {/* Feature 1: Editing Guide */}
          {reel.editing_guide && (
            <EditingGuidePanel guide={reel.editing_guide} onSeek={onSeek} />
          )}

          <EditingSuggestions tips={reel.editing_tips} />

          {/* Feature 3: Hook Variants */}
          {reel.hook_variants && reel.hook_variants.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowHookVariants(!showHookVariants)}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Zap className="w-3 h-3" aria-hidden="true" />
                Warianty hooka ({reel.hook_variants.length})
                {showHookVariants ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>

              {showHookVariants && (
                <div className="space-y-2 motion-safe:animate-fade-in">
                  {reel.hook_variants.map((hv, i) => (
                    <div key={i} className="bg-dark-800/50 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 text-xs mt-0.5">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark-200 font-medium">"{hv.text}"</p>
                          {hv.type && (
                            <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${hookTypeColors[hv.type] || 'bg-dark-700 text-dark-400'}`}>
                              {hookTypeLabels[hv.type] || hv.type}
                            </span>
                          )}
                        </div>
                      </div>
                      {hv.visual_description && (
                        <p className="text-[11px] text-dark-400"><span className="text-dark-500">Wizual:</span> {hv.visual_description}</p>
                      )}
                      {hv.audio_description && (
                        <p className="text-[11px] text-dark-400"><span className="text-dark-500">Audio:</span> {hv.audio_description}</p>
                      )}
                      {hv.first_3_seconds && (
                        <p className="text-[11px] text-dark-400"><span className="text-dark-500">Pierwsze 3s:</span> {hv.first_3_seconds}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
