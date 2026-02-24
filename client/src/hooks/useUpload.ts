import { useState, useCallback } from 'react';
import { uploadVideo, uploadTranscript, subscribeToStatus, startTranscription } from '../services/api';
import { SessionState, SessionStatus } from '../types';
import toast from 'react-hot-toast';

export function useUpload() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState('');
  const [filepath, setFilepath] = useState('');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    setFilename(file.name);

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isTranscript = ['.txt', '.json', '.srt'].includes(ext);

    try {
      const onProgress = (percent: number) => setProgress(percent);

      if (isTranscript) {
        const result = await uploadTranscript(file, onProgress);
        setSessionId(result.id);

        // Transcript is ready immediately — subscribe to get full session state
        const unsub = subscribeToStatus(
          result.id,
          (data: SessionState) => {
            setStatus(data.status as SessionStatus);
            setProgress(data.progress);
          },
          (err) => {
            console.warn('SSE error:', err);
          }
        );

        return () => unsub();
      }

      const result = await uploadVideo(file, onProgress);

      setSessionId(result.id);
      setStatus('processing_audio');
      setProgress(0);

      // Subscribe to SSE for background processing updates
      const unsub = subscribeToStatus(
        result.id,
        (data: SessionState) => {
          setStatus(data.status as SessionStatus);
          setProgress(data.progress);
          if (data.filepath) setFilepath(data.filepath);

          if (data.error) {
            setError(data.error);
            toast.error(data.error);
          }

          if (data.audioPath && data.status === 'processing_audio' && data.progress === 100) {
            // Audio ready — start transcription automatically
            startTranscription(result.id).catch((err) => {
              setError(err.message);
              setStatus('error');
              toast.error(err.message);
            });
          }
        },
        (err) => {
          // SSE closed — check current state
          console.warn('SSE error:', err);
        }
      );

      return () => unsub();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setStatus('error');
      toast.error(message);
    }
  }, []);

  const reset = useCallback(() => {
    setSessionId(null);
    setStatus('idle');
    setProgress(0);
    setFilename('');
    setFilepath('');
    setError(null);
  }, []);

  return {
    sessionId,
    status,
    progress,
    filename,
    filepath,
    error,
    upload,
    reset,
    setStatus,
    setProgress,
  };
}
