import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import Modal from '../UI/Modal';
import { useReportPublication } from '../../hooks/usePayments';
import { useAuthStore } from '../../store/authStore';

const REASONS = [
  { value: 'fraude', label: 'Fraude' },
  { value: 'contenido_inapropiado', label: 'Contenido Inapropiado' },
  { value: 'discriminacion', label: 'Discriminación' },
] as const;

interface ReportPublicationButtonProps {
  contentType: 'job' | 'real_estate' | 'tournament' | 'event';
  objectId: string;
  className?: string;
}

const ReportPublicationButton: React.FC<ReportPublicationButtonProps> = ({
  contentType,
  objectId,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore();
  const reportMutation = useReportPublication();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]['value']>('fraude');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportMutation.mutateAsync({
      content_type: contentType,
      object_id: objectId,
      reason,
      description,
    });
    setDone(true);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className={`inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg px-2 py-1 ${className}`}
        aria-label="Reportar publicación"
      >
        <Flag className="w-4 h-4" />
        Reportar
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Reportar publicación">
        {done ? (
          <div className="text-center py-4">
            <p className="font-semibold text-gray-900 dark:text-white">Reporte enviado</p>
            <p className="text-sm text-gray-500 mt-2">
              Gracias por ayudarnos a mantener la plataforma segura. Revisaremos el contenido.
            </p>
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecciona el motivo del reporte. Con 3 reportes la publicación se ocultará automáticamente
              para revisión.
            </p>
            <fieldset className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="text-violet-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{r.label}</span>
                </label>
              ))}
            </fieldset>
            <div>
              <label htmlFor="report-desc" className="auth-label">
                Detalle (opcional)
              </label>
              <textarea
                id="report-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="auth-input w-full"
                placeholder="Describe brevemente el problema..."
              />
            </div>
            {reportMutation.isError && (
              <p className="text-sm text-red-600">
                {(reportMutation.error as { response?: { data?: { detail?: string } } })?.response?.data
                  ?.detail || 'Error al enviar el reporte.'}
              </p>
            )}
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="btn-primary w-full"
            >
              {reportMutation.isPending ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
};

export default ReportPublicationButton;
