import { AnalysisResult } from '../types';
import { mmssToSeconds } from '../utils/timecode';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert seconds to FCPXML rational time format (e.g. "150/1s")
 */
function toRational(seconds: number): string {
  // Use integer seconds for simplicity
  return `${Math.round(seconds)}/1s`;
}

/**
 * Generate FCPXML (v1.11) from analysis results.
 * Creates a project with one timeline, reels as clips, and markers for editing guide/retention/engagement.
 */
export function generateFCPXML(analysis: AnalysisResult, filename: string, totalDuration: number): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<!DOCTYPE fcpxml>');
  lines.push('<fcpxml version="1.11">');
  lines.push('  <resources>');
  lines.push(`    <format id="r1" name="FFVideoFormat1080p25" frameDuration="100/2500s" width="1920" height="1080"/>`);
  lines.push(`    <asset id="a1" name="${escapeXml(filename)}" src="file://./${escapeXml(filename)}" start="0/1s" duration="${toRational(totalDuration)}" hasVideo="1" hasAudio="1" format="r1"/>`);
  lines.push('  </resources>');
  lines.push('  <library>');
  lines.push('    <event name="ReelCutter Export">');
  lines.push(`      <project name="ReelCutter - ${escapeXml(filename)}">`);
  lines.push(`        <sequence format="r1" duration="${toRational(totalDuration)}">`);
  lines.push('          <spine>');

  // Add each reel as a clip with markers
  analysis.reels.forEach((reel, i) => {
    const startSec = mmssToSeconds(reel.start);
    const endSec = mmssToSeconds(reel.end);
    const duration = endSec - startSec;

    lines.push(`            <clip name="${escapeXml(reel.title)}" offset="${toRational(startSec)}" duration="${toRational(duration)}" start="${toRational(startSec)}">`);
    lines.push(`              <video ref="a1" offset="0/1s" duration="${toRational(totalDuration)}"/>`);

    // Marker: priority + hook
    lines.push(`              <marker start="${toRational(startSec)}" duration="1/1s" value="${escapeXml(`[${reel.priority.toUpperCase()}] ${reel.hook}`)}"/>`);

    // Editing guide markers
    if (reel.editing_guide) {
      reel.editing_guide.cuts.forEach(cut => {
        const cutSec = mmssToSeconds(cut.timecode);
        if (cutSec >= startSec && cutSec <= endSec) {
          lines.push(`              <marker start="${toRational(cutSec)}" duration="1/1s" value="${escapeXml(`CUT [${cut.type}]: ${cut.description}`)}"/>`);
        }
      });

      reel.editing_guide.zoom_moments.forEach(zm => {
        const zmSec = mmssToSeconds(zm.timecode);
        if (zmSec >= startSec && zmSec <= endSec) {
          lines.push(`              <marker start="${toRational(zmSec)}" duration="1/1s" value="${escapeXml(`ZOOM [${zm.type}]: ${zm.reason}`)}"/>`);
        }
      });

      reel.editing_guide.text_overlays.forEach(to => {
        const toSec = mmssToSeconds(to.timecode);
        if (toSec >= startSec && toSec <= endSec) {
          lines.push(`              <marker start="${toRational(toSec)}" duration="1/1s" value="${escapeXml(`TEXT [${to.style}]: ${to.text}`)}"/>`);
        }
      });
    }

    lines.push('            </clip>');
  });

  lines.push('          </spine>');

  // Add engagement map as chapter markers
  if (analysis.engagement_map?.length) {
    lines.push('          <!-- Engagement Map Markers -->');
    analysis.engagement_map.forEach(seg => {
      const segStart = mmssToSeconds(seg.start);
      const segEnd = mmssToSeconds(seg.end);
      lines.push(`          <chapter-marker start="${toRational(segStart)}" duration="${toRational(segEnd - segStart)}" value="${escapeXml(`[${seg.level.toUpperCase()}] ${seg.emotion}: ${seg.note}`)}"/>`);
    });
  }

  // Add retention prediction markers
  if (analysis.retention_prediction) {
    lines.push('          <!-- Retention Markers -->');
    analysis.retention_prediction.drop_points.forEach(dp => {
      const dpSec = mmssToSeconds(dp.timecode);
      lines.push(`          <marker start="${toRational(dpSec)}" duration="1/1s" value="${escapeXml(`DROP [${dp.severity}]: ${dp.reason}`)}"/>`);
    });
    analysis.retention_prediction.peak_moments.forEach(pm => {
      const pmSec = mmssToSeconds(pm.timecode);
      lines.push(`          <marker start="${toRational(pmSec)}" duration="1/1s" value="${escapeXml(`PEAK: ${pm.reason}`)}"/>`);
    });
  }

  lines.push('        </sequence>');
  lines.push('      </project>');
  lines.push('    </event>');
  lines.push('  </library>');
  lines.push('</fcpxml>');

  return lines.join('\n');
}
