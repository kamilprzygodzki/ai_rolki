import { Search } from 'lucide-react';

interface TranscriptSearchProps {
  query: string;
  onChange: (query: string) => void;
}

export function TranscriptSearch({ query, onChange }: TranscriptSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Szukaj w transkrypcji..."
        className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}
