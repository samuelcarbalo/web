import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Timer, Zap } from 'lucide-react';
import { getMediaUrl } from '../../lib/api';
import { ROUTES } from '../../config/seo';
import { canManageProduct } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/authStore';
import type { ShopProduct } from '../../types/shop';
import FlashSaleCountdown from './FlashSaleCountdown';
import ProductManageActions from './ProductManageActions';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

type Props = {
  product: ShopProduct;
  canManage?: boolean;
};

const ProductCard: React.FC<Props> = ({ product, canManage }) => {
  const user = useAuthStore((s) => s.user);
  const flash = product.active_discount;
  const hasDiscount =
    (!!product.compare_at_price_cop &&
      Number(product.compare_at_price_cop) > Number(product.price_cop)) ||
    !!flash;
  const outOfStock = Number(product.stock) < 1;
  const pct =
    flash?.discount_percentage != null
      ? Math.round(Number(flash.discount_percentage))
      : hasDiscount && product.compare_at_price_cop
        ? Math.round(
            (1 - Number(product.price_cop) / Number(product.compare_at_price_cop)) * 100,
          )
        : null;
  const showManage = canManage ?? canManageProduct(user, product);

  return (
    <article className="group card-static hover:shadow-2xl hover:scale-[1.02] transition-all !p-0 relative overflow-visible">
      <Link to={ROUTES.tiendaProducto(product.slug)} className="block">
        <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-t-3xl">
          {product.image_url ? (
            <img
              src={getMediaUrl(product.image_url)}
              alt={product.name}
              width={640}
              height={400}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {flash?.is_flash_sale && (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Flash Sale
              </span>
            )}
            {flash && !flash.is_flash_sale && (
              <span className="px-2.5 py-1 text-xs font-bold bg-orange-500 text-white rounded-full">
                Oferta por tiempo limitado
              </span>
            )}
            {product.is_featured && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Destacado
              </span>
            )}
            <span className="px-2.5 py-1 text-xs font-bold bg-white/90 dark:bg-gray-900/90 rounded-full">
              {product.subcategory_name || product.category_name || 'General'}
            </span>
          </div>
          {pct != null && pct > 0 && (
            <span className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-extrabold bg-secondary-700 text-white rounded-full">
              -{pct}%
            </span>
          )}
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
            {product.short_description || product.description || 'Producto disponible en Chever.'}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {formatCop(product.price_cop)}
            </span>
            {hasDiscount && product.compare_at_price_cop && (
              <span className="text-sm text-gray-400 line-through">
                {formatCop(product.compare_at_price_cop)}
              </span>
            )}
          </div>
          {flash?.end_time && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Timer className="w-3.5 h-3.5" aria-hidden="true" />
              Termina en <FlashSaleCountdown endTime={flash.end_time} />
            </div>
          )}
        </div>
      </Link>
      {showManage && (
        <div
          className="absolute top-3 right-3 z-50 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ProductManageActions product={product} canManage={showManage} />
        </div>
      )}
    </article>
  );
};

export default ProductCard;
