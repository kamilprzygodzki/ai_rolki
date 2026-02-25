import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileJson, FileDown, Film, FileVideo } from 'lucide-react';
import { exportMarkdown, exportJSON, exportPDF, exportEDL, exportFCPXML } from '../../services/export';
import { AnalysisResult } from '../../types';

interface ExportButtonProps {
  sessionId: string;
  analysis?: AnalysisResult;
  filename?: string;
}

export function ExportButton({ sessionId, analysis, filename }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        Eksportuj
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 py-1 min-w-[180px] motion-safe:animate-fade-in"
        >
          <button
            role="menuitem"
            onClick={() => {
              exportMarkdown(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-dark-400" aria-hidden="true" />
            Markdown
          </button>
          <button
            role="menuitem"
            onClick={() => {
              if (analysis && filename) {
                exportPDF(analysis, filename);
              }
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-dark-400" aria-hidden="true" />
            PDF
          </button>
          <button
            role="menuitem"
            onClick={() => {
              exportJSON(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileJson className="w-4 h-4 text-dark-400" aria-hidden="true" />
            JSON
          </button>

          <div className="border-t border-dark-700 my-1" />

          <button
            role="menuitem"
            onClick={() => {
              exportEDL(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <Film className="w-4 h-4 text-dark-400" aria-hidden="true" />
            EDL (DaVinci/Premiere)
          </button>
          <button
            role="menuitem"
            onClick={() => {
              exportFCPXML(sessionId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileVideo className="w-4 h-4 text-dark-400" aria-hidden="true" />
            FCPXML (Final Cut Pro)
          </button>
        </div>
      )}
    </div>
  );
}
