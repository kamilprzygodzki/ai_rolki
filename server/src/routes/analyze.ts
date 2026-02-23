import { Router, Request, Response } from 'express';
import { getSession, updateSession } from '../services/session.store';
import { analyzeTranscript, AVAILABLE_MODELS } from '../services/openrouter.service';
import logger from '../utils/logger';

const router = Router();

router.get('/models', (_req: Request, res: Response) => {
  res.json({ models: AVAILABLE_MODELS });
});

router.post('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { model } = req.body;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Sesja nie znaleziona' });
    return;
  }

  if (!session.transcript) {
    res.status(400).json({ error: 'Transkrypcja nie jest jeszcze gotowa' });
    return;
  }

  const selectedModel = model || AVAILABLE_MODELS[0].id;
  updateSession(id, { status: 'analyzing', progress: 0, model: selectedModel });

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  try {
    const analysis = await analyzeTranscript(
      session.transcript,
      selectedModel,
      (message) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', message })}\n\n`);
      }
    );

    updateSession(id, { status: 'done', progress: 100, analysis });

    res.write(`data: ${JSON.stringify({ type: 'done', analysis })}\n\n`);
    res.end();

    logger.info(`Analysis complete for session ${id}: ${analysis.reels.length} reels found`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd analizy AI';
    logger.error(`Analysis error for session ${id}:`, err);
    updateSession(id, { status: 'error', error: message });
    res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
    res.end();
  }
});

export default router;
