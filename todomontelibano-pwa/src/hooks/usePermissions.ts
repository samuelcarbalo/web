import { useAuthStore } from '../store/authStore';

export interface Resource {
  posted_by?: any | string | number | null;
}

/**
 * Hook para centralizar la gestión de permisos en la aplicación.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  /**
   * Determina si el usuario actual es propietario del recurso suministrado.
   */
  const isOwner = (resource: Resource | null | undefined): boolean => {
    if (!user || !resource) return false;
    
    // Si posted_by es un objeto (e.g. un objeto User), extraemos su id
    const postedById = 
      resource.posted_by && typeof resource.posted_by === 'object'
        ? resource.posted_by.id
        : resource.posted_by;

    return user.role === 'manager' && user.id === postedById;
  };

  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return {
    user,
    isOwner,
    isManager,
    isAdmin,
    isUser,
  };
};
