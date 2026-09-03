import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader2, Trophy, X } from 'lucide-react';

interface DeleteTournamentModalProps {
  isOpen: boolean;
  tournamentName: string;
  /** true si el torneo tiene partidos/estadísticas ya registradas (requiere confirmación extra) */
  hasData?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_WORD = 'ELIMINAR';

const DeleteTournamentModal: React.FC<DeleteTournamentModalProps> = ({
  isOpen,
  tournamentName,
  hasData = false,
  isPending = false,
  onConfirm,
  onCancel,
}) => {
  const [confirmText, setConfirmText] = useState('');

  // Resetear campo al abrir/cerrar
  useEffect(() => {
    if (!isOpen) setConfirmText('');
  }, [isOpen]);

  // Cerrar con Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onCancel();
    },
    [isPending, onCancel],
  );

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const confirmOk = !hasData || confirmText.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={isPending ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con tono de peligro */}
        <div className="px-6 pt-6 pb-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-lg font-bold text-gray-900 dark:text-white leading-tight"
                >
                  ¿Eliminar torneo definitivamente?
                </h2>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            {!isPending && (
              <button
                onClick={onCancel}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Se borrarán de forma permanente los partidos programados, estadísticas, tablas
            de posiciones y registros de todos los equipos inscritos en{' '}
            <strong className="text-gray-900 dark:text-white">"{tournamentName}"</strong>.
          </p>

          {/* Campo de confirmación (solo si el torneo tiene datos) */}
          {hasData && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Escribe{' '}
                <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-md">
                  {CONFIRM_WORD}
                </span>{' '}
                para confirmar:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isPending}
                placeholder={CONFIRM_WORD}
                autoFocus
                className="w-full px-4 py-2.5 text-sm border rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono tracking-wider"
                aria-label={`Escribe ${CONFIRM_WORD} para confirmar`}
              />
              {confirmText.length > 0 && !confirmOk && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  Escribe exactamente "{CONFIRM_WORD}" (en mayúsculas)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Conservar torneo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmOk || isPending}
            className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-red-500/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando…
              </>
            ) : (
              'Sí, eliminar torneo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTournamentModal;
