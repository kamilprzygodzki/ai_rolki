import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const MAX_WHISPER_SIZE = 25 * 1024 * 1024; // 25MB
// WAV 16kHz mono 16-bit = 32000 bytes/sec ≈ 1.92MB/min
// 25MB / 1.92MB = ~13 min. Above that, WAV will exceed 25MB anyway.
// Use 12 min threshold to avoid creating huge intermediate WAV files.
const MP3_DIRECT_THRESHOLD_SECONDS = 12 * 60;

export function extractAudio(
  inputPath: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));

  return new Promise((resolve, reject) => {
    // First, probe duration to decide output format
    ffmpeg.ffprobe(inputPath, (probeErr, metadata) => {
      const duration = probeErr ? 0 : (metadata.format.duration || 0);
      const useDirectMp3 = duration > MP3_DIRECT_THRESHOLD_SECONDS;

      if (useDirectMp3) {
        logger.info(`Duration ${(duration / 60).toFixed(1)}min > 12min, extracting directly to MP3`);
        const mp3Path = path.join(dir, `${baseName}.mp3`);
        ffmpeg(inputPath)
          .noVideo()
          .audioChannels(1)
          .audioFrequency(16000)
          .audioCodec('libmp3lame')
          .audioBitrate('64k')
          .on('progress', (info) => {
            if (onProgress && info.percent) {
              onProgress(Math.min(info.percent, 100));
            }
          })
          .on('end', () => {
            logger.info(`Audio extracted directly to MP3: ${mp3Path}`);
            resolve(mp3Path);
          })
          .on('error', (err) => {
            logger.error('FFmpeg MP3 extraction error:', err);
            reject(new Error(`Błąd ekstrakcji audio: ${err.message}`));
          })
          .save(mp3Path);
      } else {
        logger.info(`Duration ${(duration / 60).toFixed(1)}min <= 12min, extracting to WAV`);
        const wavPath = path.join(dir, `${baseName}.wav`);
        ffmpeg(inputPath)
          .noVideo()
          .audioChannels(1)
          .audioFrequency(16000)
          .audioCodec('pcm_s16le')
          .format('wav')
          .on('progress', (info) => {
            if (onProgress && info.percent) {
              onProgress(Math.min(info.percent, 100));
            }
          })
          .on('end', async () => {
            logger.info(`Audio extracted to WAV: ${wavPath}`);
            const stats = fs.statSync(wavPath);

            if (stats.size > MAX_WHISPER_SIZE) {
              logger.info(`WAV too large (${(stats.size / 1024 / 1024).toFixed(1)}MB), converting to MP3`);
              try {
                const mp3Path = await convertToMp3(wavPath, dir, baseName);
                fs.unlinkSync(wavPath);
                resolve(mp3Path);
              } catch (err) {
                reject(err);
              }
            } else {
              resolve(wavPath);
            }
          })
          .on('error', (err) => {
            logger.error('FFmpeg extraction error:', err);
            reject(new Error(`Błąd ekstrakcji audio: ${err.message}`));
          })
          .save(wavPath);
      }
    });
  });
}

function convertToMp3(
  wavPath: string,
  dir: string,
  baseName: string
): Promise<string> {
  const mp3Path = path.join(dir, `${baseName}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .audioCodec('libmp3lame')
      .audioBitrate('64k')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => {
        logger.info(`Converted to MP3: ${mp3Path}`);
        resolve(mp3Path);
      })
      .on('error', (err) => {
        reject(new Error(`Błąd konwersji MP3: ${err.message}`));
      })
      .save(mp3Path);
  });
}

export function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration || 0);
    });
  });
}
