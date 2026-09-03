import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, Upload, X } from 'lucide-react';
import { isValidHttpImageUrl } from '../../lib/imageUrl';
import {
  IMAGE_UPLOAD_ACCEPT,
  uploadImageToImgBB,
  validateImageFile,
} from '../../lib/imgbb';

export type ImageUploaderPreview = 'square' | 'banner' | 'avatar';

export interface ImageUploaderProps {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  preview?: ImageUploaderPreview;
}

type Tab = 'file' | 'url';

const previewClass: Record<ImageUploaderPreview, string> = {
  square: 'h-24 w-24 object-cover',
  avatar: 'h-24 w-24 rounded-full object-cover',
  banner: 'h-32 w-full object-cover',
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'https://ejemplo.com/imagen.png',
  error,
  hint,
  required = false,
  disabled = false,
  preview = 'square',
}) => {
  const autoId = useId();
  const inputId = id || autoId;
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('file');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlDraft, setUrlDraft] = useState(value);

  useEffect(() => {
    setUrlDraft(value);
  }, [value]);

  const cleanValue = value.trim();
  const displayError = error || uploadError;

  const applyUrl = (raw: string) => {
    const next = raw.trim();
    setUploadError('');
    onChange(next);
  };

  const clear = () => {
    setUploadError('');
    setProgress(0);
    setUrlDraft('');
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onPickFile = async (file: File | null) => {
    if (!file || disabled) return;
    const formatError = validateImageFile(file);
    if (formatError) {
      setUploadError(formatError);
      return;
    }
    setUploadError('');
    setUploading(true);
    setProgress(8);
    try {
      const url = await uploadImageToImgBB(file, setProgress);
      applyUrl(url);
      setUrlDraft(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    void onPickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const commitUrlDraft = () => {
    const next = urlDraft.trim();
    if (!next) {
      applyUrl('');
      return;
    }
    if (!isValidHttpImageUrl(next) || next === '') {
      setUploadError('Ingresa una URL válida (http o https).');
      return;
    }
    applyUrl(next);
  };

  return (
    <div>
      <label htmlFor={`${inputId}-${tab}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {label}
        {required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </label>

      {cleanValue ? (
        <div className="mb-3 relative inline-block max-w-full">
          <img
            src={cleanValue}
            alt=""
            className={`${previewClass[preview]} max-w-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 ${
              preview === 'avatar' ? '' : 'rounded-3xl'
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full inline-flex items-center justify-center shadow-md"
              aria-label="Quitar imagen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : null}

      <div
        className={`rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wide ${
              tab === 'file'
                ? 'bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wide ${
              tab === 'url'
                ? 'bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Pegar URL
          </button>
        </div>

        <div className="p-3 bg-white dark:bg-gray-900">
          {tab === 'file' ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                ref={fileRef}
                id={`${inputId}-file`}
                type="file"
                accept={IMAGE_UPLOAD_ACCEPT}
                className="sr-only"
                disabled={disabled || uploading}
                onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
              />
              <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {uploading
                  ? 'Subiendo imagen…'
                  : dragActive
                    ? 'Suelta la imagen aquí'
                    : cleanValue
                      ? 'Arrastra o haz clic para reemplazar'
                      : 'Arrastra o haz clic para subir'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF o SVG · máx. 2 MB</p>
              {uploading && (
                <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-violet-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                id={`${inputId}-url`}
                type="url"
                value={urlDraft}
                disabled={disabled || uploading}
                onChange={(e) => {
                  const next = e.target.value;
                  setUrlDraft(next);
                  setUploadError('');
                  if (next.trim() && isValidHttpImageUrl(next.trim())) {
                    onChange(next.trim());
                  }
                }}
                onBlur={commitUrlDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitUrlDraft();
                  }
                }}
                className={`input-field ${displayError ? 'border-red-500' : ''}`}
                placeholder={placeholder}
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Pega un enlace HTTPS y presiona Enter. La vista previa se actualiza al instante.
              </p>
            </div>
          )}
        </div>
      </div>

      {hint && !displayError && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {displayError && <p className="mt-1 text-sm text-red-600">{displayError}</p>}
    </div>
  );
};

export default memo(ImageUploader);
