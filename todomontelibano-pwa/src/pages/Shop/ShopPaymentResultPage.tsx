import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { ROUTES } from '../../config/seo';

const ShopPaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const status = params.get('status') || 'pending';

  useEffect(() => {
    // Placeholder for future order polling
  }, [status]);

  const config =
    status === 'success'
      ? {
          icon: CheckCircle2,
          title: '¡Pago aprobado!',
          text: 'Tu pedido de la tienda fue confirmado. Recibirás actualizaciones en notificaciones.',
          color: 'text-emerald-600',
        }
      : status === 'failure'
        ? {
            icon: XCircle,
            title: 'Pago no completado',
            text: 'Puedes volver al carrito e intentar de nuevo.',
            color: 'text-red-600',
          }
        : {
            icon: Clock3,
            title: 'Pago pendiente',
            text: 'Mercado Pago aún está confirmando. Te avisaremos cuando se acredite.',
            color: 'text-amber-600',
          };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="card-static max-w-md w-full text-center">
        <Icon className={`w-14 h-14 mx-auto ${config.color}`} />
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-4">{config.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3">{config.text}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to={ROUTES.tienda} className="btn-primary justify-center">
            Seguir comprando
          </Link>
          <Link to="/dashboard" className="text-sm font-bold text-violet-600">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopPaymentResultPage;
