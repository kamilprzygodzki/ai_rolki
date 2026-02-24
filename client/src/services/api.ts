import { ModelOption } from '../types';

const BASE = '/api';

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ id: string; filename: string }> {
  const formData = new FormData();
  formData.append('video', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Błąd sieci'));
    xhr.send(formData);
  });
}

export async function uploadTranscript(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ id: string; filename: string }> {
  const formData = new FormData();
  formData.append('transcript', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/upload-transcript`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Błąd sieci'));
    xhr.send(formData);
  });
}

export function subscribeToStatus(
  sessionId: string,
  onMessage: (data: any) => void,
  onError?: (err: Error) => void
): () => void {
  const es = new EventSource(`${BASE}/status/${sessionId}`);

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      // ignore parse errors
    }
  };

  es.onerror = () => {
    onError?.(new Error('SSE connection error'));
    es.close();
  };

  return () => es.close();
}

export async function startTranscription(sessionId: string): Promise<void> {
  const res = await fetch(`${BASE}/transcribe/${sessionId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Transcription failed');
  }
}

export function startAnalysis(
  sessionId: string,
  model: string,
  onMessage: (data: any) => void,
  onError?: (err: Error) => void
): () => void {
  const controller = new AbortController();

  fetch(`${BASE}/analyze/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Analysis request failed');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onMessage(data);
            } catch (e) {
              console.error('SSE JSON parse error:', e, 'Line:', line.substring(0, 200));
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError?.(err);
      }
    });

  return () => controller.abort();
}

export async function fetchModels(): Promise<ModelOption[]> {
  const res = await fetch(`${BASE}/analyze/models`);
  const data = await res.json();
  return data.models;
}

export function getExportUrl(sessionId: string, format: string): string {
  return `${BASE}/export/${sessionId}?format=${format}`;
}

export function getVideoUrl(filepath: string): string {
  const filename = filepath.split('/').pop() || filepath.split('\\').pop() || filepath;
  return `/uploads/${filename}`;
}
