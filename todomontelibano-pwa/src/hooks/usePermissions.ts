import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export interface Resource {
  posted_by?: any | string | number | null;
  /** ID del creador del torneo/equipo (campo alternativo). */
  owner_id?: string | number | null;
}

export function isPlatformElevatedUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return !!(user.is_superuser || user.is_staff || user.role === 'admin');
}

function adminLevelOf(user: User | null | undefined): number {
  const level = Number(user?.admin_level ?? 0);
  return Number.isFinite(level) ? level : 0;
}

export function isSuperAdminLevel1(user: User | null | undefined): boolean {
  if (!user) return false;
  const level = adminLevelOf(user);
  if (level === 1) return true;
  if (level === 2) return false;
  return !!user.is_superuser;
}

export function isSuperAdminLevel2(user: User | null | undefined): boolean {
  return adminLevelOf(user) === 2;
}

const SHOP_SUPER_ADMIN_ROLES = new Set([
  'SUPER_ADMIN_L1',
  'SUPER_ADMIN_L2',
  'SUPER_ADMIN',
  'super_admin',
]);

/** Super Admin Nivel 1 o Nivel 2, o Administrador (role=admin). */
export function isShopSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_super_admin_l1 || user.is_super_admin_l2) return true;
  if (isSuperAdminLevel1(user) || isSuperAdminLevel2(user)) return true;
  if (SHOP_SUPER_ADMIN_ROLES.has(String(user.hierarchy_role || ''))) return true;
  if (SHOP_SUPER_ADMIN_ROLES.has(String(user.role))) return true;
  if (String(user.role) === 'admin' || user.is_staff) return true;
  return false;
}

export type ShopProductOwnerFields = {
  created_by?: string | { id?: string | number } | null;
  createdBy?: string | { id?: string | number } | null;
  can_manage?: boolean;
};

function coerceEntityId(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object' && 'id' in (value as object)) {
    return String((value as { id?: unknown }).id ?? '');
  }
  return String(value);
}

/**
 * Puede editar/eliminar/desactivar un producto de tienda.
 * Owner (created_by), Super Admin L1/L2, o flag `can_manage` del API.
 */
export function canManageProduct(
  user: User | null | undefined,
  product: ShopProductOwnerFields | null | undefined,
): boolean {
  if (!user || !product) return false;
  if (product.can_manage === true) return true;
  if (isShopSuperAdmin(user)) return true;
  const ownerId = coerceEntityId(product.created_by ?? product.createdBy);
  const userId = coerceEntityId(user.id);
  return Boolean(ownerId && userId && ownerId === userId);
}

/** Puede crear/editar contenido de módulos (manager, admin o superuser/staff). */
export function canManageContent(user: User | null | undefined): boolean {
  if (!user) return false;
  return isPlatformElevatedUser(user) || user.role === 'manager';
}

/**
 * Determina si el usuario es Super Admin del módulo de Deportes/Torneos.
 * Equivalente al helper `_is_sports_super_admin` del backend.
 * Nivel 1: is_superuser, admin_level === 1 o role SUPER_ADMIN.
 */
export function isSportsSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  if (adminLevelOf(user) === 1) return true;
  const role = String(user.role);
  if (role === 'SUPER_ADMIN' || role === 'super_admin') return true;
  return false;
}

/**
 * Puede gestionar un recurso de Deportes (torneo, equipo, partido, jugador).
 * Devuelve true si: es Super Admin, es el creador del recurso o es manager/admin.
 */
export function canManageSportsResource(
  user: User | null | undefined,
  resource: Resource | null | undefined,
): boolean {
  if (!user || !resource) return false;
  // Super Admin: acceso total
  if (isSportsSuperAdmin(user)) return true;
  // Admin/staff de plataforma
  if (isPlatformElevatedUser(user)) return true;
  // Propietario del recurso (posted_by u owner_id)
  const postedById =
    resource.posted_by && typeof resource.posted_by === 'object'
      ? resource.posted_by.id
      : resource.posted_by;
  const ownerId = resource.owner_id ?? postedById;
  if (ownerId != null && String(user.id) === String(ownerId)) return true;
  // Manager que creó el recurso
  if (user.role === 'manager' && postedById != null && String(user.id) === String(postedById)) return true;
  return false;
}

/**
 * Hook para centralizar la gestión de permisos en la aplicación.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const isPlatformAdmin = isPlatformElevatedUser(user);
  const canManage = canManageContent(user);
  const isManager = user?.role === 'manager' || isPlatformAdmin;
  const isAdmin = user?.role === 'admin' || isPlatformAdmin;
  const isUser = user?.role === 'user' && !isPlatformAdmin;
  const canManageAdmins = isSuperAdminLevel1(user);
  const isDelegatedAdmin = isSuperAdminLevel2(user);
  const isSportsAdmin = isSportsSuperAdmin(user);

  /**
   * Propietario del recurso O administrador de plataforma (CRUD completo).
   */
  const isOwner = (resource: Resource | null | undefined): boolean => {
    if (!user || !resource) return false;
    // Super Admin de Deportes: propietario de cualquier recurso
    if (isSportsSuperAdmin(user)) return true;
    if (isPlatformElevatedUser(user)) return true;

    const postedById =
      resource.posted_by && typeof resource.posted_by === 'object'
        ? resource.posted_by.id
        : resource.posted_by;

    if (user.role === 'manager' && user.id === postedById) return true;
    if (user.role === 'admin' && user.id === postedById) return true;
    return false;
  };

  /**
   * Puede gestionar un torneo/equipo/partido específico (editar, eliminar, gestionar tabla).
   * Equivalente backend: _is_sports_super_admin OR posted_by == user.
   */
  const canManageTournament = (resource: Resource | null | undefined): boolean => {
    return canManageSportsResource(user, resource);
  };

  return {
    user,
    isOwner,
    isManager,
    isAdmin,
    isUser,
    isPlatformAdmin,
    isSportsAdmin,
    canManageContent: canManage,
    canManageAdmins,
    isDelegatedAdmin,
    isSuperAdminLevel1: canManageAdmins,
    isSuperAdminLevel2: isDelegatedAdmin,
    canManageTournament,
    canManageProduct: (product: ShopProductOwnerFields | null | undefined) =>
      canManageProduct(user, product),
  };
};
