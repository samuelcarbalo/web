import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  CREDIT_COSTS,
  hasActiveSportsModule,
  sportsModuleDaysLeft,
} from '../../config/credits';
import { ROUTES } from '../../config/seo';

const SportsSubscriptionBanner: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.is_superuser || user.is_unlimited_credits || user.admin_level === 1) return null;

  const active = hasActiveSportsModule(user);
  const daysLeft = sportsModuleDaysLeft(user);
  const showExpired = !active;
  const showWarning = active && daysLeft !== null && daysLeft <= 5;
  if (!showExpired && !showWarning) return null;

  return (
    <div
      className={`mb-6 rounded-3xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
        showExpired
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <AlertTriangle
          className={`w-5 h-5 shrink-0 mt-0.5 ${
            showExpired ? 'text-red-600' : 'text-amber-600'
          }`}
        />
        <div>
          <p className="font-bold text-gray-900 dark:text-white">
            {showExpired
              ? 'Tu plan del Servicio de Torneos ha expirado'
              : `Tu suscripción vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {showExpired
              ? `Renueva por ${CREDIT_COSTS.sportsModule} créditos para seguir creando y administrando torneos, equipos y calendarios.`
              : `Extiende 30 días más por ${CREDIT_COSTS.sportsModule} créditos para no interrumpir la gestión.`}
          </p>
        </div>
      </div>
      <Link
        to={`${ROUTES.creditos}#sports-module`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shrink-0"
      >
        <Trophy className="w-4 h-4" />
        {showExpired ? 'Activar módulo' : 'Extender suscripción'}
      </Link>
    </div>
  );
};

export default SportsSubscriptionBanner;
