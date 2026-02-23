import { Type } from 'lucide-react';
import { TitleSuggestion } from '../../types';

interface TitleCardProps {
  titles: TitleSuggestion[];
}

export function TitleCard({ titles }: TitleCardProps) {
  if (!titles || titles.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Propozycje tytułów ({titles.length})</h3>
      </div>
      <ul className="space-y-3">
        {titles.map((t, i) => (
          <li
            key={i}
            className="bg-dark-800/50 rounded-lg px-4 py-3"
          >
            <div className="flex items-start gap-2 mb-1">
              <span className="text-blue-400 font-mono text-xs mt-0.5">{i + 1}.</span>
              <span className="text-sm text-white font-medium">{t.title}</span>
            </div>
            <div className="ml-5 flex flex-wrap gap-2 mt-1">
              <span className="text-xs bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5">
                {t.style}
              </span>
            </div>
            <p className="ml-5 text-xs text-dark-400 mt-1">{t.why}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
