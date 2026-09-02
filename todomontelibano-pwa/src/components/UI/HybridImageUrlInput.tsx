import React, { memo, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadImageToImgBB } from '../../lib/imgbb';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

export interface HybridImageUrlInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
}

const HybridImageUrlInput: React.FC<HybridImageUrlInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'https://ejemplo.com/imagen.png',
  error,
  hint,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const displayError = error || uploadError;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => {
            setUploadError('');
            onChange(e.target.value);
          }}
          className={`input-field flex-1 ${displayError ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="btn-secondary inline-flex items-center justify-center gap-2 shrink-0 sm:min-w-[9.5rem]"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Subiendo…
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              Subir archivo
            </>
          )}
        </button>
      </div>
      {hint && !displayError && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {displayError && <p className="mt-1 text-sm text-red-600">{displayError}</p>}
      {value.trim() && !displayError && (
        <img
          src={value.trim()}
          alt=""
          className="mt-3 h-20 w-auto max-w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-900"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};

export default memo(HybridImageUrlInput);
