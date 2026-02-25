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

// Feature 1: Editing Guide
export interface EditingCut {
  timecode: string;
  type: 'jump_cut' | 'hard_cut' | 'j_cut' | 'l_cut';
  description: string;
}

export interface BrollMoment {
  start: string;
  end: string;
  suggestion: string;
}

export interface ZoomMoment {
  timecode: string;
  type: 'zoom_in' | 'zoom_out' | 'slow_zoom';
  reason: string;
}

export interface TextOverlay {
  timecode: string;
  text: string;
  style: 'lower_third' | 'center' | 'caption';
}

export interface EditingGuide {
  pace: 'fast' | 'medium' | 'slow';
  cuts: EditingCut[];
  broll_moments: BrollMoment[];
  zoom_moments: ZoomMoment[];
  text_overlays: TextOverlay[];
  music_sync: string;
}

// Feature 2: Engagement Map
export interface EngagementSegment {
  start: string;
  end: string;
  level: 'peak' | 'high' | 'medium' | 'low';
  emotion: string;
  note: string;
}

// Feature 3: Hook Blueprint
export interface HookBlueprint {
  text: string;
  type: string;
  visual_description: string;
  audio_description: string;
  first_3_seconds: string;
}

// Feature 5: Retention Prediction
export interface RetentionDropPoint {
  timecode: string;
  reason: string;
  severity: 'critical' | 'moderate' | 'minor';
}

export interface RetentionPeakMoment {
  timecode: string;
  reason: string;
}

export interface RetentionPrediction {
  estimated_avg_retention: number;
  drop_points: RetentionDropPoint[];
  peak_moments: RetentionPeakMoment[];
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
  ctr_potential: number;
  retention_strategy: string;
  // Feature 1
  editing_guide?: EditingGuide;
  // Feature 3
  hook_variants?: HookBlueprint[];
}

// Feature 4: Platform-aware titles
export interface TitleSuggestion {
  title: string;
  style: string;
  why: string;
  platform?: 'youtube' | 'tiktok' | 'instagram';
  paired_thumbnail_index?: number;
  paired_hook_type?: string;
}

export interface ThumbnailSuggestion {
  concept: string;
  text_overlay: string;
  style: string;
  reference: string;
  color_palette: string;
  face_expression: string;
  composition: string;
}

export interface HookSuggestion {
  text: string;
  type: string;
}

export interface AnalysisResult {
  summary: string;
  reels: ReelSuggestion[];
  hooks: HookSuggestion[];
  structure_notes: string;
  titles: TitleSuggestion[];
  thumbnails: ThumbnailSuggestion[];
  // Feature 2
  engagement_map?: EngagementSegment[];
  // Feature 5
  retention_prediction?: RetentionPrediction;
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
  whisperProvider?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  estimatedCost?: number;
}
