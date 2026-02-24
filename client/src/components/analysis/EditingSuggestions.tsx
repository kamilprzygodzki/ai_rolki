import { Clapperboard } from 'lucide-react';

interface EditingSuggestionsProps {
  tips: string[];
}

export function EditingSuggestions({ tips }: EditingSuggestionsProps) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-dark-400">
        <Clapperboard className="w-3 h-3" aria-hidden="true" />
        Tipy montażowe
      </div>
      <ul className="space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="text-xs text-dark-300 flex gap-2">
            <span className="text-dark-600 shrink-0">-</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
