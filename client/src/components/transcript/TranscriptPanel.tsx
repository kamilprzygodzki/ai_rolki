import { useRef, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { TranscriptResult, TranscriptSegment } from '../../types';
import { TranscriptSegmentRow } from './TranscriptSegment';
import { TranscriptSearch } from './TranscriptSearch';

interface TranscriptPanelProps {
  transcript: TranscriptResult;
  currentTime: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSeek: (time: number) => void;
  filteredSegments: TranscriptSegment[];
}

export function TranscriptPanel({
  transcript,
  currentTime,
  searchQuery,
  onSearchChange,
  onSeek,
  filteredSegments,
}: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    const activeEl = containerRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime]);

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl animate-fade-in">
      <div className="p-4 border-b border-dark-800 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-dark-400" />
          <h2 className="text-sm font-semibold text-white">Transkrypcja</h2>
          <span className="text-xs text-dark-500">
            {transcript.segments.length} segmentow
          </span>
        </div>
        <TranscriptSearch query={searchQuery} onChange={onSearchChange} />
      </div>

      <div
        ref={containerRef}
        className="max-h-[400px] overflow-y-auto p-2 space-y-0.5"
      >
        {filteredSegments.length === 0 ? (
          <p className="text-sm text-dark-500 text-center py-8">
            Brak wynikow wyszukiwania
          </p>
        ) : (
          filteredSegments.map((seg, i) => {
            const isActive =
              currentTime >= seg.start && currentTime < seg.end;
            const isHighlighted =
              highlightRange !== null &&
              seg.start >= highlightRange[0] &&
              seg.end <= highlightRange[1];

            return (
              <div key={i} data-active={isActive}>
                <TranscriptSegmentRow
                  segment={seg}
                  isActive={isActive}
                  isHighlighted={isHighlighted}
                  onSeek={onSeek}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Export setter for highlight range to be used by analysis cards
export type SetHighlightRange = (range: [number, number] | null) => void;
