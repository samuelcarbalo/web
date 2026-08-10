import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useShopCategories, useShopProducts } from '../../hooks/useShop';
import { getMediaUrl } from '../../lib/api';
import { ROUTES } from '../../config/seo';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ShopList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const category = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');

  const params = useMemo(
    () => ({
      category,
      search: searchParams.get('search') || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      in_stock: true,
      ordering: '-is_featured',
    }),
    [category, searchParams, minPrice, maxPrice],
  );

  const { data: categories = [] } = useShopCategories();
  const { data, isLoading, isError } = useShopProducts(params);
  const products = data?.results ?? [];

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set('search', search.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const setCategory = (slug?: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 text-white">
        <div className="page-container py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-200 mb-2">Tienda</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Catálogo CAPISJ DIGITAL</h1>
              <p className="mt-3 text-violet-100 max-w-xl">
                Explora productos locales, filtra por categoría y compra con Mercado Pago.
              </p>
            </div>
            <Link to={ROUTES.tiendaCarrito} className="btn-primary bg-white text-indigo-800 hover:bg-violet-50">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver carrito
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container -mt-6 relative z-10">
        <form onSubmit={applyFilters} className="card-static mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar productos..."
            />
          </div>
          <button type="submit" className="btn-primary">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              !category
                ? 'bg-violet-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                category === c.slug
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-gray-500">Cargando catálogo…</p>}
        {isError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            No se pudo cargar el catálogo. Verifica que el backend tenga el módulo ecommerce desplegado.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={ROUTES.tiendaProducto(product.slug)}
              className="card-static hover-lift overflow-hidden group"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-2xl mb-4">
                {product.image_url ? (
                  <img
                    src={getMediaUrl(product.image_url)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">
                {product.category_name || 'General'}
              </p>
              <h2 className="font-bold text-gray-900 dark:text-white mt-1">{product.name}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {product.short_description || product.description}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {formatCop(product.price_cop)}
                </span>
                {product.compare_at_price_cop &&
                  Number(product.compare_at_price_cop) > Number(product.price_cop) && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCop(product.compare_at_price_cop)}
                    </span>
                  )}
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && products.length === 0 && (
          <p className="text-center text-gray-500 py-16">No hay productos con estos filtros.</p>
        )}
      </div>
    </div>
  );
};

export default ShopList;
