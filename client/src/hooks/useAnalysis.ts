import { useState, useCallback } from 'react';
import { startAnalysis } from '../services/api';
import { AnalysisResult } from '../types';
import toast from 'react-hot-toast';

export function useAnalysis(sessionId: string | null) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const analyze = useCallback(
    (model: string) => {
      if (!sessionId) return;

      setAnalyzing(true);
      setProgressMessage('Rozpoczynam analizę...');

      const cancel = startAnalysis(
        sessionId,
        model,
        (data) => {
          if (data.type === 'progress') {
            setProgressMessage(data.message);
          }
          if (data.type === 'done') {
            setAnalysis(data.analysis);
            setAnalyzing(false);
            setProgressMessage('');
            toast.success('Analiza zakończona!');
          }
          if (data.type === 'error') {
            setAnalyzing(false);
            setProgressMessage('');
            toast.error(data.error);
          }
        },
        (err) => {
          setAnalyzing(false);
          setProgressMessage('');
          toast.error(err.message);
        }
      );

      return cancel;
    },
    [sessionId]
  );

  return {
    analysis,
    analyzing,
    progressMessage,
    analyze,
    setAnalysis,
  };
}
