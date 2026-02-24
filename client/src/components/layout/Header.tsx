import { Scissors } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg">
          <Scissors className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">ReelCutter</h1>
          <p className="text-xs text-dark-400">Analiza wideo dla rolek i shortów</p>
        </div>
      </div>
    </header>
  );
}
