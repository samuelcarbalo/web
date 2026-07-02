import React from 'react';
import { Clock, Megaphone, Sparkles } from 'lucide-react';
import type { SponsorshipAvailability } from '../../lib/advertisingApi';

interface Props {
  availability?: SponsorshipAvailability;
  onPurchaseClick?: () => void;
  showPurchaseButton?: boolean;
}

const SponsorshipAvailabilityBanner: React.FC<Props> = ({
  availability,
  onPurchaseClick,
  showPurchaseButton = true,
}) => {
  if (!availability) return null;

  if (!availability.available && availability.active_sponsorship) {
    const sp = availability.active_sponsorship;
    return (
      <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-800/50 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {sp.image && (
            <img
              src={sp.image}
              alt={sp.title}
              className="w-full sm:w-28 h-16 object-cover rounded-2xl border border-amber-200/60"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">
              <Megaphone className="w-3.5 h-3.5" />
              Patrocinador exclusivo — {sp.plan_label}
            </div>
            <p className="font-bold text-gray-900 dark:text-white truncate">{sp.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              Quedan <strong>{sp.days_remaining}</strong> día(s) de exclusividad
              (hasta {new Date(sp.end_date).toLocaleDateString('es-CO')})
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/90 mt-2">
              Cuando expire, podrás ser el siguiente patrocinador de todo el torneo.
            </p>
          </div>
          {showPurchaseButton && onPurchaseClick && (
            <button
              type="button"
              onClick={onPurchaseClick}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Reservar turno
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Este torneo no tiene patrocinador
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            No hay publicidad activa en este torneo. Puedes ser el patrocinador exclusivo:
            tabla, partidos, estadísticas y más.
          </p>
        </div>
        {showPurchaseButton && onPurchaseClick && (
          <button
            type="button"
            onClick={onPurchaseClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Comprar patrocinio
          </button>
        )}
      </div>
    </div>
  );
};

export default SponsorshipAvailabilityBanner;
