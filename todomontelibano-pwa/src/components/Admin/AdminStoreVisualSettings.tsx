import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ImagePlus, Loader2, Store, Trash2, Upload } from 'lucide-react';
import { getMediaUrl } from '../../lib/api';
import { uploadImageToImgBB } from '../../lib/imgbb';
import { useDeleteStoreLogo, useShopSettings, useUpdateStoreLogo } from '../../hooks/useShop';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif';

const AdminStoreVisualSettings: React.FC = () => {
  const { data, isLoading } = useShopSettings();
  const updateLogo = useUpdateStoreLogo();
  const deleteLogo = useDeleteStoreLogo();

  const savedUrl = getMediaUrl(data?.settings.store_logo) ?? '';
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = previewUrl || savedUrl;
  const canSave = Boolean(file);
  const canReset = Boolean(savedUrl) && !file;
  const busy = updateLogo.isPending || deleteLogo.isPending;

  const helper = useMemo(() => {
    if (file) return `Listo para guardar: ${file.name}`;
    if (savedUrl) return 'Logo actual de la tienda. Sube otra imagen para reemplazarlo.';
    return 'Aún no hay logo. El público verá el placeholder “Logo Tienda”.';
  }, [file, savedUrl]);

  const onPick = (next: File | null) => {
    setFile(next);
    setErrorMsg('');
    setOkMsg('');
  };

  const save = async () => {
    if (!file) {
      setErrorMsg('Selecciona una imagen del logo antes de guardar.');
      return;
    }
    setErrorMsg('');
    setOkMsg('');
    try {
      const url = await uploadImageToImgBB(file);
      await updateLogo.mutateAsync(url);
      setFile(null);
      setOkMsg('Logo de la tienda actualizado. El sub-navbar público ya muestra la nueva imagen.');
    } catch (err) {
      const axiosDetail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      setErrorMsg(
        axiosDetail ||
          (err instanceof Error ? err.message : 'No se pudo guardar el logo de la tienda.'),
      );
    }
  };

  const reset = async () => {
    setErrorMsg('');
    setOkMsg('');
    try {
      await deleteLogo.mutateAsync();
      setFile(null);
      setOkMsg('Logo eliminado. El público verá de nuevo el placeholder.');
    } catch (err) {
      const axiosDetail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      setErrorMsg(
        axiosDetail || (err instanceof Error ? err.message : 'No se pudo restablecer el logo.'),
      );
    }
  };

  return (
    <section className="card-static">
      <div className="flex items-start gap-3 mb-4">
        <Store className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Configuración Visual de la Tienda
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sube o reemplaza el logo que aparece en el sub-navbar público. Solo staff / superusuario
            puede modificarlo; los visitantes no ven controles de edición.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando configuración…
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_14rem] items-start">
          <div>
            <label className="auth-label">Imagen del logo (store_logo)</label>
            <div
              className="mt-2 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const next = e.dataTransfer.files?.[0];
                if (next) onPick(next);
              }}
            >
              <ImagePlus className="w-8 h-8 mx-auto text-gray-400 mb-3" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Arrastra una imagen o selecciónala
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP o SVG. Recomendado fondo transparente.</p>
              <input
                type="file"
                accept={ACCEPT}
                className="mt-4 text-sm"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
            </div>
            <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">{helper}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2"
                disabled={!canSave || busy}
                onClick={() => void save()}
              >
                {updateLogo.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Guardar logo
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                disabled={(!canReset && !file) || busy}
                onClick={() => {
                  if (file) {
                    onPick(null);
                    return;
                  }
                  void reset();
                }}
              >
                <Trash2 className="w-4 h-4" />
                {file ? 'Cancelar selección' : 'Restablecer logo'}
              </button>
            </div>
          </div>

          <div>
            <p className="auth-label">Vista previa</p>
            <div className="mt-2 flex items-center justify-center min-h-[7.5rem] rounded-2xl border border-dashed border-secondary-300/80 dark:border-secondary-700/80 bg-secondary-50/80 dark:bg-primary-950/40 px-3">
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt="Vista previa del logo de la tienda"
                  className="h-12 w-auto max-w-[10rem] object-contain"
                />
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary-600/70 dark:text-secondary-400/70">
                  Logo Tienda
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {okMsg && (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          {okMsg}
        </p>
      )}
      {errorMsg && (
        <p className="mt-4 text-sm font-semibold text-rose-600 dark:text-rose-400">{errorMsg}</p>
      )}
    </section>
  );
};

export default AdminStoreVisualSettings;
