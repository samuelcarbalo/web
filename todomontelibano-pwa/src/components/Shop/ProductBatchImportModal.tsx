import React, { useCallback, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import Modal from '../UI/Modal';
import {
  PRODUCT_IMPORT_HEADERS,
  SHOP_BATCH_MAX_BYTES,
  SHOP_BATCH_MAX_ROWS,
  downloadProductImportTemplate,
  uploadProductImportBatch,
  type ProductBatchImportResult,
} from '../../lib/shopApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ProductBatchImportModal: React.FC<Props> = ({ open, onClose, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<ProductBatchImportResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleClose = () => {
    if (status === 'loading') return;
    reset();
    onClose();
  };

  const onPick = (f: File | null) => {
    setResult(null);
    setErrorMsg('');
    setStatus('idle');
    if (!f) {
      setFile(null);
      return;
    }
    const lower = f.name.toLowerCase();
    if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      setFile(null);
      setErrorMsg('Solo se admiten archivos .csv o .xlsx');
      setStatus('error');
      return;
    }
    if (f.size > SHOP_BATCH_MAX_BYTES) {
      setFile(null);
      setErrorMsg(
        `El archivo supera ${SHOP_BATCH_MAX_BYTES / (1024 * 1024)} MB (plan Free). Reduce el tamaño o divide el lote.`,
      );
      setStatus('error');
      return;
    }
    setFile(f);
  };

  const handleDownload = async (fmt: 'xlsx' | 'csv') => {
    setDownloading(true);
    setErrorMsg('');
    try {
      await downloadProductImportTemplate(fmt);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo descargar la plantilla');
      setStatus('error');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Selecciona un archivo CSV o Excel');
      setStatus('error');
      return;
    }
    if (file.size > SHOP_BATCH_MAX_BYTES) {
      setErrorMsg(`Máximo ${SHOP_BATCH_MAX_BYTES / (1024 * 1024)} MB por archivo.`);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await uploadProductImportBatch(file);
      setResult(res);
      const failedAll = res.error_count > 0 && res.created + res.updated === 0;
      setStatus(failedAll ? 'error' : 'success');
      if (!failedAll) onImported();
    } catch (err) {
      setResult(null);
      const data = (err as { response?: { data?: ProductBatchImportResult & { detail?: string } } })
        ?.response?.data;
      setErrorMsg(
        data?.message ||
          data?.detail ||
          (err instanceof Error ? err.message : 'Error al importar'),
      );
      if (data?.errors?.length) setResult(data as ProductBatchImportResult);
      setStatus('error');
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Cargar productos en lote">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Importa un catálogo con la plantilla oficial. Plan Free: máximo{' '}
        <strong>{SHOP_BATCH_MAX_ROWS} filas</strong> y{' '}
        <strong>{SHOP_BATCH_MAX_BYTES / (1024 * 1024)} MB</strong> por archivo.
      </p>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
        Columnas: {PRODUCT_IMPORT_HEADERS.join(', ')}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={downloading}
          onClick={() => void handleDownload('xlsx')}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Plantilla Excel
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void handleDownload('csv')}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Plantilla CSV
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-3">
          <FileSpreadsheet className="w-6 h-6 text-violet-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700"
            onClick={() => onPick(null)}
            aria-label="Quitar archivo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center hover:border-violet-500"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <span className="text-sm font-semibold">Seleccionar CSV o Excel</span>
        </button>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700"
          onClick={handleClose}
          disabled={status === 'loading'}
        >
          Cerrar
        </button>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          onClick={() => void handleUpload()}
          disabled={!file || status === 'loading'}
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Importar
        </button>
      </div>

      {status === 'success' && result && (
        <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Listo — creados {result.created}, actualizados {result.updated}
            {result.error_count ? `, con ${result.error_count} error(es) de fila` : ''}.
          </span>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-red-600">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && result.errors?.length > 0 && (
        <div className="mt-4 max-h-48 overflow-auto rounded-2xl border border-amber-200 dark:border-amber-900/50">
          <table className="min-w-full text-xs">
            <thead className="bg-amber-50 dark:bg-amber-950/40 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Fila</th>
                <th className="px-3 py-2 text-left">Campo</th>
                <th className="px-3 py-2 text-left">Error</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((err, i) => (
                <tr
                  key={`${err.row}-${i}`}
                  className="border-t border-amber-100 dark:border-amber-900/30"
                >
                  <td className="px-3 py-1.5 tabular-nums">{err.row}</td>
                  <td className="px-3 py-1.5 font-mono">{err.field || '—'}</td>
                  <td className="px-3 py-1.5">{err.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default ProductBatchImportModal;
