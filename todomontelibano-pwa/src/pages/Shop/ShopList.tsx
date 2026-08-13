import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Filter, ChevronDown } from 'lucide-react';
import { useShopCategories, useShopProducts } from '../../hooks/useShop';
import { ROUTES, SITE_NAME } from '../../config/seo';
import ProductCard from '../../components/Shop/ProductCard';
import JsonLd from '../../components/SEO/JsonLd';

const ShopList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
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
        <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? '' : 'hidden md:flex'}`}>
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

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse h-72 rounded-3xl" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
            No se pudo cargar el catálogo. Verifica que el backend tenga el módulo ecommerce
            desplegado.
          </p>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && !isError && (
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
