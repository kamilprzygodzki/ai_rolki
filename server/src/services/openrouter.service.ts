import OpenAI from 'openai';
import { AnalysisResult, HookSuggestion, TranscriptResult } from '../types';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Pricing: $/1M tokens from OpenRouter. estimatedCost = typical analysis (~6k in + ~4k out tokens).
export const AVAILABLE_MODELS = [
  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', estimatedCost: 0.06 },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', estimatedCost: 0.08 },
  { id: 'anthropic/claude-opus-4.6', name: 'Claude Opus 4.6', estimatedCost: 0.13 },
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', estimatedCost: 0.003 },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', estimatedCost: 0.05 },
  { id: 'qwen/qwen3.5-plus-02-15', name: 'Qwen 3.5 Plus', estimatedCost: 0.01 },
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', estimatedCost: 0.003 },
  { id: 'mistralai/mistral-large-2512', name: 'Mistral Large 3', estimatedCost: 0.01 },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', estimatedCost: 0.003 },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', estimatedCost: 0.02 },
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
  // OpenAI models support response_format to force valid JSON output
  const useJsonFormat = model.startsWith('openai/');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          ...(useJsonFormat ? [{ role: 'system' as const, content: 'Respond with valid JSON only. Analyze the video transcript as instructed.' }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 16384,
        ...(useJsonFormat ? { response_format: { type: 'json_object' } } : {}),
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
  // Detect model refusals before trying to parse JSON
  const trimmed = raw.trim().toLowerCase();
  if (
    trimmed.startsWith("i'm sorry") ||
    trimmed.startsWith('i cannot') ||
    trimmed.startsWith("i can't") ||
    trimmed.startsWith('sorry,') ||
    (trimmed.length < 200 && !trimmed.includes('{'))
  ) {
    throw new Error(`Model odmówił analizy: "${raw.trim().substring(0, 150)}"`);
  }

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

function normalizeAnalysisResult(result: any): AnalysisResult {
  // Ensure all top-level arrays exist
  result.summary = result.summary || '';
  result.structure_notes = result.structure_notes || '';
  result.reels = Array.isArray(result.reels) ? result.reels : [];
  result.titles = Array.isArray(result.titles) ? result.titles : [];
  result.thumbnails = Array.isArray(result.thumbnails) ? result.thumbnails : [];

  // Normalize hooks: string[] → HookSuggestion[]
  if (Array.isArray(result.hooks)) {
    result.hooks = result.hooks.map((h: unknown): HookSuggestion =>
      typeof h === 'string' ? { text: h, type: 'open_loop' } : h as HookSuggestion
    );
  } else {
    result.hooks = [];
  }

  // Normalize reel fields
  for (const reel of result.reels) {
    reel.editing_tips = Array.isArray(reel.editing_tips) ? reel.editing_tips : [];
    reel.hashtags = Array.isArray(reel.hashtags) ? reel.hashtags : [];
    reel.ctr_potential = typeof reel.ctr_potential === 'number' ? reel.ctr_potential : 5;
    reel.retention_strategy = reel.retention_strategy || '';
  }

  // Normalize thumbnail fields
  for (const thumb of result.thumbnails) {
    thumb.color_palette = thumb.color_palette || '';
    thumb.face_expression = thumb.face_expression || '';
    thumb.composition = thumb.composition || '';
  }

  return result as AnalysisResult;
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
  const parsed = parseAnalysisJSON(raw);
  return normalizeAnalysisResult(parsed);
}
