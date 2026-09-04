import React from 'react';
import { Info } from 'lucide-react';

export interface CheckoutBreakdownValues {
  subtotal: number;
  discount?: number;
  shippingCost: number;
  paymentFee: number;
  feePercentage?: string;
  totalAmount: number;
}

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatSignedCop = (value: number) => `+ ${formatCop(value)}`;

const Row: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  emphasis?: boolean;
}> = ({ label, value, emphasis }) => (
  <div
    className={`flex items-start justify-between gap-3 text-sm ${
      emphasis ? 'text-base font-extrabold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
    }`}
  >
    <span className={emphasis ? '' : 'text-gray-600 dark:text-gray-400'}>{label}</span>
    <span className="text-right shrink-0">{value}</span>
  </div>
);

const CheckoutBreakdown: React.FC<CheckoutBreakdownValues> = ({
  subtotal,
  discount = 0,
  shippingCost,
  paymentFee,
  feePercentage,
  totalAmount,
}) => {
  const feeLabel = feePercentage
    ? `${formatSignedCop(paymentFee)} (${feePercentage} por pago electrónico)`
    : formatSignedCop(paymentFee);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4 space-y-3">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">
        Resumen de compra
      </h2>
      <Row label="Subtotal de Productos" value={formatCop(subtotal)} />
      {discount > 0 && (
        <Row
          label="Descuento"
          value={<span className="text-emerald-700 dark:text-emerald-400">-{formatCop(discount)}</span>}
        />
      )}
      {shippingCost > 0 && (
        <Row label="Costo de Envíos / Comisiones" value={formatCop(shippingCost)} />
      )}
      <div className="space-y-1.5">
        <Row
          label="Tarifa por Procesamiento / Transacción (Mercado Pago)"
          value={feeLabel}
        />
        <p className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-snug">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            El costo total incluye una tarifa de procesamiento de {formatSignedCop(paymentFee)}{' '}
            aplicada por el servicio de pasarela de pagos (Mercado Pago).
          </span>
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <Row label="Total Definitivo a Pagar" value={formatCop(totalAmount)} emphasis />
      </div>
    </div>
  );
};

export default CheckoutBreakdown;
