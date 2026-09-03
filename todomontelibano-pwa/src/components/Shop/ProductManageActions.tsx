import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Power, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { canManageProduct } from '../../hooks/usePermissions';
import { useDeleteShopProduct, useUpdateShopProductStatus } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';
import type { ShopProduct } from '../../types/shop';

type Props = {
  product: ShopProduct;
  variant?: 'menu' | 'buttons';
};

const ProductManageActions: React.FC<Props> = ({ product, variant = 'menu' }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const del = useDeleteShopProduct();
  const status = useUpdateShopProductStatus();
  const allowed = canManageProduct(user, product);
  const published = product.is_published !== false && product.is_active !== false;

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!allowed) return null;

  const onDelete = () => {
    setOpen(false);
    if (!window.confirm(`¿Eliminar «${product.name}»? Esta acción no se puede deshacer.`)) return;
    del.mutate(product.slug, {
      onSuccess: () => navigate(ROUTES.tienda),
      onError: (error: unknown) => {
        const data = (error as { response?: { data?: { message?: string; detail?: string } } })
          ?.response?.data;
        window.alert(data?.message || data?.detail || 'No tienes permisos para eliminar este producto.');
      },
    });
  };

  const onToggle = () => {
    setOpen(false);
    status.mutate(
      {
        slug: product.slug,
        payload: { is_published: !published, is_active: !published },
      },
      {
        onError: (error: unknown) => {
          const data = (error as { response?: { data?: { message?: string; detail?: string } } })
            ?.response?.data;
          window.alert(data?.message || data?.detail || 'No tienes permisos para editar este producto.');
        },
      },
    );
  };

  const actions = (
    <>
      <Link
        to={ROUTES.tiendaEdit(product.slug)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-violet-400"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil className="w-3.5 h-3.5" /> Editar
      </Link>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-amber-400"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        disabled={status.isPending}
      >
        <Power className="w-3.5 h-3.5" /> {published ? 'Desactivar' : 'Activar'}
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        disabled={del.isPending}
      >
        <Trash2 className="w-3.5 h-3.5" /> Eliminar
      </button>
    </>
  );

  if (variant === 'buttons') {
    return <div className="flex flex-wrap gap-2">{actions}</div>;
  }

  return (
    <div ref={rootRef} className="relative z-20" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="p-2 rounded-full bg-white/95 dark:bg-gray-900/95 shadow border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        aria-label="Opciones del producto"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-2 flex flex-col gap-1">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ProductManageActions;
