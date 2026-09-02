import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { parseApiErrorMessage } from '../../lib/apiErrors';
import { useDelayedLoadingHint } from '../../hooks/useDelayedLoadingHint';

type AuthSubmitVariant = 'login' | 'register';

const LOADING_COPY: Record<AuthSubmitVariant, string> = {
  login: 'Iniciando sesión... Un momento por favor 🚀',
  register: 'Creando tu cuenta... Estamos preparando todo para ti ✨',
};

const SLOW_HINT = 'Conectando de forma segura con Chéver...';

interface AuthSubmitStatusProps {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  variant: AuthSubmitVariant;
  fallbackError: string;
}

const AuthSubmitStatus: React.FC<AuthSubmitStatusProps> = ({
  isPending,
  isError,
  error,
  variant,
  fallbackError,
}) => {
  const showSlowHint = useDelayedLoadingHint(isPending);

  if (isPending) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-4 space-y-2 text-center animate-in fade-in duration-300"
      >
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{LOADING_COPY[variant]}</span>
        </p>
        {showSlowHint && (
          <p className="text-xs text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-1 duration-500">
            {SLOW_HINT}
          </p>
        )}
      </div>
    );
  }

  if (!isError) return null;

  const message = parseApiErrorMessage(error, fallbackError);

  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 animate-in fade-in duration-300"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

export default AuthSubmitStatus;
