import { priorityColors } from '../../utils/colors';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

const labels = { high: 'Wysoki', medium: 'Sredni', low: 'Niski' };

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = priorityColors[priority];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
      {labels[priority]}
    </span>
  );
}
