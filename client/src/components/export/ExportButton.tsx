import { useState } from 'react';
import { Download, FileText, FileJson, FileDown } from 'lucide-react';
import { exportMarkdown, exportJSON, exportPDF } from '../../services/export';
import { AnalysisResult } from '../../types';

interface ExportButtonProps {
  sessionId: string;
  analysis?: AnalysisResult;
  filename?: string;
}

export function ExportButton({ sessionId, analysis, filename }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Eksportuj
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 py-1 min-w-[160px] animate-fade-in">
          <button
            onClick={() => {
              exportMarkdown(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-dark-400" />
            Markdown
          </button>
          <button
            onClick={() => {
              if (analysis && filename) {
                exportPDF(analysis, filename);
              }
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-dark-400" />
            PDF
          </button>
          <button
            onClick={() => {
              exportJSON(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileJson className="w-4 h-4 text-dark-400" />
            JSON
          </button>
        </div>
      )}
    </div>
  );
}
