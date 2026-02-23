import { TitleSuggestion } from '../../types';

interface TitleCardProps {
  titles: TitleSuggestion[];
}

export function TitleCard({ titles }: TitleCardProps) {
  if (!titles || titles.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
        Propozycje tytułów
      </h3>
      <div className="space-y-1">
        {titles.map((t, i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2.5 hover:bg-dark-800/40 transition-colors motion-safe:animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-dark-600 tabular-nums shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[15px] text-white font-medium leading-snug">{t.title}</p>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-[11px] bg-violet-500/15 text-violet-400 rounded-full px-2 py-0.5">
                    {t.style}
                  </span>
                  <span className="text-[11px] text-dark-500 leading-relaxed">{t.why}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
