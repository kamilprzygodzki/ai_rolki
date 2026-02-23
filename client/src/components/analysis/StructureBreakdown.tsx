import { LayoutList } from 'lucide-react';

interface StructureBreakdownProps {
  notes: string;
}

export function StructureBreakdown({ notes }: StructureBreakdownProps) {
  if (!notes) return null;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <LayoutList className="w-4 h-4 text-dark-400" />
        <h3 className="text-sm font-semibold text-white">Uwagi strukturalne</h3>
      </div>
      <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">
        {notes}
      </p>
    </div>
  );
}
