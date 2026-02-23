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
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
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
        accept="video/*"
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
            {dragging ? 'Upusc plik tutaj' : 'Przeciagnij wideo lub kliknij'}
          </p>
          <p className="text-sm text-dark-400 mt-1">
            MP4, MOV, AVI, WebM, MKV — nawet długie nagrania
          </p>
        </div>
      </div>
    </div>
  );
}
