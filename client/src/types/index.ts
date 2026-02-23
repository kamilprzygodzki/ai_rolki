export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  duration: number;
}

export interface ReelSuggestion {
  title: string;
  hook: string;
  start: string;
  end: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  why: string;
  script_outline: string;
  editing_tips: string[];
  hashtags: string[];
}

export interface AnalysisResult {
  summary: string;
  reels: ReelSuggestion[];
  hooks: string[];
  structure_notes: string;
}

export type SessionStatus =
  | 'idle'
  | 'uploading'
  | 'processing_audio'
  | 'transcribing'
  | 'analyzing'
  | 'done'
  | 'error';

export interface SessionState {
  id: string;
  status: SessionStatus;
  progress: number;
  filename: string;
  filepath: string;
  audioPath?: string;
  transcript?: TranscriptResult;
  analysis?: AnalysisResult;
  error?: string;
  model?: string;
}

export interface ModelOption {
  id: string;
  name: string;
}
