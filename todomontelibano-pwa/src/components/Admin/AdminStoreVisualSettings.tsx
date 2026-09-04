import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Store, Trash2, Upload } from 'lucide-react';
import { getMediaUrl } from '../../lib/api';
import { useDeleteStoreLogo, useShopSettings, useUpdateStoreLogo, useUpdateStoreSettings } from '../../hooks/useShop';
import ImageUploader from '../UI/ImageUploader';

const AdminStoreVisualSettings: React.FC = () => {
  const { data, isLoading } = useShopSettings();
  const updateLogo = useUpdateStoreLogo();
  const updateSettings = useUpdateStoreSettings();
  const deleteLogo = useDeleteStoreLogo();

  const savedUrl = getMediaUrl(data?.settings.store_logo) ?? '';
  const savedShipping = String(Number(data?.settings.shipping_cost_cop || 0));
  const [logoUrl, setLogoUrl] = useState('');
  const [shippingCost, setShippingCost] = useState('0');
  const [errorMsg, setErrorMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    setLogoUrl(savedUrl);
  }, [savedUrl]);

  useEffect(() => {
    setShippingCost(savedShipping);
  }, [savedShipping]);

  const dirty = logoUrl.trim() !== savedUrl.trim();
  const shippingDirty = shippingCost.trim() !== savedShipping;
  const canSave = dirty && Boolean(logoUrl.trim());
  const canReset = Boolean(savedUrl) || dirty;
  const busy = updateLogo.isPending || deleteLogo.isPending || updateSettings.isPending;

  const save = async () => {
    if (!logoUrl.trim()) {
      setErrorMsg('Selecciona o pega una imagen del logo antes de guardar.');
      return;
    }
    setErrorMsg('');
    setOkMsg('');
    try {
      await updateLogo.mutateAsync(logoUrl.trim());
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
    if (dirty) {
      setLogoUrl(savedUrl);
      return;
    }
    try {
      await deleteLogo.mutateAsync();
      setLogoUrl('');
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
            Sube un archivo o pega una URL HTTPS. Solo staff / superusuario puede modificarlo; los
            visitantes no ven controles de edición.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando configuración…
        </p>
      ) : (
        <div>
          <ImageUploader
            id="store-logo"
            label="Logo de la tienda"
            value={logoUrl}
            onChange={(url) => {
              setLogoUrl(url);
              setErrorMsg('');
              setOkMsg('');
            }}
            preview="square"
            hint="PNG, JPG, WEBP o SVG. Recomendado fondo transparente."
          />

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
              disabled={!canReset || busy}
              onClick={() => void reset()}
            >
              <Trash2 className="w-4 h-4" />
              {dirty ? 'Cancelar cambios' : 'Restablecer logo'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <label className="auth-label" htmlFor="store-shipping">
          Costo de envío (COP)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Se muestra en checkout y se envía a Mercado Pago como ítem aparte. Usa 0 si no aplica.
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <input
            id="store-shipping"
            type="number"
            min={0}
            step={1}
            className="input-field max-w-xs"
            value={shippingCost}
            onChange={(e) => {
              setShippingCost(e.target.value);
              setErrorMsg('');
              setOkMsg('');
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={!shippingDirty || busy}
            onClick={async () => {
              const amount = Math.max(0, Math.round(Number(shippingCost || 0)));
              setErrorMsg('');
              setOkMsg('');
              try {
                await updateSettings.mutateAsync({ shipping_cost_cop: amount });
                setShippingCost(String(amount));
                setOkMsg('Costo de envío actualizado. El checkout usará este valor.');
              } catch (err) {
                const axiosDetail = (err as { response?: { data?: { detail?: string } } })?.response
                  ?.data?.detail;
                setErrorMsg(
                  axiosDetail ||
                    (err instanceof Error ? err.message : 'No se pudo guardar el costo de envío.'),
                );
              }
            }}
          >
            Guardar envío
          </button>
        </div>
      </div>

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
