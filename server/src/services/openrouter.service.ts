import OpenAI from 'openai';
import { AnalysisResult, TranscriptResult } from '../types';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

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
        max_tokens: 16384,
      });

      let content = response.choices[0]?.message?.content || '';
      const finishReason = response.choices[0]?.finish_reason;
      logger.info(`OpenRouter response: finish_reason=${finishReason}, length=${content.length}`);

      // Strip thinking tags that some models (Gemini) may include
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      // Debug: dump full response to file
      const debugPath = path.join(process.env.UPLOAD_DIR || './uploads', `_debug_response_${Date.now()}.txt`);
      fs.writeFileSync(debugPath, content);
      logger.info(`Full AI response saved to ${debugPath}`);

      return content;
    } catch (err: any) {
      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(`OpenRouter attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);

      if (attempt === maxRetries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

function extractJSON(raw: string): string {
  // 1. Try to extract from complete code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // 2. Try to extract from unclosed code block (truncated response)
  const unclosedBlock = raw.match(/```(?:json)?\s*([\s\S]*)/);
  if (unclosedBlock) {
    const content = unclosedBlock[1].trim();
    // Remove trailing ``` if partially present
    return content.replace(/`{0,2}$/, '').trim();
  }

  // 3. Raw text — try to find JSON start
  const jsonStart = raw.indexOf('{');
  if (jsonStart >= 0) return raw.substring(jsonStart);

  return raw;
}

function repairTruncatedJSON(text: string): string {
  let repaired = text.trimEnd();

  // Remove incomplete trailing key-value (e.g. `"key": "incomplete text`)
  // First, try to close any open string by removing the incomplete part
  // Track state through the JSON
  let inString = false;
  let escape = false;
  let lastCompletePos = 0;
  const stack: string[] = [];

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') {
      inString = !inString;
      if (!inString) lastCompletePos = i; // end of string
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      stack.push(ch);
      lastCompletePos = i;
    } else if (ch === '}' || ch === ']') {
      stack.pop();
      lastCompletePos = i;
    } else if (ch === ',' || ch === ':') {
      lastCompletePos = i;
    }
  }

  if (inString) {
    // We're inside an unclosed string — close it
    repaired += '"';
  }

  // Remove trailing comma
  repaired = repaired.replace(/,\s*$/, '');

  // Close remaining open brackets/braces in reverse order
  for (let i = stack.length - 1; i >= 0; i--) {
    repaired += stack[i] === '{' ? '}' : ']';
  }

  return repaired;
}

function parseAnalysisJSON(raw: string): AnalysisResult {
  // Extract JSON from code blocks or raw text
  const jsonText = extractJSON(raw);

  // 1. Try direct parse
  try {
    return JSON.parse(jsonText);
  } catch {
    // continue
  }

  // 2. Try finding complete JSON object
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // continue
    }
  }

  // 3. Try repairing truncated JSON
  const repaired = repairTruncatedJSON(jsonText);
  try {
    const result = JSON.parse(repaired);
    logger.warn('AI response was truncated — repaired JSON successfully');
    return result;
  } catch (e) {
    logger.error(`JSON repair failed. Repaired text (last 200 chars): ${repaired.substring(repaired.length - 200)}`);
  }

  throw new Error('Nie udało się sparsować odpowiedzi AI jako JSON');
}

export async function analyzeTranscript(
  transcript: TranscriptResult,
  model: string,
  onProgress?: (message: string) => void
): Promise<AnalysisResult> {
  const client = getOpenRouterClient();

  // Send full transcript as single request — avoids multi-chunk merge issues
  // and saves API credits. Most models handle 60+ min transcripts fine.
  const fullText = formatTranscriptWithTimecodes(transcript);
  onProgress?.('Analizuję transkrypcję...');

  const prompt = buildAnalysisPrompt(fullText, transcript.duration);
  const raw = await callWithRetry(client, model, prompt);
  logger.info(`Parsing response (${raw.length} chars)`);
  return parseAnalysisJSON(raw);
}
