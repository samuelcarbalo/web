import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Coins } from 'lucide-react';
import { ROUTES_CREDITS } from '../../config/credits';

interface InsufficientCreditsAlertProps {
  required: number;
  available: number;
  actionLabel: string;
}

const InsufficientCreditsAlert: React.FC<InsufficientCreditsAlertProps> = ({
  required,
  available,
  actionLabel,
}) => {
  const hasEnough = available >= required;

  return (
    <div
      className={`p-4 rounded-3xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        hasEnough
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
      }`}
      role="status"
    >
      <div className="flex items-center gap-3">
        {hasEnough ? (
          <Coins className="w-6 h-6 shrink-0" aria-hidden />
        ) : (
          <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden />
        )}
        <div>
          <p className="font-semibold text-sm sm:text-base">
            Costo de {actionLabel}: {required} créditos
          </p>
          <p className="text-xs sm:text-sm">
            Saldo disponible: <strong>{available}</strong> créditos
            {!hasEnough && (
              <span className="block mt-1 text-red-700 dark:text-red-300">
                Necesitas {required - available} créditos adicionales.
              </span>
            )}
          </p>
        </div>
      </div>
      {!hasEnough && (
        <Link
          to={ROUTES_CREDITS.packages}
          className="btn-primary whitespace-nowrap text-center text-sm"
        >
          Comprar créditos
        </Link>
      )}
    </div>
  );
};

export default InsufficientCreditsAlert;
