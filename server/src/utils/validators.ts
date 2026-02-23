const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
  'video/mpeg',
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '2147483648', 10); // 2GB

export function isValidMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime);
}

export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}
