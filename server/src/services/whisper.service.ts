import OpenAI from 'openai';
import fs from 'fs';
import { TranscriptResult, TranscriptSegment } from '../types';
import { needsChunking, splitAudio, cleanupChunks, AudioChunk } from './chunking.service';
import logger from '../utils/logger';

function getWhisperClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.WHISPER_API_KEY,
    baseURL: process.env.WHISPER_BASE_URL || 'https://api.openai.com/v1',
  });
}

export async function transcribeAudio(
  audioPath: string,
  onProgress?: (percent: number) => void
): Promise<TranscriptResult> {
  const client = getWhisperClient();
  const chunked = await needsChunking(audioPath);

  if (!chunked) {
    onProgress?.(10);
    const result = await transcribeFile(client, audioPath);
    onProgress?.(100);
    return result;
  }

  logger.info('Audio needs chunking for Whisper');
  const chunks = await splitAudio(audioPath);

  try {
    const results: TranscriptResult[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      logger.info(`Transcribing chunk ${i + 1}/${chunks.length}`);
      const result = await transcribeFile(client, chunk.path);

      // Adjust timestamps by chunk offset
      result.segments = result.segments.map((seg) => ({
        ...seg,
        start: seg.start + chunk.startOffset,
        end: seg.end + chunk.startOffset,
      }));

      results.push(result);
      onProgress?.(Math.round(((i + 1) / chunks.length) * 100));
    }

    return mergeTranscripts(results);
  } finally {
    cleanupChunks(chunks);
  }
}

async function transcribeFile(
  client: OpenAI,
  filePath: string
): Promise<TranscriptResult> {
  const file = fs.createReadStream(filePath);

  const response = await client.audio.transcriptions.create({
    model: process.env.WHISPER_MODEL || 'whisper-1',
    file,
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language: 'pl',
  });

  const segments: TranscriptSegment[] = (response as any).segments?.map(
    (seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })
  ) || [];

  return {
    text: response.text,
    segments,
    language: (response as any).language || 'pl',
    duration: (response as any).duration || 0,
  };
}

function mergeTranscripts(results: TranscriptResult[]): TranscriptResult {
  return {
    text: results.map((r) => r.text).join(' '),
    segments: results.flatMap((r) => r.segments),
    language: results[0]?.language || 'pl',
    duration: results.reduce((max, r) => {
      const lastSeg = r.segments[r.segments.length - 1];
      return lastSeg ? Math.max(max, lastSeg.end) : max;
    }, 0),
  };
}
