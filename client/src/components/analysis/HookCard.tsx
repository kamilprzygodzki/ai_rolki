import { Zap } from 'lucide-react';

interface HookCardProps {
  hooks: string[];
}

export function HookCard({ hooks }: HookCardProps) {
  if (!hooks || hooks.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Propozycje hookow</h3>
      </div>
      <ul className="space-y-2">
        {hooks.map((hook, i) => (
          <li
            key={i}
            className="text-sm text-dark-200 bg-dark-800/50 rounded-lg px-3 py-2"
          >
            <span className="text-yellow-400 font-mono text-xs mr-2">{i + 1}.</span>
            {hook}
          </li>
        ))}
      </ul>
    </div>
  );
}
