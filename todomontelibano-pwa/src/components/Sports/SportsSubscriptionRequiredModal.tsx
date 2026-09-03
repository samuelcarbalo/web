import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, X } from 'lucide-react';
import { SPORTS_SUBSCRIPTION_REQUIRED } from '../../lib/sportsSubscriptionEvents';
import { CREDIT_COSTS } from '../../config/credits';
import { ROUTES } from '../../config/seo';

const SportsSubscriptionRequiredModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onRequired = () => setOpen(true);
    window.addEventListener(SPORTS_SUBSCRIPTION_REQUIRED, onRequired);
    return () => window.removeEventListener(SPORTS_SUBSCRIPTION_REQUIRED, onRequired);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Suscripción requerida
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Tu plan del Servicio de Torneos no está activo. Renueva por{' '}
          <strong>{CREDIT_COSTS.sportsModule} créditos</strong> para seguir administrando
          torneos, equipos y calendarios. Tus datos creados se conservan.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600 text-sm font-semibold"
          >
            Más tarde
          </button>
          <Link
            to={`${ROUTES.creditos}#sports-module`}
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold text-center"
          >
            Renovar ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SportsSubscriptionRequiredModal;
