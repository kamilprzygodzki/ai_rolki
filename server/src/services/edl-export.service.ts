import { AnalysisResult } from '../types';
import { mmssToSmpte } from '../utils/timecode';

/**
 * Generate EDL (CMX 3600 format) from analysis results.
 * Each reel = one edit event. Comments include hooks and editing guide info.
 */
export function generateEDL(analysis: AnalysisResult, filename: string): string {
  const lines: string[] = [];

  lines.push(`TITLE: ReelCutter - ${filename}`);
  lines.push(`FCM: NON-DROP FRAME`);
  lines.push('');

  analysis.reels.forEach((reel, i) => {
    const eventNum = String(i + 1).padStart(3, '0');
    const srcIn = mmssToSmpte(reel.start);
    const srcOut = mmssToSmpte(reel.end);
    // Record in/out matches source for a simple assembly
    const recIn = srcIn;
    const recOut = srcOut;

    // Edit event line: EVENT# REEL TRACK TRANSITION SRC_IN SRC_OUT REC_IN REC_OUT
    lines.push(`${eventNum}  AX       V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}`);

    // Comments with metadata
    lines.push(`* FROM CLIP NAME: ${filename}`);
    lines.push(`* REEL: ${reel.title}`);
    lines.push(`* PRIORITY: ${reel.priority}`);
    lines.push(`* HOOK: ${reel.hook}`);

    if (reel.editing_guide) {
      lines.push(`* PACE: ${reel.editing_guide.pace}`);
      if (reel.editing_guide.music_sync) {
        lines.push(`* MUSIC: ${reel.editing_guide.music_sync}`);
      }
      reel.editing_guide.cuts.forEach(cut => {
        lines.push(`* CUT ${mmssToSmpte(cut.timecode)} ${cut.type}: ${cut.description}`);
      });
      reel.editing_guide.zoom_moments.forEach(zm => {
        lines.push(`* ZOOM ${mmssToSmpte(zm.timecode)} ${zm.type}: ${zm.reason}`);
      });
      reel.editing_guide.text_overlays.forEach(to => {
        lines.push(`* TEXT ${mmssToSmpte(to.timecode)} [${to.style}]: ${to.text}`);
      });
    }

    if (reel.hook_variants?.length) {
      reel.hook_variants.forEach((hv, j) => {
        lines.push(`* HOOK_VARIANT_${j + 1}: [${hv.type}] ${hv.text}`);
      });
    }

    lines.push('');
  });

  return lines.join('\n');
}
