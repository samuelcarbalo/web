import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  WRONG_TEMPLATE_MESSAGE,
  downloadAdminImportTemplate,
  listAdminImportModules,
  uploadAdminImportExcel,
  type AdminImportModule,
  type AdminImportResult,
} from '../../lib/adminImportApi';
import {
  fallbackImportModules,
  guessImportModule,
  headersMatchModule,
  readXlsxHeaders,
} from '../../lib/xlsxHeaders';
import { useQuery } from '@tanstack/react-query';

const MODULE_LABELS: Record<AdminImportModule, string> = {
  schedule: 'Calendario de Torneo',
  players: 'Lista de Jugadores',
  jobs: 'Ofertas de Empleo',
  products: 'Productos de Tienda',
  discounts: 'Descuentos / Ofertas Temporales',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AdminExcelImportPanel: React.FC = () => {
  const [module, setModule] = useState<AdminImportModule>('products');
  const [file, setFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[] | null>(null);
  const [readError, setReadError] = useState('');
  const [readingHeaders, setReadingHeaders] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<AdminImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const readGenRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modulesQuery = useQuery({
    queryKey: ['admin-import-modules'],
    queryFn: listAdminImportModules,
    staleTime: 10 * 60 * 1000,
  });

  const allModules = useMemo(() => {
    if (modulesQuery.data?.modules?.length) return modulesQuery.data.modules;
    return fallbackImportModules();
  }, [modulesQuery.data]);

  const headers = useMemo(() => {
    const found = allModules.find((m) => m.key === module);
    return found?.headers ?? [];
  }, [allModules, module]);

  const headerMismatch = useMemo(() => {
    if (readError) return readError;
    if (!fileHeaders) return '';
    if (headersMatchModule(module, fileHeaders)) return '';
    const guessed = guessImportModule(fileHeaders, allModules);
    if (guessed && guessed !== module) {
      return `${WRONG_TEMPLATE_MESSAGE} El archivo parece de ${MODULE_LABELS[guessed]}, pero está seleccionado ${MODULE_LABELS[module]}.`;
    }
    return WRONG_TEMPLATE_MESSAGE;
  }, [allModules, fileHeaders, module, readError]);

  const onFile = useCallback((f: File | null) => {
    const gen = ++readGenRef.current;
    setFile(f);
    setFileHeaders(null);
    setReadError('');
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
    if (!f) {
      setReadingHeaders(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setReadingHeaders(true);
    void readXlsxHeaders(f)
      .then((received) => {
        if (gen !== readGenRef.current) return;
        setFileHeaders(received);
      })
      .catch(() => {
        if (gen !== readGenRef.current) return;
        setReadError(
          'No se pudieron leer los encabezados del archivo. Usa un Excel .xlsx exportado desde la plantilla.',
        );
      })
      .finally(() => {
        if (gen !== readGenRef.current) return;
        setReadingHeaders(false);
      });
  }, []);

  const openPicker = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const handleDownload = async () => {
    try {
      await downloadAdminImportTemplate(module);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo descargar la plantilla');
      setStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Selecciona un archivo .xlsx');
      setStatus('error');
      return;
    }
    if (headerMismatch || readingHeaders) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await uploadAdminImportExcel(module, file);
      setResult(res);
      setStatus(res.error_count > 0 && res.created + res.updated === 0 ? 'error' : 'success');
    } catch (err) {
      setResult(null);
      const axiosData = (err as { response?: { data?: { detail?: string; message?: string } } })
        ?.response?.data;
      setErrorMsg(
        axiosData?.detail ||
          axiosData?.message ||
          (err instanceof Error ? err.message : 'Error al importar'),
      );
      setStatus('error');
    }
  };

  return (
    <section className="mt-10 card-static p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-2xl bg-secondary-100 dark:bg-secondary-950/40 p-3">
          <FileSpreadsheet className="w-6 h-6 text-secondary-700 dark:text-secondary-300" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Carga masiva Excel (.xlsx)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Descarga la plantilla, completa las filas y súbela. Solo staff / admin.
          </p>
        </div>
      </div>

      <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
        Módulo a importar
      </label>
      <select
        value={module}
        onChange={(e) => {
          setModule(e.target.value as AdminImportModule);
          setResult(null);
          setStatus('idle');
          setErrorMsg('');
        }}
        className="w-full sm:max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-semibold"
      >
        {(Object.keys(MODULE_LABELS) as AdminImportModule[]).map((key) => (
          <option key={key} value={key}>
            {MODULE_LABELS[key]}
          </option>
        ))}
      </select>

      {headers.length > 0 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Columnas: <span className="font-mono">{headers.join(', ')}</span>
        </p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void handleDownload()}
          className="btn-secondary inline-flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar Plantilla Excel (.xlsx)
        </button>
        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={status === 'loading' || !file || Boolean(headerMismatch) || readingHeaders}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Subir e importar
        </button>
      </div>

      {headerMismatch && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{headerMismatch}</p>
        </div>
      )}

      {readingHeaders && (
        <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Revisando encabezados del Excel…
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-900">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="rounded-2xl bg-secondary-100 p-3 dark:bg-secondary-950/40">
              <FileSpreadsheet className="h-6 w-6 text-secondary-700 dark:text-secondary-300" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={openPicker}
              className="btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => onFile(null)}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Quitar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-6 cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? 'border-secondary-600 bg-secondary-50 dark:bg-secondary-950/30'
              : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Arrastra el Excel aquí o selecciona un archivo
          </p>
          <button
            type="button"
            className="btn-primary mt-4 inline-flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Seleccionar archivo Excel
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Importación completada
          {result && (
            <span>
              — creados {result.created}, actualizados {result.updated}, errores {result.error_count}
            </span>
          )}
        </div>
      )}
      {status === 'error' && errorMsg && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-600">
          <AlertTriangle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {result && result.errors.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-amber-200 dark:border-amber-900/50">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-50 dark:bg-amber-950/40 text-left">
              <tr>
                <th className="px-4 py-2 font-bold">Fila</th>
                <th className="px-4 py-2 font-bold">Campo</th>
                <th className="px-4 py-2 font-bold">Error</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((err, i) => (
                <tr key={`${err.row}-${i}`} className="border-t border-amber-100 dark:border-amber-900/30">
                  <td className="px-4 py-2 tabular-nums">{err.row}</td>
                  <td className="px-4 py-2 font-mono text-xs">{err.field || '—'}</td>
                  <td className="px-4 py-2">{err.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminExcelImportPanel;
