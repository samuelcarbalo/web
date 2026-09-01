import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export interface Resource {
  posted_by?: any | string | number | null;
}

export function isPlatformElevatedUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return !!(user.is_superuser || user.is_staff || user.role === 'admin');
}

export function isSuperAdminLevel1(user: User | null | undefined): boolean {
  if (!user) return false;
  const level = user.admin_level ?? 0;
  if (level === 1) return true;
  if (level === 2) return false;
  return !!user.is_superuser;
}

export function isSuperAdminLevel2(user: User | null | undefined): boolean {
  return (user?.admin_level ?? 0) === 2;
}

/** Puede crear/editar contenido de módulos (manager, admin o superuser/staff). */
export function canManageContent(user: User | null | undefined): boolean {
  if (!user) return false;
  return isPlatformElevatedUser(user) || user.role === 'manager';
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

  /**
   * Propietario del recurso O administrador de plataforma (CRUD completo).
   */
  const isOwner = (resource: Resource | null | undefined): boolean => {
    if (!user || !resource) return false;
    if (isPlatformElevatedUser(user)) return true;

    const postedById =
      resource.posted_by && typeof resource.posted_by === 'object'
        ? resource.posted_by.id
        : resource.posted_by;

    if (user.role === 'manager' && user.id === postedById) return true;
    if (user.role === 'admin' && user.id === postedById) return true;
    return false;
  };

  return {
    user,
    isOwner,
    isManager,
    isAdmin,
    isUser,
    isPlatformAdmin,
    canManageContent: canManage,
    canManageAdmins,
    isDelegatedAdmin,
    isSuperAdminLevel1: canManageAdmins,
    isSuperAdminLevel2: isDelegatedAdmin,
  };
};
