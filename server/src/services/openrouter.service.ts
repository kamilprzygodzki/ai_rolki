import OpenAI from 'openai';
import { AnalysisResult, TranscriptResult } from '../types';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt';
import logger from '../utils/logger';

export const AVAILABLE_MODELS = [
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-haiku-3.5', name: 'Claude Haiku 3.5' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
];

function getOpenRouterClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'ReelCutter',
    },
  });
}

function formatTranscriptWithTimecodes(transcript: TranscriptResult): string {
  return transcript.segments
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      const ts = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      return `[${ts}] ${seg.text}`;
    })
    .join('\n');
}

function chunkTranscript(transcript: TranscriptResult, maxDurationMin: number = 30): string[] {
  if (transcript.duration <= maxDurationMin * 60) {
    return [formatTranscriptWithTimecodes(transcript)];
  }

  const chunks: string[] = [];
  const chunkSize = maxDurationMin * 60;
  let currentChunk: string[] = [];
  let chunkStart = 0;

  for (const seg of transcript.segments) {
    if (seg.start - chunkStart >= chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      chunkStart = seg.start;
    }
    const mins = Math.floor(seg.start / 60);
    const secs = Math.floor(seg.start % 60);
    const ts = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    currentChunk.push(`[${ts}] ${seg.text}`);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

async function callWithRetry(
  client: OpenAI,
  model: string,
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(`OpenRouter attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);

      if (attempt === maxRetries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

function parseAnalysisJSON(raw: string): AnalysisResult {
  // Try direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // Try extracting from code block
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // fall through
      }
    }

    // Try finding JSON object
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Nie udało się sparsować odpowiedzi AI jako JSON');
  }
}

export async function analyzeTranscript(
  transcript: TranscriptResult,
  model: string,
  onProgress?: (message: string) => void
): Promise<AnalysisResult> {
  const client = getOpenRouterClient();
  const chunks = chunkTranscript(transcript);

  if (chunks.length === 1) {
    onProgress?.('Analizuję transkrypcję...');
    const prompt = buildAnalysisPrompt(chunks[0], transcript.duration);
    const raw = await callWithRetry(client, model, prompt);
    return parseAnalysisJSON(raw);
  }

  // Multi-chunk: analyze each, then merge
  const partialResults: AnalysisResult[] = [];

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Analizuję część ${i + 1}/${chunks.length}...`);
    const prompt = buildAnalysisPrompt(chunks[i], transcript.duration);
    const raw = await callWithRetry(client, model, prompt);
    partialResults.push(parseAnalysisJSON(raw));
  }

  // Merge results
  return {
    summary: partialResults.map((r) => r.summary).join(' '),
    reels: partialResults.flatMap((r) => r.reels),
    hooks: partialResults.flatMap((r) => r.hooks).slice(0, 10),
    structure_notes: partialResults.map((r) => r.structure_notes).join('\n\n'),
  };
}
