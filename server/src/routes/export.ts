import { Router, Request, Response } from 'express';
import { getSession } from '../services/session.store';
import { generateEDL } from '../services/edl-export.service';
import { generateFCPXML } from '../services/fcpxml-export.service';

const router = Router();

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { format } = req.query;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Sesja nie znaleziona' });
    return;
  }

  if (!session.analysis) {
    res.status(400).json({ error: 'Analiza nie jest jeszcze gotowa' });
    return;
  }

  switch (format) {
    case 'json':
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="reelcutter-${id}.json"`);
      res.json({
        session: {
          id: session.id,
          filename: session.filename,
          model: session.model,
          createdAt: session.createdAt,
        },
        transcript: session.transcript,
        analysis: session.analysis,
      });
      break;

    case 'edl':
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="reelcutter-${id}.edl"`);
      res.send(generateEDL(session.analysis, session.filename));
      break;

    case 'fcpxml':
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="reelcutter-${id}.fcpxml"`);
      res.send(generateFCPXML(session.analysis, session.filename, session.transcript?.duration || 0));
      break;

    case 'markdown':
    default:
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="reelcutter-${id}.md"`);
      res.send(buildMarkdown(session));
      break;
  }
});

function buildMarkdown(session: any): string {
  const { analysis, filename, model } = session;
  let md = `# ReelCutter — Analiza\n\n`;
  md += `**Plik:** ${filename}\n`;
  md += `**Model:** ${model || 'default'}\n`;
  md += `**Data:** ${new Date().toLocaleDateString('pl-PL')}\n\n`;
  md += `## Podsumowanie\n\n${analysis.summary}\n\n`;

  if (analysis.titles?.length) {
    md += `## Propozycje tytułów\n\n`;
    analysis.titles.forEach((t: any, i: number) => {
      md += `${i + 1}. **${t.title}**\n`;
      md += `   - Styl: ${t.style}\n`;
      md += `   - Dlaczego: ${t.why}\n`;
      if (t.platform) md += `   - Platforma: ${t.platform}\n`;
      if (t.paired_hook_type) md += `   - Hook: ${t.paired_hook_type}\n`;
    });
    md += `\n`;
  }

  if (analysis.thumbnails?.length) {
    md += `## Koncepcje miniatur\n\n`;
    analysis.thumbnails.forEach((th: any, i: number) => {
      md += `### Miniatura ${i + 1}\n\n`;
      md += `- **Koncept:** ${th.concept}\n`;
      md += `- **Tekst overlay:** ${th.text_overlay}\n`;
      md += `- **Styl:** ${th.style}\n`;
      md += `- **Inspiracja:** ${th.reference}\n`;
      md += `\n`;
    });
  }

  md += `## Propozycje rolek\n\n`;
  for (const reel of analysis.reels) {
    md += `### ${reel.title}\n\n`;
    md += `- **Priorytet:** ${reel.priority}\n`;
    md += `- **Czas:** ${reel.start} — ${reel.end} (${reel.duration})\n`;
    md += `- **Hook:** ${reel.hook}\n`;
    md += `- **Dlaczego:** ${reel.why}\n`;
    md += `- **Zarys:** ${reel.script_outline}\n`;
    if (reel.editing_tips?.length) {
      md += `- **Tipy montażowe:**\n`;
      reel.editing_tips.forEach((tip: string) => {
        md += `  - ${tip}\n`;
      });
    }

    // Feature 1: Editing Guide
    if (reel.editing_guide) {
      const eg = reel.editing_guide;
      md += `- **Instrukcja montażu:**\n`;
      md += `  - Tempo: ${eg.pace}\n`;
      if (eg.cuts?.length) {
        md += `  - Cięcia:\n`;
        eg.cuts.forEach((c: any) => md += `    - ${c.timecode} [${c.type}] ${c.description}\n`);
      }
      if (eg.broll_moments?.length) {
        md += `  - B-Roll:\n`;
        eg.broll_moments.forEach((b: any) => md += `    - ${b.start}–${b.end}: ${b.suggestion}\n`);
      }
      if (eg.zoom_moments?.length) {
        md += `  - Zoom:\n`;
        eg.zoom_moments.forEach((z: any) => md += `    - ${z.timecode} [${z.type}] ${z.reason}\n`);
      }
      if (eg.text_overlays?.length) {
        md += `  - Tekst overlay:\n`;
        eg.text_overlays.forEach((t: any) => md += `    - ${t.timecode} [${t.style}] "${t.text}"\n`);
      }
      if (eg.music_sync) {
        md += `  - Muzyka: ${eg.music_sync}\n`;
      }
    }

    // Feature 3: Hook Variants
    if (reel.hook_variants?.length) {
      md += `- **Warianty hooka:**\n`;
      reel.hook_variants.forEach((hv: any, i: number) => {
        md += `  ${i + 1}. "${hv.text}" [${hv.type}]\n`;
        if (hv.visual_description) md += `     - Wizual: ${hv.visual_description}\n`;
        if (hv.audio_description) md += `     - Audio: ${hv.audio_description}\n`;
        if (hv.first_3_seconds) md += `     - Pierwsze 3s: ${hv.first_3_seconds}\n`;
      });
    }

    if (reel.hashtags?.length) {
      md += `- **Hashtagi:** ${reel.hashtags.join(' ')}\n`;
    }
    md += `\n`;
  }

  if (analysis.hooks?.length) {
    md += `## Hooki\n\n`;
    analysis.hooks.forEach((hook: any, i: number) => {
      const text = typeof hook === 'string' ? hook : `${hook.text} [${hook.type}]`;
      md += `${i + 1}. ${text}\n`;
    });
    md += `\n`;
  }

  // Feature 2: Engagement Map
  if (analysis.engagement_map?.length) {
    md += `## Mapa zaangażowania\n\n`;
    md += `| Czas | Poziom | Emocja | Opis |\n`;
    md += `|------|--------|--------|------|\n`;
    analysis.engagement_map.forEach((seg: any) => {
      md += `| ${seg.start}–${seg.end} | ${seg.level} | ${seg.emotion} | ${seg.note} |\n`;
    });
    md += `\n`;
  }

  // Feature 5: Retention Prediction
  if (analysis.retention_prediction) {
    const rp = analysis.retention_prediction;
    md += `## Predykcja retencji\n\n`;
    md += `**Szacowana średnia retencja:** ${rp.estimated_avg_retention}%\n\n`;
    if (rp.drop_points?.length) {
      md += `### Punkty odpływu\n\n`;
      rp.drop_points.forEach((d: any) => {
        md += `- **${d.timecode}** [${d.severity}] — ${d.reason}\n`;
      });
      md += `\n`;
    }
    if (rp.peak_moments?.length) {
      md += `### Momenty szczytowe\n\n`;
      rp.peak_moments.forEach((p: any) => {
        md += `- **${p.timecode}** — ${p.reason}\n`;
      });
      md += `\n`;
    }
  }

  if (analysis.structure_notes) {
    md += `## Uwagi strukturalne\n\n${analysis.structure_notes}\n`;
  }

  return md;
}

export default router;
