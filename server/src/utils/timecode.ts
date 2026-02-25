/**
 * Convert MM:SS timecode to HH:MM:SS:FF format (assuming 25fps)
 */
export function mmssToSmpte(timecode: string, fps = 25): string {
  const parts = timecode.split(':').map(Number);
  let totalSeconds = 0;

  if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const frames = 0;

  return [hours, mins, secs, frames]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

/**
 * Convert MM:SS timecode to total seconds
 */
export function mmssToSeconds(timecode: string): number {
  const parts = timecode.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/**
 * Convert total seconds to SMPTE timecode
 */
export function secondsToSmpte(totalSeconds: number, fps = 25): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const frames = 0;

  return [hours, mins, secs, frames]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}
