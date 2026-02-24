import { useCallback, useState, useRef } from 'react';
import { Upload, Film } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Przeciągnij plik lub kliknij, aby wybrać"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`
        border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-dark-950
        ${
          dragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-dark-700 hover:border-dark-500 bg-dark-900/50 hover:bg-dark-900'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.txt,.json,.srt"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${dragging ? 'bg-violet-500/20' : 'bg-dark-800'}`}>
          {dragging ? (
            <Film className="w-8 h-8 text-violet-400" />
          ) : (
            <Upload className="w-8 h-8 text-dark-400" />
          )}
        </div>

        <div>
          <p className="text-lg font-medium text-white">
            {dragging ? 'Upuść plik tutaj' : 'Przeciągnij plik lub kliknij'}
          </p>
          <p className="text-sm text-dark-400 mt-1">
            Wideo (MP4, MOV, AVI, WebM, MKV) lub transkrypcja (.txt, .json, .srt)
          </p>
        </div>
      </div>
    </div>
  );
}
