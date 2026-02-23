import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const MAX_WHISPER_SIZE = 25 * 1024 * 1024; // 25MB

export function extractAudio(
  inputPath: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const wavPath = path.join(dir, `${baseName}.wav`);

  return new Promise((resolve, reject) => {
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
