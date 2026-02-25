import { useState } from 'react';
import { Scissors, Film, ZoomIn, Type, Music, ChevronDown, ChevronUp, Gauge } from 'lucide-react';
import { EditingGuide } from '../../types';
import { parseTimecode } from '../../utils/formatTime';

interface EditingGuidePanelProps {
  guide: EditingGuide;
  onSeek: (time: number) => void;
}

const paceLabels: Record<string, string> = {
  fast: 'Szybkie',
  medium: 'Średnie',
  slow: 'Wolne',
};

const paceColors: Record<string, string> = {
  fast: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  slow: 'bg-blue-500/20 text-blue-400',
};

const cutTypeLabels: Record<string, string> = {
  jump_cut: 'Jump Cut',
  hard_cut: 'Hard Cut',
  j_cut: 'J-Cut',
  l_cut: 'L-Cut',
};

const zoomTypeLabels: Record<string, string> = {
  zoom_in: 'Zoom In',
  zoom_out: 'Zoom Out',
  slow_zoom: 'Slow Zoom',
};

const overlayStyleLabels: Record<string, string> = {
  lower_third: 'Lower Third',
  center: 'Center',
  caption: 'Caption',
};

export function EditingGuidePanel({ guide, onSeek }: EditingGuidePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContent = guide.cuts.length > 0 || guide.broll_moments.length > 0 ||
    guide.zoom_moments.length > 0 || guide.text_overlays.length > 0 || guide.music_sync;

  if (!hasContent && !guide.pace) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Scissors className="w-3 h-3" aria-hidden="true" />
        Instrukcja montażu
        <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${paceColors[guide.pace] || 'bg-dark-700 text-dark-400'}`}>
          <Gauge className="w-2.5 h-2.5 inline mr-0.5" />
          {paceLabels[guide.pace] || guide.pace}
        </span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="space-y-3 pl-1 motion-safe:animate-fade-in">
          {/* Cuts */}
          {guide.cuts.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1 flex items-center gap-1">
                <Scissors className="w-2.5 h-2.5" /> Cięcia
              </p>
              <div className="space-y-1">
                {guide.cuts.map((cut, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <button
                      onClick={() => onSeek(parseTimecode(cut.timecode))}
                      className="font-mono text-violet-400 hover:text-violet-300 shrink-0"
                    >
                      {cut.timecode}
                    </button>
                    <span className="text-[10px] bg-dark-700 text-dark-300 px-1 py-0.5 rounded shrink-0">
                      {cutTypeLabels[cut.type] || cut.type}
                    </span>
                    <span className="text-dark-300">{cut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B-roll */}
          {guide.broll_moments.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1 flex items-center gap-1">
                <Film className="w-2.5 h-2.5" /> B-Roll
              </p>
              <div className="space-y-1">
                {guide.broll_moments.map((br, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <button
                      onClick={() => onSeek(parseTimecode(br.start))}
                      className="font-mono text-violet-400 hover:text-violet-300 shrink-0"
                    >
                      {br.start}–{br.end}
                    </button>
                    <span className="text-dark-300">{br.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zoom */}
          {guide.zoom_moments.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1 flex items-center gap-1">
                <ZoomIn className="w-2.5 h-2.5" /> Zoom
              </p>
              <div className="space-y-1">
                {guide.zoom_moments.map((zm, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <button
                      onClick={() => onSeek(parseTimecode(zm.timecode))}
                      className="font-mono text-violet-400 hover:text-violet-300 shrink-0"
                    >
                      {zm.timecode}
                    </button>
                    <span className="text-[10px] bg-dark-700 text-dark-300 px-1 py-0.5 rounded shrink-0">
                      {zoomTypeLabels[zm.type] || zm.type}
                    </span>
                    <span className="text-dark-300">{zm.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Overlays */}
          {guide.text_overlays.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1 flex items-center gap-1">
                <Type className="w-2.5 h-2.5" /> Tekst Overlay
              </p>
              <div className="space-y-1">
                {guide.text_overlays.map((to, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <button
                      onClick={() => onSeek(parseTimecode(to.timecode))}
                      className="font-mono text-violet-400 hover:text-violet-300 shrink-0"
                    >
                      {to.timecode}
                    </button>
                    <span className="text-[10px] bg-dark-700 text-dark-300 px-1 py-0.5 rounded shrink-0">
                      {overlayStyleLabels[to.style] || to.style}
                    </span>
                    <span className="text-dark-200 font-medium">"{to.text}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Music Sync */}
          {guide.music_sync && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1 flex items-center gap-1">
                <Music className="w-2.5 h-2.5" /> Muzyka
              </p>
              <p className="text-xs text-dark-300">{guide.music_sync}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
