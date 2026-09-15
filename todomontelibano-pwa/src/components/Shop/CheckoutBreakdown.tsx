import React from 'react';
import { Info } from 'lucide-react';

export interface CheckoutBreakdownValues {
  subtotal: number;
  discount?: number;
  shippingCost: number;
  paymentFee: number;
  feePercentage?: string;
  totalAmount: number;
  baseLabel?: string;
}

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const Row: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  emphasis?: boolean;
}> = ({ label, value, emphasis }) => (
  <div
    className={`flex items-start justify-between gap-3 ${
      emphasis
        ? 'text-lg font-black text-violet-700 dark:text-violet-300'
        : 'text-sm text-gray-700 dark:text-gray-300'
    }`}
  >
    <span className={emphasis ? '' : 'text-gray-600 dark:text-gray-400'}>{label}</span>
    <span className="text-right shrink-0">{value}</span>
  </div>
);

export const MpTransparencyBanner: React.FC<{
  baseAmount: number;
  feeAmount: number;
}> = ({ baseAmount, feeAmount }) => (
  <div className="flex items-start gap-2 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-3 text-sm text-violet-900 dark:text-violet-100 leading-snug">
    <span className="shrink-0" aria-hidden="true">
      💡
    </span>
    <p>
      <span className="font-extrabold">Transparencia Chéver:</span> El valor total incluye{' '}
      <strong>{formatCop(baseAmount)}</strong> por concepto del ítem +{' '}
      <strong>{formatCop(feeAmount)}</strong> de recargo por la operación con Mercado Pago.
    </p>
  </div>
);

const CheckoutBreakdown: React.FC<CheckoutBreakdownValues> = ({
  subtotal,
  discount = 0,
  shippingCost,
  paymentFee,
  feePercentage,
  totalAmount,
  baseLabel = 'Subtotal (ítem/créditos)',
}) => {
  const itemBase = Math.max(Number(subtotal || 0) - Number(discount || 0), 0);

  return (
    <div className="space-y-3">
      <MpTransparencyBanner baseAmount={itemBase} feeAmount={paymentFee} />
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4 space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">
          Resumen de compra
        </h2>
        <Row label={baseLabel} value={formatCop(subtotal)} />
        {discount > 0 && (
          <Row
            label="Descuento"
            value={<span className="text-emerald-700 dark:text-emerald-400">-{formatCop(discount)}</span>}
          />
        )}
        {shippingCost > 0 && (
          <Row label="Costo de envío" value={formatCop(shippingCost)} />
        )}
        <div className="space-y-1.5">
          <Row
            label="Costo de operación (Mercado Pago)"
            value={
              feePercentage
                ? `${formatCop(paymentFee)} (${feePercentage})`
                : formatCop(paymentFee)
            }
          />
          <p className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 leading-snug">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Este recargo cubre la tarifa de procesamiento de Mercado Pago sobre el pago electrónico.
            </span>
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <Row
            label="Total a pagar"
            value={`${formatCop(totalAmount)} COP`}
            emphasis
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutBreakdown;
