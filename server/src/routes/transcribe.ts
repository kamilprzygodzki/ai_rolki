import { Router, Request, Response } from 'express';
import { getSession, updateSession } from '../services/session.store';
import { transcribeAudio } from '../services/whisper.service';
import logger from '../utils/logger';

const router = Router();

router.post('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Sesja nie znaleziona' });
    return;
  }

  if (!session.audioPath) {
    res.status(400).json({ error: 'Audio nie jest jeszcze gotowe' });
    return;
  }

  if (session.transcript) {
    res.json({ transcript: session.transcript });
    return;
  }

  updateSession(id, { status: 'transcribing', progress: 0 });
  res.json({ message: 'Transkrypcja rozpoczęta' });

  try {
    const transcript = await transcribeAudio(session.audioPath, (percent) => {
      updateSession(id, { progress: percent });
    });

    updateSession(id, {
      status: 'transcribing',
      progress: 100,
      transcript,
    });

    logger.info(`Transcription complete for session ${id}: ${transcript.segments.length} segments`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd transkrypcji';
    logger.error(`Transcription error for session ${id}:`, err);
    updateSession(id, { status: 'error', error: message });
  }
});

export default router;
