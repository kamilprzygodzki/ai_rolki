import { Image } from 'lucide-react';
import { ThumbnailSuggestion } from '../../types';

interface ThumbnailCardProps {
  thumbnails: ThumbnailSuggestion[];
}

export function ThumbnailCard({ thumbnails }: ThumbnailCardProps) {
  if (!thumbnails || thumbnails.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Image className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Koncepcje miniatur ({thumbnails.length})</h3>
      </div>
      <div className="space-y-3">
        {thumbnails.map((thumb, i) => (
          <div
            key={i}
            className="bg-dark-800/50 rounded-lg px-4 py-3"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">{i + 1}.</span>
              <p className="text-sm text-dark-200">{thumb.concept}</p>
            </div>
            <div className="ml-5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500">Tekst:</span>
                <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded px-2 py-0.5">
                  {thumb.text_overlay}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs bg-dark-700 text-dark-300 rounded-full px-2 py-0.5">
                  {thumb.style}
                </span>
                <span className="text-xs bg-violet-500/20 text-violet-300 rounded-full px-2 py-0.5">
                  {thumb.reference}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
