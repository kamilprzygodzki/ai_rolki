import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.middleware';
import { setSession, updateSession } from '../services/session.store';
import { extractAudio } from '../services/ffmpeg.service';
import logger from '../utils/logger';

const router = Router();

router.post('/', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nie przesłano pliku wideo' });
      return;
    }

    const sessionId = uuidv4();
    const { originalname, path: filepath } = req.file;

    setSession(sessionId, {
      id: sessionId,
      status: 'uploading',
      progress: 100,
      filename: originalname,
      filepath,
      createdAt: new Date(),
    });

    logger.info(`Upload complete: ${originalname} -> session ${sessionId}`);

    res.json({ id: sessionId, filename: originalname });

    // Process audio in background
    updateSession(sessionId, { status: 'processing_audio', progress: 0 });

    try {
      const audioPath = await extractAudio(filepath, (percent) => {
        updateSession(sessionId, { progress: percent });
      });

      updateSession(sessionId, {
        status: 'processing_audio',
        progress: 100,
        audioPath,
      });

      logger.info(`Audio ready for session ${sessionId}: ${audioPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd przetwarzania audio';
      logger.error(`FFmpeg error for session ${sessionId}:`, err);
      updateSession(sessionId, { status: 'error', error: message });
    }
  } catch (err) {
    logger.error('Upload error:', err);
    res.status(500).json({ error: 'Błąd uploadu pliku' });
  }
});

export default router;
