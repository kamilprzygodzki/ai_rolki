import OpenAI from 'openai';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { TranscriptResult, TranscriptSegment } from '../types';
import { needsChunking, splitAudio, cleanupChunks, AudioChunk } from './chunking.service';
import logger from '../utils/logger';

const execFileAsync = promisify(execFile);

interface WhisperProvider {
  type: 'api';
  client: OpenAI;
  model: string;
  name: string;
}

interface LocalWhisperProvider {
  type: 'local';
  name: string;
  model: string;
}

type Provider = WhisperProvider | LocalWhisperProvider;

function getProviders(): Provider[] {
  const providers: Provider[] = [];

  // Primary provider (Groq)
  if (process.env.WHISPER_API_KEY) {
    providers.push({
      type: 'api',
      client: new OpenAI({
        apiKey: process.env.WHISPER_API_KEY,
        baseURL: process.env.WHISPER_BASE_URL || 'https://api.openai.com/v1',
      }),
      model: process.env.WHISPER_MODEL || 'whisper-1',
      name: process.env.WHISPER_BASE_URL?.includes('groq') ? 'Groq' : 'Primary',
    });
  }

  // Fallback API provider (OpenAI)
  if (process.env.WHISPER_FALLBACK_API_KEY) {
    providers.push({
      type: 'api',
      client: new OpenAI({
        apiKey: process.env.WHISPER_FALLBACK_API_KEY,
        baseURL: process.env.WHISPER_FALLBACK_BASE_URL || 'https://api.openai.com/v1',
      }),
      model: process.env.WHISPER_FALLBACK_MODEL || 'whisper-1',
      name: 'Fallback (OpenAI)',
    });
  }

  // Local MLX Whisper (last resort, always available on Apple Silicon)
  if (process.env.WHISPER_LOCAL !== 'false') {
    providers.push({
      type: 'local',
      name: 'Local (MLX)',
      model: process.env.WHISPER_LOCAL_MODEL || 'mlx-community/whisper-large-v3-turbo',
    });
  }

  return providers;
}

export interface TranscribeResult {
  transcript: TranscriptResult;
  provider: string;
}

export async function transcribeAudio(
  audioPath: string,
  onProgress?: (percent: number, provider?: string) => void
): Promise<TranscribeResult> {
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error('No Whisper provider configured');
  }

  const chunked = await needsChunking(audioPath);

  if (!chunked) {
    onProgress?.(10);
    const { result, providerName } = await transcribeFileWithFallback(providers, audioPath);
    onProgress?.(100, providerName);
    return { transcript: result, provider: providerName };
  }

  logger.info('Audio needs chunking for Whisper');
  const chunks = await splitAudio(audioPath);

  try {
    const results: TranscriptResult[] = [];
    let lastProvider = '';
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      logger.info(`Transcribing chunk ${i + 1}/${chunks.length}`);
      const { result, providerName } = await transcribeFileWithFallback(providers, chunk.path);

      // Adjust timestamps by chunk offset
      result.segments = result.segments.map((seg) => ({
        ...seg,
        start: seg.start + chunk.startOffset,
        end: seg.end + chunk.startOffset,
      }));

      results.push(result);
      lastProvider = providerName;
      onProgress?.(Math.round(((i + 1) / chunks.length) * 100), providerName);
    }

    return { transcript: mergeTranscripts(results), provider: lastProvider };
  } finally {
    cleanupChunks(chunks);
  }
}

async function transcribeFileWithFallback(
  providers: Provider[],
  filePath: string
): Promise<{ result: TranscriptResult; providerName: string }> {
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = provider.type === 'local'
        ? await transcribeFileLocal(provider, filePath)
        : await transcribeFileAPI(provider, filePath);
      return { result, providerName: provider.name };
    } catch (err: any) {
      lastError = err;
      const remaining = providers.length - providers.indexOf(provider) - 1;
      logger.warn(
        `${provider.name} failed: ${err.message}${remaining > 0 ? `, trying next provider (${remaining} left)...` : ''}`
      );
    }
  }

  throw lastError || new Error('All Whisper providers failed');
}

async function transcribeFileAPI(
  provider: WhisperProvider,
  filePath: string
): Promise<TranscriptResult> {
  const file = fs.createReadStream(filePath);

  const response = await provider.client.audio.transcriptions.create({
    model: provider.model,
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

async function transcribeFileLocal(
  provider: LocalWhisperProvider,
  filePath: string
): Promise<TranscriptResult> {
  logger.info(`Local transcription: ${provider.model}`);

  const script = `
import mlx_whisper, json, sys
result = mlx_whisper.transcribe(
    sys.argv[1],
    path_or_hf_repo=sys.argv[2],
    language='pl'
)
print(json.dumps({
    'text': result.get('text', ''),
    'language': result.get('language', 'pl'),
    'duration': result.get('segments', [{}])[-1].get('end', 0) if result.get('segments') else 0,
    'segments': [{'start': s['start'], 'end': s['end'], 'text': s['text'].strip()} for s in result.get('segments', [])]
}, ensure_ascii=False))
`;

  const { stdout } = await execFileAsync(
    'python3',
    ['-c', script, filePath, provider.model],
    { maxBuffer: 50 * 1024 * 1024, timeout: 600_000 }
  );

  const result = JSON.parse(stdout.trim());

  return {
    text: result.text,
    segments: result.segments || [],
    language: result.language || 'pl',
    duration: result.duration || 0,
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
