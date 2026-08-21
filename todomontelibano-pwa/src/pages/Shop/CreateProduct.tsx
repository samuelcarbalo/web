import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useShopCategories } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';
import SeoHead from '../../components/SEO/SeoHead';

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categoriesData } = useShopCategories();
  const categories = categoriesData?.items ?? [];

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
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        price_cop: Number(form.price_cop) || 0,
        stock: Number(form.stock) || 0,
        image_url: form.image_url.trim() || undefined,
        sku: form.sku.trim() || undefined,
        category: form.category || undefined,
        is_published: form.is_published,
        is_featured: form.is_featured,
        is_active: true,
      };
      const { data } = await api.post('/ecommerce/products/', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      navigate(data?.slug ? `/tienda/${data.slug}` : ROUTES.tienda);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'No se pudo crear el producto. Verifica permisos y organización (X-Tenant).';
      setError(typeof detail === 'string' ? detail : 'Error al crear el producto');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <SeoHead title="Crear producto" path="/tienda/publicar" noindex />
      <div className="page-container max-w-2xl">
        <Link
          to={ROUTES.tienda}
          className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-violet-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a tienda
        </Link>

        <div className="card">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-violet-600" />
            Crear producto en tienda
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Publica un producto en el catálogo del tenant actual.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              create.mutate();
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
            <div>
              <label className="auth-label">URL de imagen</label>
              <input
                className="input-field"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
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

            <button type="submit" disabled={create.isPending} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {create.isPending ? 'Publicando…' : 'Crear producto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
