import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Tag, Timer } from 'lucide-react';
import { ROUTES } from '../../config/seo';
import { useShopCategories } from '../../hooks/useShop';

/**
 * Sub-navbar fijo (no colapsable) bajo el header principal.
 * Prioriza la Tienda Chéver y deja espacio para un logo exclusivo futuro.
 */
const StoreSubNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const { data } = useShopCategories();
  const categories = (data?.items ?? []).slice(0, 5);
  const onShop = pathname === ROUTES.tienda || pathname.startsWith(`${ROUTES.tienda}/`);

  return (
    <div
      className="sticky top-[4.5rem] md:top-20 z-40 border-b border-secondary-200/70 dark:border-secondary-900/50 bg-secondary-50/95 dark:bg-primary-950/95 backdrop-blur-md"
      role="navigation"
      aria-label="Navegación de Tienda Chéver"
    >
      <div className="page-container flex items-center gap-3 sm:gap-5 py-2.5 overflow-x-auto">
        <Link
          to={ROUTES.tienda}
          className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-3 py-1.5 text-sm font-bold transition-colors ${
            onShop
              ? 'bg-secondary-700 text-white'
              : 'bg-white dark:bg-primary-900 text-secondary-800 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-primary-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          <span className="whitespace-nowrap">Ir a la Tienda</span>
        </Link>

        {/* Espacio reservado para logo exclusivo de Tienda */}
        <div
          className="hidden sm:flex items-center justify-center shrink-0 min-w-[7.5rem] min-h-[2rem] px-3 rounded-xl border border-dashed border-secondary-300/80 dark:border-secondary-700/80 text-[10px] font-semibold uppercase tracking-wide text-secondary-600/70 dark:text-secondary-400/70"
          aria-hidden="true"
          title="Logo Tienda Chéver (próximamente)"
        >
          Logo Tienda
        </div>

        <div className="h-6 w-px bg-secondary-200 dark:bg-secondary-800 shrink-0 hidden md:block" />

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`${ROUTES.tienda}?category_id=${encodeURIComponent(cat.id)}&category=${encodeURIComponent(cat.slug)}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-primary-900 transition-colors"
            >
              <Tag className="w-3 h-3 text-secondary-600" aria-hidden="true" />
              {cat.name}
            </Link>
          ))}
          <Link
            to={`${ROUTES.tienda}?flash_sale=1`}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-accent-500/90 text-primary-950 hover:bg-accent-400 transition-colors"
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
