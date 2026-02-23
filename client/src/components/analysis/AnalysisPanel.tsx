import { Sparkles } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { ReelCard } from './ReelCard';
import { HookCard } from './HookCard';
import { TitleCard } from './TitleCard';
import { ThumbnailCard } from './ThumbnailCard';
import { StructureBreakdown } from './StructureBreakdown';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  onSeek: (time: number) => void;
}

export function AnalysisPanel({ analysis, onSeek }: AnalysisPanelProps) {
  return (
    <div className="space-y-4 motion-safe:animate-fade-in">
      {/* Summary */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Podsumowanie</h2>
        </div>
        <p className="text-sm text-dark-300 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Titles */}
      <TitleCard titles={analysis.titles} />

      {/* Thumbnails */}
      <ThumbnailCard thumbnails={analysis.thumbnails} />

      {/* Reels */}
      {analysis.reels.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
            Propozycje rolek ({analysis.reels.length})
          </h3>
          <div className="space-y-3">
            {analysis.reels.map((reel, i) => (
              <ReelCard key={i} reel={reel} index={i} onSeek={onSeek} />
            ))}
          </div>
        </div>
      )}

      {/* Hooks */}
      <HookCard hooks={analysis.hooks} />

      {/* Structure notes */}
      <StructureBreakdown notes={analysis.structure_notes} />
    </div>
  );
}
