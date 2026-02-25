import { useState } from 'react';
import { TitleSuggestion } from '../../types';

const platformLabels: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};

const platformColors: Record<string, string> = {
  youtube: 'bg-red-500/15 text-red-400',
  tiktok: 'bg-cyan-500/15 text-cyan-400',
  instagram: 'bg-pink-500/15 text-pink-400',
};

interface TitleCardProps {
  titles: TitleSuggestion[];
}

type PlatformFilter = 'all' | 'youtube' | 'tiktok' | 'instagram';

export function TitleCard({ titles }: TitleCardProps) {
  const [filter, setFilter] = useState<PlatformFilter>('all');

  if (!titles || titles.length === 0) return null;

  const hasPlatforms = titles.some(t => t.platform);
  const filtered = filter === 'all' ? titles : titles.filter(t => t.platform === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
          Propozycje tytułów
        </h3>
        {hasPlatforms && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                filter === 'all' ? 'bg-violet-500/20 text-violet-400' : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              Wszystkie
            </button>
            {(['youtube', 'tiktok', 'instagram'] as const).map(p => {
              const count = titles.filter(t => t.platform === p).length;
              if (count === 0) return null;
              return (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    filter === p ? platformColors[p] : 'text-dark-500 hover:text-dark-300'
                  }`}
                >
                  {platformLabels[p]} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {filtered.map((t, i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2.5 hover:bg-dark-800/40 transition-colors motion-safe:animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-dark-600 tabular-nums shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[15px] text-white font-medium leading-snug">{t.title}</p>
                  {t.platform && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${platformColors[t.platform]}`}>
                      {platformLabels[t.platform]}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-[11px] bg-violet-500/15 text-violet-400 rounded-full px-2 py-0.5">
                    {t.style}
                  </span>
                  <span className="text-[11px] text-dark-500 leading-relaxed">{t.why}</span>
                </div>
                {(t.paired_thumbnail_index !== undefined || t.paired_hook_type) && (
                  <div className="flex items-center gap-2 mt-1">
                    {t.paired_thumbnail_index !== undefined && (
                      <span className="text-[10px] text-dark-500">
                        Miniatura #{t.paired_thumbnail_index + 1}
                      </span>
                    )}
                    {t.paired_hook_type && (
                      <span className="text-[10px] text-dark-500">
                        Hook: {t.paired_hook_type}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
