import { useState, useEffect } from 'react';
import { Header } from './Header';
import { UploadZone } from '../upload/UploadZone';
import { UploadProgress } from '../upload/UploadProgress';
import { ModelSelector } from '../settings/ModelSelector';
import { VideoPreview } from '../video/VideoPreview';
import { TranscriptPanel } from '../transcript/TranscriptPanel';
import { AnalysisPanel } from '../analysis/AnalysisPanel';
import { ExportButton } from '../export/ExportButton';
import { useUpload } from '../../hooks/useUpload';
import { useTranscription } from '../../hooks/useTranscription';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { fetchModels, getVideoUrl } from '../../services/api';
import { ModelOption } from '../../types';

export function AppShell() {
  const upload = useUpload();
  const transcription = useTranscription(upload.sessionId);
  const analysisHook = useAnalysis(upload.sessionId);
  const videoPlayer = useVideoPlayer();

  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetchModels()
      .then((m) => {
        setModels(m);
        if (m.length > 0) setSelectedModel(m[0].id);
      })
      .catch(() => {
        // Server not ready yet
      });
  }, []);

  const handleAnalyze = () => {
    if (selectedModel) {
      analysisHook.analyze(selectedModel);
    }
  };

  const isIdle = upload.status === 'idle';
  const isProcessing = ['uploading', 'processing_audio', 'transcribing'].includes(upload.status);
  const hasTranscript = !!transcription.transcript;
  const hasAnalysis = !!analysisHook.analysis;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {isIdle && <UploadZone onUpload={upload.upload} />}

        {isProcessing && (
          <UploadProgress
            status={upload.status}
            progress={upload.progress}
            filename={upload.filename}
            error={upload.error}
            onReset={upload.reset}
          />
        )}

        {upload.status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{upload.error}</p>
            <button
              onClick={upload.reset}
              className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm transition-colors"
            >
              Sprobuj ponownie
            </button>
          </div>
        )}

        {hasTranscript && !hasAnalysis && !analysisHook.analyzing && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-white">Transkrypcja gotowa</h2>
            <p className="text-dark-400 text-sm">
              {transcription.transcript!.segments.length} segmentow,{' '}
              {Math.round(transcription.transcript!.duration / 60)} min
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <ModelSelector
                models={models}
                selected={selectedModel}
                onChange={setSelectedModel}
              />
              <button
                onClick={handleAnalyze}
                disabled={!selectedModel}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 rounded-lg font-medium transition-all"
              >
                Analizuj z AI
              </button>
            </div>
          </div>
        )}

        {analysisHook.analyzing && !hasAnalysis && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-dark-300">{analysisHook.progressMessage}</span>
            </div>
          </div>
        )}

        {(hasTranscript || hasAnalysis) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6 lg:sticky lg:top-[5.5rem] lg:self-start">
              {upload.filepath && (
                <VideoPreview
                  src={getVideoUrl(upload.filepath)}
                  videoRef={videoPlayer.videoRef}
                  onTimeUpdate={videoPlayer.onTimeUpdate}
                  onLoadedMetadata={videoPlayer.onLoadedMetadata}
                  onPlay={videoPlayer.onPlay}
                  onPause={videoPlayer.onPause}
                />
              )}

              {hasTranscript && (
                <TranscriptPanel
                  transcript={transcription.transcript!}
                  currentTime={videoPlayer.currentTime}
                  searchQuery={transcription.searchQuery}
                  onSearchChange={transcription.setSearchQuery}
                  onSeek={videoPlayer.seekTo}
                  filteredSegments={transcription.filteredSegments()}
                />
              )}
            </div>

            <div className="space-y-6">
              {hasAnalysis && analysisHook.analyzing && (
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-dark-300">{analysisHook.progressMessage}</span>
                  </div>
                </div>
              )}
              {hasAnalysis && !analysisHook.analyzing && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ModelSelector
                        models={models}
                        selected={selectedModel}
                        onChange={setSelectedModel}
                      />
                      <button
                        onClick={handleAnalyze}
                        disabled={!selectedModel}
                        className="shrink-0 mt-auto px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-violet-500/50 disabled:opacity-50 rounded-lg text-sm font-medium transition-all"
                      >
                        Ponow analize
                      </button>
                    </div>
                    <div className="mt-auto">
                      <ExportButton
                        sessionId={upload.sessionId!}
                        analysis={analysisHook.analysis!}
                        filename={upload.filename}
                      />
                    </div>
                  </div>
                  <AnalysisPanel
                    analysis={analysisHook.analysis!}
                    onSeek={videoPlayer.seekTo}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
