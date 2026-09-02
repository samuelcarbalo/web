import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import MercadoPagoCheckout from '../../components/Credits/MercadoPagoCheckout';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useShopCheckout } from '../../hooks/useShop';
import { useMpConfig } from '../../hooks/usePayments';
import { resolveMpInitPoint } from '../../lib/mpCheckout';
import { buildLoginUrl } from '../../lib/authRedirect';
import { ROUTES } from '../../config/seo';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const CheckoutPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());
  const checkout = useShopCheckout();
  const { data: mpConfig } = useMpConfig();
  const [discountCode, setDiscountCode] = useState('');
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <Navigate to={buildLoginUrl(ROUTES.tiendaCheckout)} replace />;
  }

  if (items.length === 0 && !preferenceId) {
    return <Navigate to={ROUTES.tiendaCarrito} replace />;
  }

  const handlePay = async () => {
    try {
      const { data } = await checkout.mutateAsync({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        discount_code: discountCode.trim() || undefined,
      });
      setPreferenceId(data.preference_id);
      setInitPoint(
        resolveMpInitPoint(
          data,
          data.is_production ?? mpConfig?.is_production ?? false,
        ),
      );
      setOrderTotal(Number(data.order.total_cop));
      clear();
    } catch {
      /* error shown below */
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="page-container py-10 max-w-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Checkout</h1>
        <div className="card-static space-y-4">
          {!preferenceId && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal carrito</span>
                <span className="font-bold">{formatCop(subtotal)}</span>
              </div>
              <div>
                <label className="auth-label" htmlFor="discount">
                  Cupón de descuento
                </label>
                <input
                  id="discount"
                  className="input-field"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="SAVE10"
                />
              </div>
              <button
                type="button"
                className="btn-primary w-full justify-center"
                disabled={checkout.isPending}
                onClick={handlePay}
              >
                {checkout.isPending ? 'Creando preferencia…' : 'Pagar con Mercado Pago'}
              </button>
              {checkout.isError && (
                <p className="text-sm text-red-600">
                  No se pudo iniciar el pago. Revisa stock, cupón o credenciales MP.
                </p>
              )}
            </>
          )}

          {preferenceId && (
            <>
              {orderTotal != null && (
                <p className="text-sm text-gray-600">
                  Total a pagar: <strong>{formatCop(orderTotal)}</strong>
                </p>
              )}
              <MercadoPagoCheckout preferenceId={preferenceId} initPoint={initPoint} />
            </>
          )}

          <div className="flex items-start gap-2 text-xs text-gray-500 pt-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Pago seguro con Mercado Pago. Al aprobarse, el pedido se confirma automáticamente.</p>
          </div>
          <Link to={ROUTES.tienda} className="block text-center text-sm font-bold text-violet-600">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
