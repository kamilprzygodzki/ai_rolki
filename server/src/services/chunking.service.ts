import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const MAX_CHUNK_SIZE = 24 * 1024 * 1024; // 24MB to be safe
const CHUNK_DURATION = 600; // 10 minutes per chunk

export interface AudioChunk {
  path: string;
  startOffset: number;
  index: number;
}

export async function needsChunking(audioPath: string): Promise<boolean> {
  const stats = fs.statSync(audioPath);
  return stats.size > MAX_CHUNK_SIZE;
}

export async function splitAudio(audioPath: string): Promise<AudioChunk[]> {
  const dir = path.dirname(audioPath);
  const ext = path.extname(audioPath);
  const baseName = path.basename(audioPath, ext);
  const chunkPattern = path.join(dir, `${baseName}_chunk_%03d${ext}`);

  return new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .outputOptions([
        '-f', 'segment',
        '-segment_time', String(CHUNK_DURATION),
        '-reset_timestamps', '1',
      ])
      .on('end', () => {
        const chunks: AudioChunk[] = [];
        let i = 0;
        while (true) {
          const chunkPath = path.join(dir, `${baseName}_chunk_${String(i).padStart(3, '0')}${ext}`);
          if (!fs.existsSync(chunkPath)) break;
          chunks.push({
            path: chunkPath,
            startOffset: i * CHUNK_DURATION,
            index: i,
          });
          i++;
        }
        logger.info(`Split audio into ${chunks.length} chunks`);
        resolve(chunks);
      })
      .on('error', (err) => {
        logger.error('Chunking error:', err);
        reject(new Error(`Błąd podziału audio: ${err.message}`));
      })
      .save(chunkPattern);
  });
}

export function cleanupChunks(chunks: AudioChunk[]): void {
  for (const chunk of chunks) {
    try {
      if (fs.existsSync(chunk.path)) {
        fs.unlinkSync(chunk.path);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
