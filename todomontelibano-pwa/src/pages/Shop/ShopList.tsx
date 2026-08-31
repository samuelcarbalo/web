import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Filter, ChevronDown } from 'lucide-react';
import { useShopCategories, useShopProducts } from '../../hooks/useShop';
import { ROUTES, SITE_NAME } from '../../config/seo';
import ProductCard from '../../components/Shop/ProductCard';
import CatalogErrorState from '../../components/Shop/CatalogErrorState';
import JsonLd from '../../components/SEO/JsonLd';

const CategoryChipSkeleton: React.FC = () => (
  <div className="h-8 w-20 rounded-full bg-white/30 dark:bg-gray-800 animate-pulse" />
);

const ShopList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const categoryId = searchParams.get('category_id') || undefined;
  const categorySlug = searchParams.get('category') || undefined;
  const flashSale = searchParams.get('flash_sale') === '1';
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');

  const params = useMemo(
    () => ({
      category_id: categoryId,
      category: categoryId ? undefined : categorySlug,
      search: searchParams.get('search') || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      in_stock: true,
      flash_sale: flashSale || undefined,
      ordering: '-is_featured',
    }),
    [categoryId, categorySlug, searchParams, minPrice, maxPrice, flashSale],
  );

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useShopCategories();
  const { data, isLoading, isError, isFetching, refetch } = useShopProducts(params);
  const categories = categoriesData?.items ?? [];
  const products = data?.results ?? [];
  const catalogWarning = data?.warning || categoriesData?.warning;
  const catalogDegraded = Boolean(data?.degraded || categoriesData?.degraded);
  const catalogError = (isError || categoriesError) && !catalogDegraded;

  const retryCatalog = () => {
    void refetch();
    void refetchCategories();
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set('search', search.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  /** Filtra por category_id (UUID del backend); limpia slug legado. */
  const setCategory = (id?: string, slug?: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    if (id) {
      next.set('category_id', id);
      if (slug) next.set('category', slug);
    } else {
      next.delete('category_id');
    }
    setSearchParams(next);
  };

  const selectedAll = !categoryId && !categorySlug;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Tienda | ${SITE_NAME}`,
          description: 'Catálogo de productos locales en Córdoba. Compra con Mercado Pago.',
        }}
      />
      <div className="bg-gradient-to-r from-violet-600/90 via-indigo-600/90 to-indigo-700 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full backdrop-blur-md">
                E-commerce
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">Tienda</h1>
              <p className="mt-2 text-violet-100 text-base sm:text-lg max-w-2xl font-light">
                Explora el catálogo, filtra por categoría y compra con Mercado Pago. No necesitas
                cuenta para navegar.
              </p>
            </div>
            <Link
              to={ROUTES.tiendaCarrito}
              className="mt-6 md:mt-0 inline-flex items-center px-5 py-3 bg-white text-indigo-700 font-bold rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Ver carrito
            </Link>
          </div>

          <form onSubmit={applyFilters} className="mt-10 search-bar">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <button type="submit" className="btn-secondary py-3.5 px-6 text-sm">
                <Filter className="w-4 h-4 mr-2" />
                Buscar
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary py-3.5 px-6 text-sm md:hidden"
              >
                Categorías
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="page-container mt-10">
        <div
          className={`flex flex-wrap gap-2 mb-8 min-h-[2.25rem] ${showFilters ? '' : 'hidden md:flex'}`}
          role="tablist"
          aria-label="Categorías de la tienda"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedAll}
            onClick={() => setCategory(undefined)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
              selectedAll
                ? 'bg-violet-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Todas
          </button>

          {categoriesLoading &&
            [1, 2, 3, 4].map((i) => <CategoryChipSkeleton key={`sk-${i}`} />)}

          {!categoriesLoading &&
            categories.map((c) => {
              const active = categoryId === c.id || categorySlug === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c.id, c.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    active
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}

          {!categoriesLoading && categories.length === 0 && !categoriesError && (
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
              Sin categorías publicadas aún
            </span>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse h-72 rounded-3xl" />
            ))}
          </div>
        )}
        {!isLoading && (catalogError || catalogDegraded) && (
          <div className="mb-8">
            <CatalogErrorState
              message={catalogWarning || 'No se pudo cargar el catálogo en este momento'}
              onRetry={retryCatalog}
              isRetrying={isFetching}
            />
          </div>
        )}

        {!isLoading && !catalogError && !catalogDegraded && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !catalogError && !catalogDegraded && products.length === 0 && (
          <div className="text-center py-16 card-static max-w-xl mx-auto">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold">No hay productos con estos filtros</h3>
            <p className="text-gray-500 mt-2">Intenta ajustar la búsqueda o la categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;
