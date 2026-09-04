import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Boxes, Eye, Package, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { canSeeMyCreatedProducts, isShopSuperAdmin } from '../../hooks/usePermissions';
import { useDeleteShopProduct, useShopProducts, useUpdateShopProductStatus } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';
import { getMediaUrl } from '../../lib/api';
import type { ShopProduct } from '../../types/shop';
import Modal from '../../components/UI/Modal';
import SeoHead from '../../components/SEO/SeoHead';

const formatCop = (value: number | string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const MyProductsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canAccess = canSeeMyCreatedProducts(user);
  const isSuperAdmin = isShopSuperAdmin(user);
  const [seeAll, setSeeAll] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ShopProduct | null>(null);

  const params = useMemo(() => {
    if (isSuperAdmin && seeAll) return { manage: true, all: true };
    return { created_by_me: true };
  }, [isSuperAdmin, seeAll]);

  const { data, isLoading, isError, refetch, isFetching } = useShopProducts(params, {
    enabled: canAccess,
  });
  const products = data?.results ?? [];
  const count = data?.count ?? products.length;
  const del = useDeleteShopProduct();
  const status = useUpdateShopProductStatus();

  const confirmDelete = () => {
    if (!pendingDelete) return;
    del.mutate(pendingDelete.slug, {
      onSuccess: () => setPendingDelete(null),
      onError: (error: unknown) => {
        const payload = (error as { response?: { data?: { message?: string; detail?: string } } })
          ?.response?.data;
        window.alert(payload?.message || payload?.detail || 'No se pudo eliminar el producto.');
      },
    });
  };

  const togglePublished = (product: ShopProduct) => {
    const published = product.is_published !== false && product.is_active !== false;
    status.mutate({
      slug: product.slug,
      payload: { is_published: !published, is_active: !published },
    });
  };

  if (!canAccess) {
    return <Navigate to={ROUTES.dashboardTienda} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <SeoHead title="Mis productos creados" path={ROUTES.tiendaMisProductos} noindex />
      <div className="bg-gradient-to-r from-violet-600/90 via-indigo-600/90 to-indigo-700 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <Link
            to={ROUTES.dashboardTienda}
            className="inline-flex items-center text-sm font-bold text-violet-100 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard de tienda
          </Link>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full">
                Inventario
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
                {isSuperAdmin && seeAll ? 'Todos los productos del sistema' : 'Mis productos creados'}
              </h1>
              <p className="mt-2 text-violet-100 max-w-xl font-light">
                {isSuperAdmin && seeAll
                  ? 'Catálogo global: todos los productos del sistema.'
                  : 'Gestiona el inventario que publicaste en la tienda.'}
              </p>
            </div>
            <Link
              to={ROUTES.tiendaCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-4 py-2.5 text-sm font-bold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" /> Crear producto
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {count} producto{count === 1 ? '' : 's'}
          </p>
          {isSuperAdmin && (
            <div className="inline-flex rounded-2xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-900">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                  !seeAll
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSeeAll(false)}
              >
                Mis productos
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                  seeAll
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSeeAll(true)}
              >
                Todos los productos del sistema
              </button>
            </div>
          )}
        </div>

        {isLoading && <div className="card animate-pulse h-40 rounded-3xl" />}

        {isError && (
          <div className="card text-red-700 dark:text-red-300">
            No se pudo cargar el inventario.{' '}
            <button type="button" className="font-bold underline" onClick={() => void refetch()}>
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="card-static text-center py-16">
            <Boxes className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold">Aún no tienes productos</h2>
            <p className="text-gray-500 mt-2">Publica el primero para verlo en este inventario.</p>
            <Link to={ROUTES.tiendaCreate} className="btn-primary inline-flex items-center mt-6">
              <Plus className="w-4 h-4 mr-2" /> Crear producto
            </Link>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="card overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Estado</th>
                    {isSuperAdmin && seeAll && <th className="px-4 py-3">Creador</th>}
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((product) => {
                    const published = product.is_published !== false && product.is_active !== false;
                    const img = getMediaUrl(product.image_url);
                    return (
                      <tr key={product.id} className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[14rem]">
                            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                              {img ? (
                                <img src={img} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 m-3 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {product.category_name || 'General'}
                                {product.sku ? ` · ${product.sku}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {formatCop(product.price_cop)}
                        </td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              published
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {published ? 'Publicado' : 'Oculto'}
                          </span>
                        </td>
                        {isSuperAdmin && seeAll && (
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {product.created_by_email || '—'}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex justify-end flex-wrap gap-1.5">
                            <Link
                              to={ROUTES.tiendaProducto(product.slug)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </Link>
                            <Link
                              to={ROUTES.tiendaEdit(product.slug)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </Link>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold"
                              onClick={() => togglePublished(product)}
                              disabled={status.isPending}
                            >
                              <Power className="w-3.5 h-3.5" />
                              {published ? 'Ocultar' : 'Publicar'}
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold"
                              onClick={() => setPendingDelete(product)}
                              disabled={del.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {isFetching && !isLoading && (
              <p className="px-4 py-2 text-xs text-gray-400">Actualizando…</p>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => !del.isPending && setPendingDelete(null)}
        title="Eliminar producto"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ¿Eliminar «{pendingDelete?.name}»? Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700"
            onClick={() => setPendingDelete(null)}
            disabled={del.isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
            onClick={confirmDelete}
            disabled={del.isPending}
          >
            {del.isPending ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyProductsPage;
