import { useState, useCallback, useEffect } from 'react';
import { subscribeToStatus } from '../services/api';
import { TranscriptResult, SessionStatus } from '../types';

export function useTranscription(sessionId: string | null) {
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    const unsub = subscribeToStatus(sessionId, (data) => {
      if (data.transcript) {
        setTranscript(data.transcript);
      }
    });

    return unsub;
  }, [sessionId]);

  const filteredSegments = useCallback(() => {
    if (!transcript) return [];
    if (!searchQuery.trim()) return transcript.segments;

    const query = searchQuery.toLowerCase();
    return transcript.segments.filter((seg) =>
      seg.text.toLowerCase().includes(query)
    );
  }, [transcript, searchQuery]);

  return {
    transcript,
    setTranscript,
    searchQuery,
    setSearchQuery,
    filteredSegments,
  };
}
