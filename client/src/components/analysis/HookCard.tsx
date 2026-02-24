import { Zap } from 'lucide-react';
import { HookSuggestion } from '../../types';

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

interface HookCardProps {
  hooks: HookSuggestion[];
}

export function HookCard({ hooks }: HookCardProps) {
  if (!hooks || hooks.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 motion-safe:animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Propozycje hookow</h3>
      </div>
      <ul className="space-y-2">
        {hooks.map((hook, i) => (
          <li
            key={i}
            className="text-sm text-dark-200 bg-dark-800/50 rounded-lg px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <span className="text-violet-400 text-xs mt-0.5">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p>{hook.text}</p>
                {hook.type && (
                  <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${hookTypeColors[hook.type] || 'bg-dark-700 text-dark-400'}`}>
                    {hookTypeLabels[hook.type] || hook.type}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
