import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MoreVertical, Pencil, Power, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { canManageProduct } from '../../hooks/usePermissions';
import { useDeleteShopProduct, useUpdateShopProductStatus } from '../../hooks/useShop';
import { ROUTES } from '../../config/seo';
import type { ShopProduct } from '../../types/shop';
import Modal from '../UI/Modal';

type Props = {
  product: ShopProduct;
  variant?: 'menu' | 'buttons';
  canManage?: boolean;
};

const ProductManageActions: React.FC<Props> = ({ product, variant = 'menu', canManage }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const del = useDeleteShopProduct();
  const status = useUpdateShopProductStatus();
  const allowed = canManage ?? canManageProduct(user, product);
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
    setConfirmDelete(true);
  };

  const confirmAndDelete = () => {
    del.mutate(product.slug, {
      onSuccess: () => {
        setConfirmDelete(false);
        navigate(ROUTES.tienda);
      },
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

  const deleteModal = confirmDelete
    ? createPortal(
        <Modal
          isOpen
          onClose={() => !del.isPending && setConfirmDelete(false)}
          title="Eliminar producto"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ¿Eliminar «{product.name}»? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700"
              onClick={() => setConfirmDelete(false)}
              disabled={del.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              onClick={confirmAndDelete}
              disabled={del.isPending}
            >
              {del.isPending ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>,
        document.body,
      )
    : null;

  if (variant === 'buttons') {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <Link
            to={ROUTES.tiendaEdit(product.slug)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-violet-400"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="w-3.5 h-3.5" /> Editar producto
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
            <Power className="w-3.5 h-3.5" /> {published ? 'Ocultar' : 'Publicar'}
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
        </div>
        {deleteModal}
      </>
    );
  }

  return (
    <div ref={rootRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="p-2 rounded-full bg-white shadow-lg ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/20 text-gray-800 dark:text-gray-100 hover:bg-violet-50 dark:hover:bg-gray-800"
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
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 py-1 z-[60]"
        >
          <Link
            role="menuitem"
            to={ROUTES.tiendaEdit(product.slug)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="w-4 h-4" /> Editar producto
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            disabled={status.isPending}
          >
            {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {published ? 'Ocultar producto' : 'Publicar producto'}
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            disabled={del.isPending}
          >
            <Trash2 className="w-4 h-4" /> Eliminar producto
          </button>
        </div>
      )}
      {deleteModal}
    </div>
  );
};

export default ProductManageActions;
