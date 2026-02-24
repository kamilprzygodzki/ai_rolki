import { Palette, User, Layout } from 'lucide-react';
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

              {(thumb.color_palette || thumb.face_expression) && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {thumb.color_palette && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-dark-700 text-amber-400 px-2 py-0.5 rounded-full">
                      <Palette className="w-3 h-3" />
                      {thumb.color_palette}
                    </span>
                  )}
                  {thumb.face_expression && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-dark-700 text-rose-400 px-2 py-0.5 rounded-full">
                      <User className="w-3 h-3" />
                      {thumb.face_expression}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="bg-dark-900 px-4 py-3 space-y-2">
              <p className="text-xs text-dark-300 leading-relaxed">{thumb.concept}</p>
              {thumb.composition && (
                <p className="text-xs text-dark-400 leading-relaxed flex items-center gap-1">
                  <Layout className="w-3 h-3 shrink-0" />
                  {thumb.composition}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
