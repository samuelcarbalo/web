import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { useMyShopOrders } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  approved: 'Aprobado',
  fulfilled: 'Entregado',
  cancelled: 'Cancelado',
  failed: 'Fallido',
};

const MyOrdersPage: React.FC = () => {
  const { data: orders = [], isLoading, isError } = useMyShopOrders(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <div className="bg-gradient-to-r from-violet-600/90 via-indigo-600/90 to-indigo-700 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full backdrop-blur-md">
            Tienda
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">Mis pedidos</h1>
          <p className="mt-2 text-violet-100 max-w-xl font-light">
            Historial de compras realizadas en el catálogo Chever.
          </p>
        </div>
      </div>

      <div className="page-container mt-10">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse h-24 rounded-3xl" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            No se pudieron cargar tus pedidos. Intenta de nuevo más tarde.
          </p>
        )}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-16 card-static max-w-xl mx-auto">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold">Aún no tienes pedidos</h3>
            <p className="text-gray-500 mt-2">Explora el catálogo y realiza tu primera compra.</p>
            <Link to={ROUTES.tienda} className="btn-primary inline-flex mt-6">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ir a la tienda
            </Link>
          </div>
        )}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-static">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                    {statusLabel[order.status] || order.status}
                    {order.fulfilled ? ' · Entregado' : ''}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-1">
                    Pedido {order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString('es-CO')}
                  </p>
                </div>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {formatCop(order.total_cop)}
                </p>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.product_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
