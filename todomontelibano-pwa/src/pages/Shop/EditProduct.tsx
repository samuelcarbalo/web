import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { useShopCategories, useShopProduct, useUpdateShopProduct } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';
import SeoHead from '../../components/SEO/SeoHead';
import { useAuthStore } from '../../store/authStore';
import { canManageProduct } from '../../hooks/usePermissions';
import ImageUploader from '../../components/UI/ImageUploader';

const EditProduct: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: categoriesData } = useShopCategories();
  const { data, isLoading, isError } = useShopProduct(slug);
  const product = data?.product ?? null;
  const categories = categoriesData?.items ?? [];
  const update = useUpdateShopProduct();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    price_cop: '',
    stock: '1',
    image_url: '',
    sku: '',
    category: '',
    is_published: true,
    is_featured: false,
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || '',
      short_description: product.short_description || '',
      description: product.description || '',
      price_cop: String(product.price_cop ?? ''),
      stock: String(product.stock ?? 0),
      image_url: product.image_url || '',
      sku: product.sku || '',
      category: product.category || '',
      is_published: product.is_published !== false,
      is_featured: !!product.is_featured,
    });
  }, [product]);

  if (isLoading) {
    return <p className="page-container py-16 text-sm text-gray-500">Cargando producto…</p>;
  }
  if (isError || !product) {
    return (
      <div className="page-container py-16">
        <p className="text-red-600">No se pudo cargar el producto.</p>
        <Link to={ROUTES.tienda} className="text-violet-600 text-sm mt-2 inline-block">
          Volver a la tienda
        </Link>
      </div>
    );
  }
  if (!canManageProduct(user, product)) {
    return <Navigate to={ROUTES.tiendaProducto(product.slug)} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <SeoHead title={`Editar ${product.name}`} path={ROUTES.tiendaEdit(product.slug)} noindex />
      <div className="page-container max-w-2xl">
        <Link
          to={ROUTES.tiendaProducto(product.slug)}
          className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-violet-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al producto
        </Link>

        <div className="card">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-violet-600" />
            Editar producto
          </h1>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              update.mutate(
                {
                  slug: product.slug,
                  payload: {
                    name: form.name.trim(),
                    short_description: form.short_description.trim(),
                    description: form.description.trim(),
                    price_cop: Number(form.price_cop) || 0,
                    stock: Number(form.stock) || 0,
                    image_url: form.image_url.trim() || '',
                    sku: form.sku.trim() || '',
                    category: form.category || null,
                    is_published: form.is_published,
                    is_featured: form.is_featured,
                    is_active: true,
                  },
                },
                {
                  onSuccess: (data) => navigate(ROUTES.tiendaProducto(data.slug || product.slug)),
                  onError: (err: unknown) => {
                    const data = (err as { response?: { data?: Record<string, unknown> } })?.response
                      ?.data;
                    setError(
                      (typeof data?.message === 'string' && data.message) ||
                        (typeof data?.detail === 'string' && data.detail) ||
                        'No tienes permisos para editar este producto.',
                    );
                  },
                },
              );
            }}
          >
            <div>
              <label className="auth-label">Nombre *</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="auth-label">Descripción corta</label>
              <input
                className="input-field"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </div>
            <div>
              <label className="auth-label">Descripción</label>
              <textarea
                className="input-field min-h-[100px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="auth-label">Precio (COP) *</label>
                <input
                  required
                  type="number"
                  min={0}
                  className="input-field"
                  value={form.price_cop}
                  onChange={(e) => setForm({ ...form, price_cop: e.target.value })}
                />
              </div>
              <div>
                <label className="auth-label">Stock</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="auth-label">Categoría</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <ImageUploader
              id="product-image-edit"
              label="Imagen del producto"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              preview="square"
              hint="Sube un archivo o pega una URL HTTPS."
            />
            <div>
              <label className="auth-label">SKU</label>
              <input
                className="input-field"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              Destacado
            </label>
            {error && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={update.isPending}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {update.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
