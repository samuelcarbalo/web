import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  durationMs?: number;
  variant?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  durationMs = 4000,
  variant = 'success',
}) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose, message]);

  const isSuccess = variant === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[100] flex w-[min(92vw,24rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
          : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : null}
      <p className="flex-1 text-sm font-semibold">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 opacity-70 transition hover:opacity-100"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
