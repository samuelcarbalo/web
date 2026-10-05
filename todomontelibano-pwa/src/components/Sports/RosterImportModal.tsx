import React, { useRef, useState } from 'react';
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
import { downloadRosterImportTemplate } from '../../lib/sportsApi';
import { useImportTeamRoster } from '../../hooks/useSports';
import type { RosterImportResult } from '../../types/sports';

const MAX_BYTES = 2 * 1024 * 1024;

const COLUMNS = [
  { label: 'Nombres', required: true },
  { label: 'Apellidos', required: true },
  { label: 'Documento de Identidad', required: true },
  { label: 'Número de Camiseta', required: true },
  { label: 'Posición', required: true },
  { label: 'Fecha de Nacimiento', required: false },
  { label: 'Teléfono', required: false },
];

type Props = {
  open: boolean;
  onClose: () => void;
  teamId: string;
  teamName?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const RosterImportModal: React.FC<Props> = ({ open, onClose, teamId, teamName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<RosterImportResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportTeamRoster();
  const uploading = importMutation.isPending;

  const reset = () => {
    setFile(null);
    setErrorMsg('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const onPick = (f: File | null) => {
    setResult(null);
    setErrorMsg('');
    if (!f) {
      setFile(null);
      return;
    }
    const lower = f.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.csv')) {
      setFile(null);
      setErrorMsg('Solo se admiten archivos .xlsx o .csv');
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setErrorMsg('El archivo supera el máximo de 2 MB.');
      return;
    }
    setFile(f);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setErrorMsg('');
    try {
      await downloadRosterImportTemplate();
    } catch {
      setErrorMsg('No se pudo descargar la plantilla de ejemplo.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = () => {
    if (!file || !teamId) return;
    setErrorMsg('');
    setResult(null);
    importMutation.mutate(
      { teamId, file },
      {
        onSuccess: (res) => {
          setResult(res);
          setFile(null);
          if (inputRef.current) inputRef.current.value = '';
        },
        onError: (err) => {
          const data = (err as { response?: { data?: { message?: string; detail?: string } } })
            ?.response?.data;
          setErrorMsg(data?.message || data?.detail || 'No se pudo importar el archivo.');
        },
      },
    );
  };

  const allFailed = !!result && result.created === 0 && result.error_count > 0;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={teamName ? `Cargar plantilla Excel — ${teamName}` : 'Cargar plantilla Excel'}
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Inscribe varios jugadores a la vez con la plantilla oficial (.xlsx o .csv, máximo 2 MB).
        Se omiten las filas con documento o número de camiseta repetidos en el equipo.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {COLUMNS.map((col) => (
          <span
            key={col.label}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              col.required
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}
          >
            {col.label}
            {col.required ? ' *' : ' (opcional)'}
          </span>
        ))}
      </div>

      <button
        type="button"
        disabled={downloading}
        onClick={() => void handleDownload()}
        className="mt-4 btn-secondary inline-flex items-center gap-2 text-sm"
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Descargar plantilla de ejemplo (.xlsx)
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-3">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
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
          className="mt-5 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center hover:border-emerald-500"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <span className="text-sm font-semibold">Seleccionar archivo Excel o CSV</span>
        </button>
      )}

      {result && (
        <div
          className={`mt-4 flex items-start gap-2 text-sm font-semibold ${
            allFailed ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {allFailed ? (
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{result.message}.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-red-600">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && result.errors.length > 0 && (
        <div className="mt-4 max-h-56 overflow-auto rounded-2xl border border-amber-200 dark:border-amber-900/50">
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
                  <td className="px-3 py-1.5">{err.field || '—'}</td>
                  <td className="px-3 py-1.5">{err.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700"
          onClick={handleClose}
          disabled={uploading}
        >
          Cerrar
        </button>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Importar jugadores
        </button>
      </div>
    </Modal>
  );
};

export default RosterImportModal;
