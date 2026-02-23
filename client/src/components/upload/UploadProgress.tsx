import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SessionStatus } from '../../types';
import { statusLabels } from '../../utils/colors';

interface UploadProgressProps {
  status: SessionStatus;
  progress: number;
  filename: string;
  error: string | null;
  onReset: () => void;
}

export function UploadProgress({
  status,
  progress,
  filename,
  error,
  onReset,
}: UploadProgressProps) {
  const isError = status === 'error';
  const isDone = status === 'done';

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : isDone ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          )}
          <div>
            <p className="font-medium text-white text-sm">{filename}</p>
            <p className="text-xs text-dark-400">{statusLabels[status] || status}</p>
          </div>
        </div>
        {(isError || isDone) && (
          <button
            onClick={onReset}
            className="p-1 hover:bg-dark-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-dark-400" />
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
