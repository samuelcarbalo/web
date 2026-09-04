import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Printer, Receipt } from 'lucide-react';
import { useMyShopOrders } from '../../hooks/useShop';
import type { ShopOrder } from '../../types/shop';
import { ROUTES } from '../../config/seo';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const paymentLabel = (order: ShopOrder) => {
  if (order.status === 'approved') return 'Completado';
  if (order.status === 'pending') return 'Pendiente';
  if (order.status === 'rejected') return 'Rechazado';
  if (order.status === 'cancelled') return 'Cancelado';
  return order.status;
};

const MyInvoicesPage: React.FC = () => {
  const { data: orders = [], isLoading } = useMyShopOrders(true);
  const [open, setOpen] = useState<ShopOrder | null>(null);

  const invoices = useMemo(
    () => orders.filter((o) => o.invoice || o.status !== 'cancelled'),
    [orders],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-16">
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-800 text-white">
        <div className="page-container py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-100">Compras</p>
          <h1 className="text-3xl font-extrabold mt-2 flex items-center gap-2">
            <Receipt className="w-8 h-8" /> Mis facturas de compra
          </h1>
          <p className="mt-2 text-violet-100 max-w-xl">
            Historial de facturas emitidas al comprar en la tienda Chever.
          </p>
        </div>
      </div>

      <div className="page-container mt-8">
        {isLoading && <p className="text-sm text-gray-500">Cargando facturas…</p>}
        {!isLoading && invoices.length === 0 && (
          <div className="card-static text-center py-14">
            <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="font-bold">Aún no tienes facturas</p>
            <Link to={ROUTES.tienda} className="btn-primary inline-flex mt-4">
              Ir a la tienda
            </Link>
          </div>
        )}

        {invoices.length > 0 && (
          <div className="overflow-x-auto card-static !p-0">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">N° factura</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Vendedor</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-bold">
                      {order.invoice?.number || order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">{order.store_name || order.invoice?.seller_name || 'Tienda Chever'}</td>
                    <td className="px-4 py-3 font-extrabold">{formatCop(order.total_cop)}</td>
                    <td className="px-4 py-3">{paymentLabel(order)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                          onClick={() => setOpen(order)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver detalle
                        </button>
                        <Link
                          to={`/facturas/${order.id}`}
                          className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Descargar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-extrabold mb-1">
              Factura {open.invoice?.number || open.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {open.invoice?.seller_name || open.store_name} · {open.invoice?.payment_method || 'Mercado Pago'}
            </p>
            <ul className="space-y-2 text-sm">
              {open.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="font-bold">{formatCop(item.line_total_cop)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t text-sm space-y-1">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCop(open.subtotal_cop)}</span>
              </p>
              {Number(open.discount_cop) > 0 && (
                <p className="flex justify-between text-emerald-700">
                  <span>Descuento</span>
                  <span>-{formatCop(open.discount_cop)}</span>
                </p>
              )}
              {Number(open.shipping_cop || 0) > 0 && (
                <p className="flex justify-between">
                  <span>Costo de envío</span>
                  <span>{formatCop(open.shipping_cop || 0)}</span>
                </p>
              )}
              {Number(open.payment_fee_cop || 0) > 0 && (
                <p className="flex justify-between">
                  <span>
                    Tarifa Mercado Pago
                    {open.fee_percentage ? ` (${open.fee_percentage})` : ''}
                  </span>
                  <span>+ {formatCop(open.payment_fee_cop || 0)}</span>
                </p>
              )}
              <p className="flex justify-between font-extrabold text-base pt-1">
                <span>Total</span>
                <span>{formatCop(open.total_cop)}</span>
              </p>
              {open.invoice && (
                <p className="text-xs text-gray-500 pt-2">
                  Comisión MP {formatCop(open.invoice.comision_mercado_pago)} · IVA comisión{' '}
                  {formatCop(open.invoice.iva_comision)} · Neto vendedor{' '}
                  {formatCop(open.invoice.monto_neto_recibido)}
                </p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(null)}>
                Cerrar
              </button>
              <Link to={`/facturas/${open.id}`} className="btn-primary">
                Imprimir / PDF
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvoicesPage;
