import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useShopProduct } from '../../hooks/useShop';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { canManageProduct } from '../../hooks/usePermissions';
import { getMediaUrl } from '../../lib/api';
import { ROUTES, SITE_NAME } from '../../config/seo';
import SeoHead from '../../components/SEO/SeoHead';
import CatalogErrorState from '../../components/Shop/CatalogErrorState';
import ProductManageActions from '../../components/Shop/ProductManageActions';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, isFetching, refetch } = useShopProduct(slug);
  const product = data?.product ?? null;
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return <div className="page-container py-20 text-center text-gray-500">Cargando producto…</div>;
  }
  if (isError || !product || data?.degraded) {
    return (
      <div className="page-container py-20">
        <CatalogErrorState
          message={data?.warning || 'No se pudo cargar este producto en este momento'}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
        <div className="text-center mt-6">
          <Link to={ROUTES.tienda} className="text-sm font-bold text-violet-600">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <SeoHead
        title={`${product.name} | Tienda ${SITE_NAME}`}
        description={product.short_description || product.description || product.name}
        path={ROUTES.tiendaProducto(product.slug)}
        ogImage={product.image_url ? getMediaUrl(product.image_url) : undefined}
      />
      <div className="page-container py-8">
        <Link to={ROUTES.tienda} className="inline-flex items-center text-sm font-bold text-violet-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {product.image_url ? (
              <img
                src={getMediaUrl(product.image_url)}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
              {product.category_name || 'General'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
              {product.name}
            </h1>
            {canManageProduct(user, product) && (
              <div className="mt-4">
                <ProductManageActions
                  product={product}
                  variant="buttons"
                  canManage
                />
              </div>
            )}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-violet-600">{formatCop(product.price_cop)}</span>
              {product.compare_at_price_cop &&
                Number(product.compare_at_price_cop) > Number(product.price_cop) && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCop(product.compare_at_price_cop)}
                  </span>
                )}
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description || product.short_description}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Stock: <strong>{product.stock}</strong>
              {product.sku ? ` · SKU ${product.sku}` : ''}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock)}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
                className="input-field w-24"
              />
              <button
                type="button"
                disabled={product.stock < 1}
                onClick={handleAdd}
                className="btn-primary disabled:opacity-50"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Agregado
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Agregar al carrito
                  </>
                )}
              </button>
              <Link to={ROUTES.tiendaCarrito} className="btn-secondary">
                Ir al carrito
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
