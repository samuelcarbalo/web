import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import Toast from '../UI/Toast';
import { useMpAdminConfig, useUpdateMpAdminConfig } from '../../hooks/usePayments';
import type { MpAdminConfigUpdate } from '../../lib/paymentsApi';

function apiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === 'string' && detail.trim() ? detail : fallback;
}

const EMPTY_FORM: MpAdminConfigUpdate = {
  is_production: false,
  public_key_test: '',
  access_token_test: '',
  public_key_prod: '',
  access_token_prod: '',
  client_id_prod: '',
  client_secret_prod: '',
};

const AdminMercadoPagoSettings: React.FC = () => {
  const { data, isLoading, isError, error } = useMpAdminConfig();
  const updateConfig = useUpdateMpAdminConfig();
  const [form, setForm] = useState<MpAdminConfigUpdate>(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null,
  );

  useEffect(() => {
    if (!data) return;
    setForm({
      is_production: data.is_production,
      public_key_test: data.public_key_test ?? '',
      access_token_test: data.access_token_test ?? '',
      public_key_prod: data.public_key_prod ?? '',
      access_token_prod: data.access_token_prod ?? '',
      client_id_prod: data.client_id_prod ?? '',
      client_secret_prod: data.client_secret_prod ?? '',
    });
  }, [data]);

  const closeToast = useCallback(() => setToast(null), []);

  const setField = (field: keyof MpAdminConfigUpdate, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    try {
      await updateConfig.mutateAsync(form);
      setToast({
        message: 'Configuración de Mercado Pago guardada correctamente.',
        variant: 'success',
      });
    } catch (err) {
      setToast({
        message: apiErrorMessage(err, 'No se pudo guardar la configuración de Mercado Pago.'),
        variant: 'error',
      });
    }
  };

  const forbidden =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 403;

  return (
    <>
      <section className="card-static">
        <div className="flex items-start gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Mercado Pago — Credenciales y entorno
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Solo Super Admin Root (Nivel 1). Alterna entre Sandbox (Test) y Producción (Live).
              Los tokens privados no se exponen al checkout público.
            </p>
          </div>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando configuración…
          </p>
        )}

        {forbidden && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
            No tienes privilegios de Super Admin Nivel 1 para gestionar Mercado Pago.
          </p>
        )}

        {isError && !forbidden && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200">
            {apiErrorMessage(error, 'No se pudo cargar la configuración de Mercado Pago.')}
          </p>
        )}

        {!isLoading && !isError && data && (
          <form className="space-y-8" onSubmit={(e) => void save(e)}>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Modo Producción</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {form.is_production
                      ? '🟢 Activo — se usan credenciales Live'
                      : '🟡 Inactivo — se usan credenciales Test / Sandbox'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(form.is_production)}
                    onChange={(e) => setField('is_production', e.target.checked)}
                  />
                  <span className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                </label>
              </div>
            </div>

            <fieldset className="space-y-4">
              <legend className="text-sm font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Entorno de pruebas (Test / Sandbox)
              </legend>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Public Key (Test)
                </label>
                <input
                  className="input-field font-mono text-sm"
                  value={form.public_key_test ?? ''}
                  onChange={(e) => setField('public_key_test', e.target.value)}
                  placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Access Token (Test)
                </label>
                <input
                  type="password"
                  className="input-field font-mono text-sm"
                  value={form.access_token_test ?? ''}
                  onChange={(e) => setField('access_token_test', e.target.value)}
                  placeholder="TEST-xxxxxxxx..."
                  autoComplete="off"
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Entorno de producción (Live)
              </legend>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Public Key (Producción)
                </label>
                <input
                  className="input-field font-mono text-sm"
                  value={form.public_key_prod ?? ''}
                  onChange={(e) => setField('public_key_prod', e.target.value)}
                  placeholder="APP_USR-xxxxxxxx..."
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Access Token (Producción)
                </label>
                <input
                  type="password"
                  className="input-field font-mono text-sm"
                  value={form.access_token_prod ?? ''}
                  onChange={(e) => setField('access_token_prod', e.target.value)}
                  placeholder="APP_USR-xxxxxxxx..."
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Client ID (opcional)
                </label>
                <input
                  className="input-field font-mono text-sm"
                  value={form.client_id_prod ?? ''}
                  onChange={(e) => setField('client_id_prod', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Client Secret (opcional)
                </label>
                <input
                  type="password"
                  className="input-field font-mono text-sm"
                  value={form.client_secret_prod ?? ''}
                  onChange={(e) => setField('client_secret_prod', e.target.value)}
                  autoComplete="off"
                />
              </div>
            </fieldset>

            {data.updated_at && (
              <p className="text-xs text-gray-500">
                Última actualización: {new Date(data.updated_at).toLocaleString('es-CO')}
              </p>
            )}

            <button
              type="submit"
              disabled={updateConfig.isPending}
              className="btn-primary inline-flex items-center gap-2"
            >
              {updateConfig.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar Configuración de Mercado Pago'
              )}
            </button>
          </form>
        )}
      </section>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={closeToast} />
      )}
    </>
  );
};

export default AdminMercadoPagoSettings;
