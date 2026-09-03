import React from 'react';
import { Check, Loader2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useActivateSportsModule } from '../../hooks/usePayments';
import {
  CREDIT_COSTS,
  SPORTS_MODULE_COPY,
  hasActiveSportsModule,
} from '../../config/credits';
import { buildLoginUrl } from '../../lib/authRedirect';
import { ROUTES } from '../../config/seo';

const SportsModulePlanCard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const activate = useActivateSportsModule();
  const active = hasActiveSportsModule(user);
  const expires = user?.sports_module_expires_at
    ? new Date(user.sports_module_expires_at).toLocaleDateString('es-CO')
    : null;
  const credits = user?.credits ?? 0;
  const canPay =
    !!user?.is_unlimited_credits ||
    !!user?.is_superuser ||
    credits >= CREDIT_COSTS.sportsModule;

  const handleActivate = () => {
    if (!isAuthenticated) {
      navigate(buildLoginUrl(`${ROUTES.creditos}#sports-module`));
      return;
    }
    if (!canPay) {
      navigate(`${ROUTES.creditos}?needed=${CREDIT_COSTS.sportsModule}&reason=módulo%20deportivo`);
      return;
    }
    activate.mutate();
  };

  return (
    <article
      id="sports-module"
      className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-900 p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {SPORTS_MODULE_COPY.title}
            </h3>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {SPORTS_MODULE_COPY.priceLabel}
            </p>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {CREDIT_COSTS.sportsModule}
              <span className="text-base font-bold text-gray-500 dark:text-gray-400 ml-1">créditos</span>
            </p>
          </div>
        </div>
        {active && expires && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
            Activo hasta el {expires}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {SPORTS_MODULE_COPY.description}
      </p>

      <ul className="mt-5 space-y-2">
        {SPORTS_MODULE_COPY.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            {benefit}
          </li>
        ))}
      </ul>

      {activate.isError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {(activate.error as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || 'No se pudo activar la suscripción.'}
        </p>
      )}
      {activate.isSuccess && (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          {activate.data?.message || 'Suscripción actualizada.'}
        </p>
      )}

      <button
        type="button"
        onClick={handleActivate}
        disabled={activate.isPending}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
      >
        {activate.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando…
          </>
        ) : active ? (
          `Extender Suscripción +30 días (${CREDIT_COSTS.sportsModule} Créditos)`
        ) : (
          `Activar Módulo Deportivo (${CREDIT_COSTS.sportsModule} Créditos)`
        )}
      </button>
    </article>
  );
};

export default SportsModulePlanCard;
