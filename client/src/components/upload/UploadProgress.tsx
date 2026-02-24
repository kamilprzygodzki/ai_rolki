import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SessionStatus } from '../../types';
import { statusLabels } from '../../utils/colors';

interface UploadProgressProps {
  status: SessionStatus;
  progress: number;
  filename: string;
  error: string | null;
  whisperProvider?: string;
  onReset: () => void;
}

export function UploadProgress({
  status,
  progress,
  filename,
  error,
  whisperProvider,
  onReset,
}: UploadProgressProps) {
  const isError = status === 'error';
  const isDone = status === 'done';

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 motion-safe:animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
          ) : isDone ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" aria-hidden="true" />
          ) : (
            <Loader2 className="w-5 h-5 text-violet-400 motion-safe:animate-spin" aria-hidden="true" />
          )}
          <div>
            <p className="font-medium text-white text-sm">{filename}</p>
            <p className="text-xs text-dark-400">
              {statusLabels[status] || status}
              {whisperProvider && status === 'transcribing' && (
                <span className="text-dark-500"> · {whisperProvider}</span>
              )}
            </p>
          </div>
        </div>
        {(isError || isDone) && (
          <button
            onClick={onReset}
            aria-label="Zamknij"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-dark-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-dark-400" aria-hidden="true" />
          </button>
        )}
      </div>

      {!isError && !isDone && (
        <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      )}

      {isError && error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
