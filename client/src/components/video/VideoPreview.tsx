import { RefObject } from 'react';

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
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden animate-fade-in">
      <video
        ref={videoRef}
        src={src}
        controls
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}
