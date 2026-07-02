import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useRefreshCreditsAfterPayment } from '../../hooks/usePayments';
import { ROUTES_CREDITS } from '../../config/credits';

const PaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const status = params.get('status') || 'pending';
  const refreshCredits = useRefreshCreditsAfterPayment();

  useEffect(() => {
    if (status === 'success' || status === 'approved') {
      refreshCredits();
    }
  }, [status, refreshCredits]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      title: '¡Pago recibido!',
      message: 'Tus créditos se acreditarán en breve. Si no los ves, recarga la página en unos segundos.',
    },
    approved: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      title: '¡Pago aprobado!',
      message: 'Los créditos ya deberían estar disponibles en tu saldo.',
    },
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      title: 'Pago pendiente',
      message: 'Estamos esperando la confirmación de Mercado Pago.',
    },
    failure: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
      title: 'Pago no completado',
      message: 'El pago fue rechazado o cancelado. Puedes intentar de nuevo.',
    },
  }[status] || {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'Estado del pago',
    message: 'Consulta tu saldo en unos momentos.',
  };

  const Icon = config.icon;

  return (
    <div className="page-container page-section">
      <div className={`card-static max-w-md mx-auto text-center p-10 ${config.bg}`}>
        <Icon className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{config.title}</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{config.message}</p>
        <Link to={ROUTES_CREDITS.packages} className="btn-primary inline-flex items-center mt-8">
          Volver a créditos
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentResultPage;
