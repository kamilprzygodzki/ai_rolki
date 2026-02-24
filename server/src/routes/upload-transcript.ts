import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { setSession } from '../services/session.store';
import { TranscriptResult, TranscriptSegment } from '../types';
import logger from '../utils/logger';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const transcriptUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.json', '.srt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Nieobsługiwany format: ${ext}. Dozwolone: .txt, .json, .srt`));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

function parseSrt(content: string): { segments: TranscriptSegment[]; text: string; duration: number } {
  const blocks = content.trim().split(/\n\s*\n/);
  const segments: TranscriptSegment[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    const text = lines.slice(2).join(' ').trim();
    if (text) {
      segments.push({ start, end, text });
    }
  }

  const text = segments.map((s) => s.text).join(' ');
  const duration = segments.length > 0 ? segments[segments.length - 1].end : 0;

  return { segments, text, duration };
}

function parseTranscriptFile(filePath: string, ext: string): TranscriptResult {
  const content = fs.readFileSync(filePath, 'utf-8');

  switch (ext) {
    case '.json': {
      const parsed = JSON.parse(content);
      // Validate expected structure
      if (!parsed.text || !Array.isArray(parsed.segments)) {
        throw new Error('Nieprawidłowa struktura JSON. Wymagane pola: text, segments');
      }
      return {
        text: parsed.text,
        segments: parsed.segments,
        language: parsed.language || 'pl',
        duration: parsed.duration || 0,
      };
    }

    case '.srt': {
      const { segments, text, duration } = parseSrt(content);
      return { text, segments, language: 'pl', duration };
    }

    case '.txt':
    default: {
      const text = content.trim();
      return {
        text,
        segments: [{ start: 0, end: 0, text }],
        language: 'pl',
        duration: 0,
      };
    }
  }
}

router.post('/', transcriptUpload.single('transcript'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nie przesłano pliku transkrypcji' });
      return;
    }

    const { originalname, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase();

    let transcript: TranscriptResult;
    try {
      transcript = parseTranscriptFile(filePath, ext);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd parsowania transkrypcji';
      res.status(400).json({ error: message });
      return;
    }

    const sessionId = uuidv4();

    setSession(sessionId, {
      id: sessionId,
      status: 'done',
      progress: 100,
      filename: originalname,
      filepath: '',
      transcript,
      createdAt: new Date(),
    });

    logger.info(`Transcript upload: ${originalname} -> session ${sessionId} (${transcript.segments.length} segments)`);

    res.json({ id: sessionId, filename: originalname });
  } catch (err) {
    logger.error('Transcript upload error:', err);
    res.status(500).json({ error: 'Błąd uploadu transkrypcji' });
  }
});

export default router;
