import { memo } from 'react';
import { TranscriptSegment as Segment } from '../../types';
import { formatSeconds } from '../../utils/formatTime';

interface TranscriptSegmentProps {
  segment: Segment;
  isActive: boolean;
  isHighlighted: boolean;
  onSeek: (time: number) => void;
}

export const TranscriptSegmentRow = memo(function TranscriptSegmentRow({
  segment,
  isActive,
  isHighlighted,
  onSeek,
}: TranscriptSegmentProps) {
  return (
    <button
      type="button"
      className={`
        w-full flex gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset
        ${isActive ? 'bg-violet-500/20 border-l-2 border-violet-500' : ''}
        ${isHighlighted ? 'bg-yellow-500/10' : ''}
        ${!isActive && !isHighlighted ? 'hover:bg-dark-800/50' : ''}
      `}
      onClick={() => onSeek(segment.start)}
    >
      <span className="text-xs font-mono text-violet-400 whitespace-nowrap pt-0.5 shrink-0">
        {formatSeconds(segment.start)}
      </span>
      <span className="text-sm text-dark-200 leading-relaxed">{segment.text}</span>
    </button>
  );
});
