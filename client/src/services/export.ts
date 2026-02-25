import jsPDF from 'jspdf';
import { AnalysisResult } from '../types';

export function exportMarkdown(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=markdown`, '_blank');
}

export function exportJSON(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=json`, '_blank');
}

export function exportEDL(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=edl`, '_blank');
}

export function exportFCPXML(sessionId: string): void {
  window.open(`/api/export/${sessionId}?format=fcpxml`, '_blank');
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

  if (analysis.titles?.length) {
    addText('Propozycje tytulow', 14, true);
    analysis.titles.forEach((t, i) => {
      const platformTag = t.platform ? ` [${t.platform.toUpperCase()}]` : '';
      addText(`${i + 1}. ${t.title}${platformTag}`, 11, true);
      addText(`   Styl: ${t.style}`, 10);
      addText(`   Dlaczego: ${t.why}`, 10);
    });
    y += 4;
  }

  if (analysis.thumbnails?.length) {
    addText('Koncepcje miniatur', 14, true);
    analysis.thumbnails.forEach((th, i) => {
      addText(`${i + 1}. ${th.concept}`, 11, true);
      addText(`   Tekst overlay: ${th.text_overlay}`, 10);
      addText(`   Styl: ${th.style}`, 10);
      addText(`   Inspiracja: ${th.reference}`, 10);
    });
    y += 4;
  }

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

    // Feature 1: Editing Guide
    if (reel.editing_guide) {
      const eg = reel.editing_guide;
      addText(`Instrukcja montazu (tempo: ${eg.pace}):`, 10, true);
      if (eg.cuts?.length) {
        eg.cuts.forEach(c => addText(`  Ciecie ${c.timecode} [${c.type}]: ${c.description}`, 9));
      }
      if (eg.broll_moments?.length) {
        eg.broll_moments.forEach(b => addText(`  B-Roll ${b.start}-${b.end}: ${b.suggestion}`, 9));
      }
      if (eg.zoom_moments?.length) {
        eg.zoom_moments.forEach(z => addText(`  Zoom ${z.timecode} [${z.type}]: ${z.reason}`, 9));
      }
      if (eg.text_overlays?.length) {
        eg.text_overlays.forEach(t => addText(`  Tekst ${t.timecode} [${t.style}]: "${t.text}"`, 9));
      }
      if (eg.music_sync) {
        addText(`  Muzyka: ${eg.music_sync}`, 9);
      }
    }

    // Feature 3: Hook Variants
    if (reel.hook_variants?.length) {
      addText('Warianty hooka:', 10, true);
      reel.hook_variants.forEach((hv, j) => {
        addText(`  ${j + 1}. "${hv.text}" [${hv.type}]`, 9);
        if (hv.first_3_seconds) addText(`     Pierwsze 3s: ${hv.first_3_seconds}`, 9);
      });
    }

    if (reel.hashtags?.length) {
      addText(`Hashtagi: ${reel.hashtags.join(' ')}`, 10);
    }
    y += 4;
  }

  if (analysis.hooks?.length) {
    addText('Propozycje hookow', 14, true);
    analysis.hooks.forEach((hook, i) => {
      const text = typeof hook === 'string' ? hook : `${hook.text} [${hook.type}]`;
      addText(`${i + 1}. ${text}`, 10);
    });
  }

  // Feature 2: Engagement Map
  if (analysis.engagement_map?.length) {
    y += 4;
    addText('Mapa zaangazowania', 14, true);
    analysis.engagement_map.forEach(seg => {
      addText(`${seg.start}-${seg.end} [${seg.level}] ${seg.emotion}: ${seg.note}`, 9);
    });
  }

  // Feature 5: Retention Prediction
  if (analysis.retention_prediction) {
    const rp = analysis.retention_prediction;
    y += 4;
    addText('Predykcja retencji', 14, true);
    addText(`Szacowana srednia retencja: ${rp.estimated_avg_retention}%`, 10);
    if (rp.drop_points?.length) {
      addText('Punkty odplywu:', 10, true);
      rp.drop_points.forEach(d => addText(`  ${d.timecode} [${d.severity}]: ${d.reason}`, 9));
    }
    if (rp.peak_moments?.length) {
      addText('Momenty szczytowe:', 10, true);
      rp.peak_moments.forEach(p => addText(`  ${p.timecode}: ${p.reason}`, 9));
    }
  }

  if (analysis.structure_notes) {
    y += 4;
    addText('Uwagi strukturalne', 14, true);
    addText(analysis.structure_notes, 10);
  }

  doc.save(`reelcutter-${filename.replace(/\.[^/.]+$/, '')}.pdf`);
}
