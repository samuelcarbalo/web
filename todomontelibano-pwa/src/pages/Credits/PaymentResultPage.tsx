import React, { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { usePaymentStatus, useRefreshCreditsAfterPayment } from '../../hooks/usePayments';
import { useAuthStore } from '../../store/authStore';
import { parseMpReturnParams } from '../../lib/parseMpReturn';
import { ROUTES_CREDITS } from '../../config/credits';
import { ROUTES } from '../../config/seo';

const PaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const parsed = parseMpReturnParams(params, location.pathname);
  const refreshCredits = useRefreshCreditsAfterPayment();
  const { data: order, isFetching } = usePaymentStatus(
    {
      orderId: parsed.externalReference,
      preferenceId: parsed.preferenceId,
      paymentId: parsed.paymentId,
    },
    isAuthenticated,
  );

  const applied = Boolean(order?.credits_applied);
  const liveStatus = (order?.status || parsed.uiStatus).toLowerCase();
  const screenStatus =
    applied || liveStatus === 'approved' || parsed.uiStatus === 'success'
      ? 'success'
      : liveStatus === 'rejected' || liveStatus === 'cancelled' || liveStatus === 'refunded' || parsed.uiStatus === 'failure'
        ? 'failure'
        : 'pending';

  useEffect(() => {
    if (screenStatus === 'success' || applied) {
      refreshCredits();
    }
  }, [screenStatus, applied, refreshCredits, order?.updated_at]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      title: applied ? '¡Pago aprobado!' : '¡Pago recibido!',
      message: applied
        ? `Se acreditaron ${order?.credits_amount ?? ''} créditos en tu cuenta.`
        : 'Tus créditos se acreditarán en breve. Estamos confirmando con Mercado Pago.',
    },
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      title: 'Pago pendiente',
      message: 'Estamos esperando la confirmación de Mercado Pago. Esta pantalla se actualiza sola.',
    },
    failure: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
      title: 'Pago no completado',
      message: 'El pago fue rechazado o cancelado. Puedes intentar de nuevo.',
    },
  }[screenStatus];

  const Icon = config.icon;
  const paymentId = order?.mp_payment_id || parsed.paymentId;
  const amount = order?.amount_cop;

  return (
    <div className="page-container page-section">
      <div className={`card-static max-w-md mx-auto text-center p-10 ${config.bg}`}>
        {screenStatus === 'pending' && isFetching ? (
          <Loader2 className={`w-16 h-16 mx-auto mb-4 animate-spin ${config.color}`} />
        ) : (
          <Icon className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
        )}
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{config.title}</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{config.message}</p>
        {typeof user?.credits === 'number' && screenStatus === 'success' && (
          <p className="mt-2 text-sm font-bold text-violet-700 dark:text-violet-300">
            Saldo actual: {user.credits} créditos
          </p>
        )}
        {(paymentId || amount != null) && (
          <dl className="mt-5 text-left text-sm space-y-1.5 rounded-2xl bg-white/70 dark:bg-gray-900/40 px-4 py-3">
            {amount != null && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Monto</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  }).format(Number(amount))}
                </dd>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">ID de pago</dt>
                <dd className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">{paymentId}</dd>
              </div>
            )}
          </dl>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Link to={ROUTES_CREDITS.packages} className="btn-primary inline-flex items-center justify-center">
            Volver a créditos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to={`${ROUTES.creditos}?tab=historial`} className="text-sm font-bold text-violet-600">
            Ver historial de compras
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
