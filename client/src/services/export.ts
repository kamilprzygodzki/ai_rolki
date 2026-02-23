import jsPDF from 'jspdf';
import { AnalysisResult } from '../types';

export function exportMarkdown(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=markdown`, '_blank');
}

export function exportJSON(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=json`, '_blank');
}

export function exportPDF(analysis: AnalysisResult, filename: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let y = 20;

  const addText = (text: string, fontSize: number, bold = false) => {
    doc.setFontSize(fontSize);
    if (bold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.5;
    }
    y += 4;
  };

  addText('ReelCutter - Analiza', 18, true);
  addText(`Plik: ${filename}`, 10);
  y += 6;

  addText('Podsumowanie', 14, true);
  addText(analysis.summary, 10);
  y += 4;

  addText('Propozycje rolek', 14, true);
  for (const reel of analysis.reels) {
    addText(`${reel.title} [${reel.priority.toUpperCase()}]`, 12, true);
    addText(`Czas: ${reel.start} - ${reel.end} (${reel.duration})`, 10);
    addText(`Hook: ${reel.hook}`, 10);
    addText(`Dlaczego: ${reel.why}`, 10);
    addText(`Zarys: ${reel.script_outline}`, 10);

    if (reel.editing_tips?.length) {
      addText('Tipy montazowe:', 10, true);
      reel.editing_tips.forEach((tip) => addText(`  - ${tip}`, 10));
    }

    if (reel.hashtags?.length) {
      addText(`Hashtagi: ${reel.hashtags.join(' ')}`, 10);
    }
    y += 4;
  }

  if (analysis.hooks?.length) {
    addText('Propozycje hookow', 14, true);
    analysis.hooks.forEach((hook, i) => addText(`${i + 1}. ${hook}`, 10));
  }

  if (analysis.structure_notes) {
    y += 4;
    addText('Uwagi strukturalne', 14, true);
    addText(analysis.structure_notes, 10);
  }

  doc.save(`reelcutter-${filename.replace(/\.[^/.]+$/, '')}.pdf`);
}
