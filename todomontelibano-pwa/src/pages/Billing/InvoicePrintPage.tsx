import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../../lib/shopApi';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const InvoicePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['shop-order', id],
    queryFn: async () => {
      const { data } = await shopApi.getOrder(id!);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <p className="p-8 text-sm text-gray-500">Cargando factura…</p>;
  }
  if (isError || !order) {
    return (
      <div className="p-8">
        <p className="text-red-600">No se pudo cargar la factura.</p>
        <Link to="/facturas" className="text-violet-600 text-sm mt-2 inline-block">
          Volver
        </Link>
      </div>
    );
  }

  const invoice = order.invoice;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-16">
      <div className="print:hidden max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/facturas" className="inline-flex items-center text-sm text-gray-500">
          <ChevronLeft className="w-4 h-4" /> Volver a facturas
        </Link>
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Imprimir / guardar PDF
        </button>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-8">
        <header className="flex justify-between gap-6 border-b pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Chever</p>
            <h1 className="text-2xl font-extrabold mt-1">Factura de compra</h1>
            <p className="text-sm text-gray-500 mt-1">{invoice?.number || order.id}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">{invoice?.seller_name || order.store_name || 'Tienda Chever'}</p>
            <p>Método: {invoice?.payment_method || 'Mercado Pago'}</p>
            <p>{new Date(order.created_at).toLocaleString('es-CO')}</p>
            <p className="mt-1 font-bold">
              {order.status === 'approved' ? 'Pagada' : order.status === 'pending' ? 'Pendiente' : order.status}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Emisor / vendedor</p>
            <p className="font-bold mt-1">{invoice?.seller_name || order.store_name}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Receptor / cliente</p>
            <p className="font-bold mt-1">{invoice?.buyer_name || order.buyer_name}</p>
            <p>{invoice?.buyer_email || order.buyer_email}</p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-gray-50">
              <th className="text-left py-2 px-2">Producto</th>
              <th className="text-right py-2 px-2">Cant.</th>
              <th className="text-right py-2 px-2">Unitario</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-2">{item.product_name}</td>
                <td className="py-2 px-2 text-right">{item.quantity}</td>
                <td className="py-2 px-2 text-right">{formatCop(item.unit_price_cop)}</td>
                <td className="py-2 px-2 text-right font-bold">{formatCop(item.line_total_cop)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6 ml-auto max-w-xs text-sm space-y-1">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCop(order.subtotal_cop)}</span>
          </p>
          <p className="flex justify-between">
            <span>Descuento</span>
            <span>{formatCop(order.discount_cop)}</span>
          </p>
          <p className="flex justify-between text-lg font-extrabold pt-2 border-t">
            <span>Total</span>
            <span>{formatCop(order.total_cop)}</span>
          </p>
          {invoice && (
            <div className="pt-3 text-xs text-gray-500 space-y-0.5">
              <p>Comisión Mercado Pago: {formatCop(invoice.comision_mercado_pago)}</p>
              <p>IVA sobre comisión: {formatCop(invoice.iva_comision)}</p>
              <p>Neto recibido por el vendedor: {formatCop(invoice.monto_neto_recibido)}</p>
              {order.mp_payment_id && <p>ID transacción MP: {order.mp_payment_id}</p>}
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default InvoicePrintPage;
