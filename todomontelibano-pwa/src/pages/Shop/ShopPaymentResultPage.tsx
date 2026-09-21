import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMyShopOrders, useShopOrder } from '../../hooks/useShop';
import { parseMpReturnParams, isTerminalPaymentStatus } from '../../lib/parseMpReturn';
import { ROUTES } from '../../config/seo';

const ShopPaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const parsed = parseMpReturnParams(params);
  const { data: orderById, isFetching: fetchingById } = useShopOrder(parsed.externalReference || null, {
    enabled: isAuthenticated && Boolean(parsed.externalReference),
    refetchInterval: (query) => {
      const row = query.state.data;
      if (!row || isTerminalPaymentStatus(row.status, row.fulfilled)) return false;
      return 2000;
    },
  });
  const shouldPollList = isAuthenticated && !parsed.externalReference;
  const { data: orders = [], isFetching: fetchingList } = useMyShopOrders(
    shouldPollList,
    shouldPollList ? 2000 : false,
  );

  const order = useMemo(() => {
    if (orderById) return orderById;
    return (
      orders.find((item) => parsed.preferenceId && item.mp_preference_id === parsed.preferenceId)
      || orders.find((item) => parsed.paymentId && item.mp_payment_id === parsed.paymentId)
      || orders[0]
    );
  }, [orderById, orders, parsed.preferenceId, parsed.paymentId]);

  const liveStatus = (order?.status || parsed.uiStatus).toLowerCase();
  const fulfilled = Boolean(order?.fulfilled);
  const screenStatus =
    fulfilled || liveStatus === 'approved' || parsed.uiStatus === 'success'
      ? 'success'
      : liveStatus === 'rejected' || liveStatus === 'cancelled' || liveStatus === 'refunded' || parsed.uiStatus === 'failure'
        ? 'failure'
        : 'pending';

  const config =
    screenStatus === 'success'
      ? {
          icon: CheckCircle2,
          title: '¡Pago aprobado!',
          text: fulfilled
            ? 'Tu pedido de la tienda fue confirmado. Recibirás actualizaciones en notificaciones.'
            : 'Pago recibido. Estamos confirmando el pedido con Mercado Pago.',
          color: 'text-emerald-600',
        }
      : screenStatus === 'failure'
        ? {
            icon: XCircle,
            title: 'Pago no completado',
            text: 'Puedes volver al carrito e intentar de nuevo.',
            color: 'text-red-600',
          }
        : {
            icon: Clock3,
            title: 'Pago pendiente',
            text: 'Mercado Pago aún está confirmando. Esta pantalla se actualiza sola.',
            color: 'text-amber-600',
          };

  const Icon = config.icon;
  const isFetching = fetchingById || fetchingList;
  const paymentId = order?.mp_payment_id || parsed.paymentId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="card-static max-w-md w-full text-center">
        {screenStatus === 'pending' && isFetching ? (
          <Loader2 className={`w-14 h-14 mx-auto animate-spin ${config.color}`} />
        ) : (
          <Icon className={`w-14 h-14 mx-auto ${config.color}`} />
        )}
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-4">{config.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3">{config.text}</p>
        {paymentId && (
          <p className="mt-4 font-mono text-xs text-gray-500 break-all">ID de pago: {paymentId}</p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Link to={ROUTES.tienda} className="btn-primary justify-center">
            Seguir comprando
          </Link>
          <Link to={ROUTES.tiendaPedidos} className="text-sm font-bold text-violet-600">
            Ver mis pedidos
          </Link>
          <Link to="/dashboard" className="text-sm font-bold text-gray-500">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopPaymentResultPage;
