import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Tag, Timer } from 'lucide-react';
import { ROUTES } from '../../config/seo';
import { getMediaUrl } from '../../lib/api';
import { useShopCategories, useShopSettings } from '../../hooks/useShop';

/**
 * Sub-navbar fijo (no colapsable) bajo el header principal.
 * El logo se consulta de la configuración de tienda; la edición vive solo en Admin.
 */
const StoreSubNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const { data } = useShopCategories();
  const { data: settingsData } = useShopSettings();
  const categories = (data?.items ?? []).slice(0, 5);
  const onShop = pathname === ROUTES.tienda || pathname.startsWith(`${ROUTES.tienda}/`);
  const logoUrl = getMediaUrl(settingsData?.settings.store_logo);
  const quietLink =
    'inline-flex items-center gap-1.5 shrink-0 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-300';

  return (
    <div
      className={`sticky top-[4.5rem] md:top-20 z-30 border-b backdrop-blur-md ${
        onShop
          ? 'border-secondary-200/70 dark:border-secondary-900/50 bg-secondary-50/95 dark:bg-primary-950/95'
          : 'border-gray-200/70 dark:border-gray-800/80 bg-white/75 dark:bg-gray-950/75'
      }`}
      role="navigation"
      aria-label="Navegación de Tienda Chéver"
    >
      <div className="page-container flex items-center gap-3 sm:gap-5 py-2 overflow-x-auto">
        <Link
          to={ROUTES.tienda}
          className={
            onShop
              ? 'inline-flex items-center gap-1.5 shrink-0 rounded-full border border-secondary-700 bg-secondary-700 px-3 py-1.5 text-sm font-medium text-white'
              : quietLink
          }
        >
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          <span className="whitespace-nowrap">Ir a la Tienda</span>
        </Link>

        <div
          className="hidden sm:flex items-center justify-center shrink-0 min-w-[7.5rem] min-h-[2rem] px-3 rounded-full border border-dashed border-gray-200 dark:border-gray-700 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
          title={logoUrl ? 'Logo de la tienda' : 'Logo Tienda Chéver'}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de la tienda"
              className="h-7 w-auto max-w-[7.5rem] object-contain"
            />
          ) : (
            <span aria-hidden="true">Logo Tienda</span>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 shrink-0 hidden md:block" />

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`${ROUTES.tienda}?category_id=${encodeURIComponent(cat.id)}&category=${encodeURIComponent(cat.slug)}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-200 hover:bg-white dark:hover:bg-gray-900 transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              {cat.name}
            </Link>
          ))}
          <Link
            to={`${ROUTES.tienda}?flash_sale=1`}
            className={
              onShop
                ? 'shrink-0 inline-flex items-center gap-1.5 rounded-full border border-accent-500 bg-accent-500/90 px-3 py-1.5 text-sm font-medium text-primary-950 hover:bg-accent-400 transition-colors'
                : 'shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 dark:border-amber-900/60 bg-white/80 dark:bg-gray-900/50 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors'
            }
          >
            <Timer className="w-3.5 h-3.5" aria-hidden="true" />
            Ofertas por Tiempo Limitado
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreSubNavbar;
