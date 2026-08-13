import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { getMediaUrl } from '../../lib/api';
import { ROUTES } from '../../config/seo';
import type { ShopProduct } from '../../types/shop';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

type Props = {
  product: ShopProduct;
};

const ProductCard: React.FC<Props> = ({ product }) => {
  const hasDiscount =
    !!product.compare_at_price_cop &&
    Number(product.compare_at_price_cop) > Number(product.price_cop);
  const outOfStock = Number(product.stock) < 1;

  return (
    <Link
      to={ROUTES.tiendaProducto(product.slug)}
      className="group card-static overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all !p-0"
    >
      <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={getMediaUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Destacado
          </span>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold bg-white/90 dark:bg-gray-900/90 rounded-full">
          {product.category_name || 'General'}
        </span>
        {outOfStock && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-bold bg-gray-900/80 text-white rounded-full">
            Agotado
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[2.5rem]">
          {product.short_description || product.description || 'Producto disponible en CAPISJ DIGITAL.'}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {formatCop(product.price_cop)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatCop(product.compare_at_price_cop!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
