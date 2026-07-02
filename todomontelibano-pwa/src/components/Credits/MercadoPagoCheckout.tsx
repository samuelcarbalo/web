import React, { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import { useMpConfig } from '../../hooks/usePayments';

interface MercadoPagoCheckoutProps {
  preferenceId: string | null;
  isLoading?: boolean;
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  preferenceId,
  isLoading = false,
}) => {
  const { data: mpConfig } = useMpConfig();
  const [mpReady, setMpReady] = useState(false);

  useEffect(() => {
    const publicKey = mpConfig?.public_key || import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-CO' });
      setMpReady(true);
    } else {
      setMpReady(false);
    }
  }, [mpConfig?.public_key]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Preparando checkout...</span>
      </div>
    );
  }

  if (!preferenceId) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Selecciona un paquete para continuar con el pago.
      </p>
    );
  }

  if (!mpReady) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-100">
        <p className="font-semibold mb-1">Configuración pendiente</p>
        <p>
          Agrega <code className="text-xs bg-white/50 dark:bg-black/20 px-1 rounded">VITE_MERCADOPAGO_PUBLIC_KEY</code>{' '}
          en tu archivo <code className="text-xs">.env</code> cuando recibas las credenciales de prueba.
        </p>
        <p className="mt-2 text-xs opacity-80">Preference ID generado: {preferenceId}</p>
      </div>
    );
  }

  return (
    <div className="mp-checkout-container w-full min-h-[48px]">
      {/* Wallet de MP muestra el logo oficial en primera posición (requisito de contrato) */}
      <Wallet initialization={{ preferenceId }} />
    </div>
  );
};

export default MercadoPagoCheckout;
