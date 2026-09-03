import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, Receipt, TrendingUp, Users } from 'lucide-react';
import { useShopSales, useShopSalesMetrics, useUpdateDelivery } from '../../hooks/useShop';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const DELIVERY_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'En preparación' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const StoreBillingPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [delivery, setDelivery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filters = {
    search: search.trim() || undefined,
    status: status || undefined,
    delivery_status: delivery || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };
  const { data: metrics } = useShopSalesMetrics({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });
  const { data: sales, isLoading } = useShopSales(filters);
  const updateDelivery = useUpdateDelivery();
  const orders = sales?.results ?? [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-16">
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-900 text-white">
        <div className="page-container py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-100">Tienda</p>
          <h1 className="text-3xl font-extrabold mt-2 flex items-center gap-2">
            <Receipt className="w-8 h-8" /> Facturación y ventas
          </h1>
          <p className="mt-2 text-indigo-100 max-w-2xl">
            Compras recibidas de tus productos, métricas comerciales y facturas asociadas.
          </p>
        </div>
      </div>

      <div className="page-container mt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-static">
            <p className="text-xs font-bold uppercase text-gray-500">Ventas acumuladas</p>
            <p className="text-2xl font-extrabold mt-1">{formatCop(metrics?.total_sales_cop ?? 0)}</p>
          </div>
          <div className="card-static">
            <p className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Pedidos pagados
            </p>
            <p className="text-2xl font-extrabold mt-1">{metrics?.order_count ?? 0}</p>
          </div>
          <div className="card-static">
            <p className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Ticket promedio
            </p>
            <p className="text-2xl font-extrabold mt-1">{formatCop(metrics?.avg_ticket_cop ?? 0)}</p>
          </div>
          <div className="card-static">
            <p className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Top sellers
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {(metrics?.top_sellers ?? []).slice(0, 3).map((item) => (
                <li key={item.product_name} className="flex justify-between gap-2">
                  <span className="truncate">{item.product_name}</span>
                  <span className="font-bold shrink-0">×{item.quantity}</span>
                </li>
              ))}
              {!(metrics?.top_sellers ?? []).length && (
                <li className="text-gray-400">Sin ventas aún</li>
              )}
            </ul>
          </div>
        </div>

        <form
          className="card-static grid grid-cols-1 md:grid-cols-5 gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="input-field md:col-span-2"
            placeholder="Cliente, factura o producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Pago: todos</option>
            <option value="approved">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="rejected">Rechazado</option>
          </select>
          <select className="input-field" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
            <option value="">Envío: todos</option>
            {DELIVERY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="date" className="input-field" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input type="date" className="input-field" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </form>

        <div className="overflow-x-auto card-static !p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">ID pedido</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Productos</th>
                <th className="px-4 py-3 text-left">Monto</th>
                <th className="px-4 py-3 text-left">Envío</th>
                <th className="px-4 py-3 text-left">Factura</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-gray-500">
                    Cargando ventas…
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-gray-500">
                    No hay compras recibidas con estos filtros.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 dark:border-gray-800 align-top">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{order.buyer_name}</p>
                    <p className="text-xs text-gray-500">{order.buyer_email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {order.items.map((item) => `${item.product_name} ×${item.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-extrabold">{formatCop(order.total_cop)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field text-xs py-1"
                      value={order.delivery_status || 'pending'}
                      onChange={(e) =>
                        updateDelivery.mutate({ id: order.id, delivery_status: e.target.value })
                      }
                    >
                      {DELIVERY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/facturas/${order.id}`} className="text-violet-600 font-bold text-xs">
                      {order.invoice_number || 'Ver'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5" /> Las métricas consideran pedidos con pago aprobado.
        </p>
      </div>
    </div>
  );
};

export default StoreBillingPage;
