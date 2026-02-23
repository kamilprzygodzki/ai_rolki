import { ThumbnailSuggestion } from '../../types';

interface ThumbnailCardProps {
  thumbnails: ThumbnailSuggestion[];
}

export function ThumbnailCard({ thumbnails }: ThumbnailCardProps) {
  if (!thumbnails || thumbnails.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
        Koncepcje miniatur
      </h3>
      <div className="space-y-3">
        {thumbnails.map((thumb, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden border border-dark-800 motion-safe:animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="bg-dark-800 px-4 py-4">
              <p className="text-lg font-bold text-white tracking-tight leading-tight">
                {thumb.text_overlay}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-dark-400">{thumb.style}</span>
                <span className="text-[11px] text-dark-600">&middot;</span>
                <span className="text-[11px] text-violet-400">{thumb.reference}</span>
              </div>
            </div>
            <div className="bg-dark-900 px-4 py-3">
              <p className="text-xs text-dark-300 leading-relaxed">{thumb.concept}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
