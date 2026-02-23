import { TranscriptSegment as Segment } from '../../types';
import { formatSeconds } from '../../utils/formatTime';

interface TranscriptSegmentProps {
  segment: Segment;
  isActive: boolean;
  isHighlighted: boolean;
  onSeek: (time: number) => void;
}

export function TranscriptSegmentRow({
  segment,
  isActive,
  isHighlighted,
  onSeek,
}: TranscriptSegmentProps) {
  return (
    <div
      className={`
        flex gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
        ${isActive ? 'bg-violet-500/20 border-l-2 border-violet-500' : ''}
        ${isHighlighted ? 'bg-yellow-500/10' : ''}
        ${!isActive && !isHighlighted ? 'hover:bg-dark-800/50' : ''}
      `}
      onClick={() => onSeek(segment.start)}
    >
      <button
        className="text-xs font-mono text-violet-400 hover:text-violet-300 whitespace-nowrap pt-0.5 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onSeek(segment.start);
        }}
      >
        {formatSeconds(segment.start)}
      </button>
      <p className="text-sm text-dark-200 leading-relaxed">{segment.text}</p>
    </div>
  );
}
