import { Router, Request, Response } from 'express';
import { getSession } from '../services/session.store';

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
    if (reel.hashtags?.length) {
      md += `- **Hashtagi:** ${reel.hashtags.join(' ')}\n`;
    }
    md += `\n`;
  }

  if (analysis.hooks?.length) {
    md += `## Hooki\n\n`;
    analysis.hooks.forEach((hook: string, i: number) => {
      md += `${i + 1}. ${hook}\n`;
    });
    md += `\n`;
  }

  if (analysis.structure_notes) {
    md += `## Uwagi strukturalne\n\n${analysis.structure_notes}\n`;
  }

  return md;
}

export default router;
