import { RefObject, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface VideoPreviewProps {
  src: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export function VideoPreview({
  src,
  videoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
}: VideoPreviewProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden motion-safe:animate-fade-in">
        <div className="w-full aspect-video bg-dark-950 flex flex-col items-center justify-center gap-3 text-dark-400">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
          <p className="text-sm">Nie udało się załadować wideo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden motion-safe:animate-fade-in">
      <video
        ref={videoRef}
        src={src}
        controls
        aria-label="Podgląd wideo"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onError={() => setError(true)}
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}
