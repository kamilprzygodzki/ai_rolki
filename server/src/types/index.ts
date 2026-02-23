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

export interface TitleSuggestion {
  title: string;
  style: string;
  why: string;
}

export interface ThumbnailSuggestion {
  concept: string;
  text_overlay: string;
  style: string;
  reference: string;
}

export interface AnalysisResult {
  summary: string;
  reels: ReelSuggestion[];
  hooks: string[];
  structure_notes: string;
  titles: TitleSuggestion[];
  thumbnails: ThumbnailSuggestion[];
}

export type SessionStatus =
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
  createdAt: Date;
}
