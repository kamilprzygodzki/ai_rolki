import { RefObject, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EngagementTimeline } from './EngagementTimeline';
import { RetentionOverlay } from './RetentionOverlay';
import { EngagementSegment, RetentionPrediction } from '../../types';

interface VideoPreviewProps {
  src: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onPlay: () => void;
  onPause: () => void;
  engagementMap?: EngagementSegment[];
  retentionPrediction?: RetentionPrediction;
  duration?: number;
  onSeek?: (time: number) => void;
}

export function VideoPreview({
  src,
  videoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  engagementMap,
  retentionPrediction,
  duration,
  onSeek,
}: VideoPreviewProps) {
  const [error, setError] = useState(false);

  const handleSeek = (time: number) => {
    if (onSeek) onSeek(time);
    else if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

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

  const videoDuration = duration || 0;
  const hasOverlays = (engagementMap && engagementMap.length > 0) || retentionPrediction;

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
      {hasOverlays && videoDuration > 0 && (
        <div className="relative space-y-1 pt-1">
          {engagementMap && engagementMap.length > 0 && (
            <EngagementTimeline
              segments={engagementMap}
              duration={videoDuration}
              onSeek={handleSeek}
            />
          )}
          {retentionPrediction && (
            <RetentionOverlay
              prediction={retentionPrediction}
              duration={videoDuration}
              onSeek={handleSeek}
            />
          )}
        </div>
      )}
    </div>
  );
}
