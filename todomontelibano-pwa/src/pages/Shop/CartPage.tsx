import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { getMediaUrl } from '../../lib/api';
import { ROUTES } from '../../config/seo';

const formatCop = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const CartPage: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tu carrito está vacío</h1>
        <Link to={ROUTES.tienda} className="btn-primary mt-4 inline-flex">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="page-container py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Carrito</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="card-static flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={getMediaUrl(item.imageUrl)}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={ROUTES.tiendaProducto(item.slug)}
                    className="font-bold text-gray-900 dark:text-white hover:text-violet-600"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{formatCop(item.unitPrice)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto p-2 text-red-500"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-static h-fit">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Resumen</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">{formatCop(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">Los descuentos se aplican en el checkout.</p>
            <Link to={ROUTES.tiendaCheckout} className="btn-primary w-full justify-center">
              Ir a pagar
            </Link>
            <Link to={ROUTES.tienda} className="block text-center text-sm font-bold text-violet-600 mt-4">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
