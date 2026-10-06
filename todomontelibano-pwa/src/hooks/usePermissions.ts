import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export interface Resource {
  posted_by?: any | string | number | null;
  /** ID del creador del torneo/equipo (campo alternativo). */
  owner_id?: string | number | null;
}

const PLATFORM_SUPER_ADMIN_ROLES = new Set([
  'SUPER_ADMIN',
  'SUPER_ADMIN_L1',
  'SUPER_ADMIN_L2',
  'SUPER_ADMIN_LEVEL_1',
  'SUPER_ADMIN_LEVEL_2',
]);

function hasPlatformSuperAdminRole(user: User): boolean {
  const role = String(user.role || '').toUpperCase();
  const hierarchy = String(user.hierarchy_role || '').toUpperCase();
  return PLATFORM_SUPER_ADMIN_ROLES.has(role) || PLATFORM_SUPER_ADMIN_ROLES.has(hierarchy);
}

export function isPlatformElevatedUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser || user.is_staff || user.role === 'admin') return true;
  if (adminLevelOf(user) >= 1) return true;
  if (user.is_super_admin_l1 || user.is_super_admin_l2) return true;
  return hasPlatformSuperAdminRole(user);
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

/** Roles con acceso a "Mis productos creados" (Admin / Super Admin L1–L2). Sin managers. */
const MY_CREATED_PRODUCTS_ROLES = new Set([
  'ADMIN',
  'admin',
  'SUPER_ADMIN_L1',
  'SUPER_ADMIN_L2',
  'SUPER_ADMIN',
  'super_admin',
]);

/**
 * Tarjeta y ruta "Mis productos creados": solo Admin y Super Admin (Nivel 1 / 2).
 */
export function canSeeMyCreatedProducts(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_admin || user.is_superuser) return true;
  if (user.is_super_admin_l1 || user.is_super_admin_l2) return true;
  if ((user.admin_level ?? 0) >= 1) return true;
  if (MY_CREATED_PRODUCTS_ROLES.has(String(user.role))) return true;
  if (MY_CREATED_PRODUCTS_ROLES.has(String(user.hierarchy_role || ''))) return true;
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
 * Fuente de verdad: `can_manage` del API. Fallback local solo si el flag no viene.
 */
export function canManageProduct(
  user: User | null | undefined,
  product: ShopProductOwnerFields | null | undefined,
): boolean {
  if (!product) return false;
  if (product.can_manage === true) return true;
  if (product.can_manage === false) return false;
  if (!user) return false;
  if (isShopSuperAdmin(user)) return true;
  const ownerId = coerceEntityId(product.created_by ?? product.createdBy);
  const userId = coerceEntityId(user.id);
  return Boolean(ownerId && userId && ownerId === userId);
}

/** Puede crear/editar contenido de módulos (manager, admin o Super Admin L1/L2). */
export function canManageContent(user: User | null | undefined): boolean {
  if (!user) return false;
  return isPlatformElevatedUser(user) || user.role === 'manager';
}

/**
 * Super Admin del módulo de Deportes/Torneos (Nivel 1 y Nivel 2).
 * Equivalente a `_is_sports_super_admin` del backend.
 */
export function isSportsSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isSuperAdminLevel1(user) || isSuperAdminLevel2(user)) return true;
  return hasPlatformSuperAdminRole(user);
}

/** El usuario es el creador (posted_by / owner_id) del recurso. */
export function isSportsResourceOwner(
  user: User | null | undefined,
  resource: Resource | null | undefined,
): boolean {
  if (!user || !resource) return false;
  const postedById =
    resource.posted_by && typeof resource.posted_by === 'object'
      ? resource.posted_by.id
      : resource.posted_by;
  const ownerId = resource.owner_id ?? postedById;
  return ownerId != null && String(user.id) === String(ownerId);
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

export type TeamPermissionFields = Resource & {
  coach_email?: string | null;
  can_edit?: boolean;
};

const MATCH_SUPER_ADMIN_L1_ROLES = new Set([
  'SUPER_ADMIN_LEVEL_1',
  'SUPER_ADMIN_L1',
  'SUPER_ADMIN',
]);

const MATCH_SUPER_ADMIN_L2_ROLES = new Set([
  'SUPER_ADMIN_LEVEL_2',
  'SUPER_ADMIN_L2',
]);

function roleTokens(user: User): string[] {
  return [String(user.role || ''), String(user.hierarchy_role || '')].map((value) =>
    value.toUpperCase(),
  );
}

/** Super Admin Nivel 1: role SUPER_ADMIN_LEVEL_1 o is_superuser (y alias de plataforma). */
export function isMatchSuperAdminLevel1(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  if (roleTokens(user).some((role) => MATCH_SUPER_ADMIN_L1_ROLES.has(role))) return true;
  return isSuperAdminLevel1(user);
}

/** Super Admin Nivel 2: role SUPER_ADMIN_LEVEL_2 (y alias de plataforma). */
export function isMatchSuperAdminLevel2(user: User | null | undefined): boolean {
  if (!user) return false;
  if (roleTokens(user).some((role) => MATCH_SUPER_ADMIN_L2_ROLES.has(role))) return true;
  return isSuperAdminLevel2(user);
}

export type MatchPermissionFields = {
  tournament?: unknown;
  tournament_owner_id?: unknown;
  tournament_created_by?: unknown;
  tournament_posted_by?: unknown;
};

function entityId(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    const record = value as { id?: unknown };
    if ('id' in record) return String(record.id ?? '');
  }
  return String(value);
}

function tournamentOwnerId(
  match: MatchPermissionFields,
  tournament?: Resource | { created_by?: unknown; posted_by?: unknown; owner_id?: unknown } | null,
): string {
  const nested =
    match.tournament && typeof match.tournament === 'object'
      ? (match.tournament as {
          owner_id?: unknown;
          created_by?: unknown;
          posted_by?: unknown;
        })
      : null;
  const candidates = [
    tournament?.owner_id,
    (tournament as { created_by?: unknown } | null | undefined)?.created_by,
    tournament?.posted_by,
    nested?.owner_id,
    nested?.created_by,
    nested?.posted_by,
    match.tournament_owner_id,
    match.tournament_created_by,
    match.tournament_posted_by,
  ];
  for (const candidate of candidates) {
    const id = entityId(candidate);
    if (id) return id;
  }
  return '';
}

/**
 * Gestión en vivo del partido y de la plantilla de ambos equipos.
 * True si el usuario es Super Admin Nivel 1, Super Admin Nivel 2
 * o el creador/dueño del torneo del partido.
 */
export function canManageMatch(
  user: User | null | undefined,
  match: MatchPermissionFields | null | undefined,
  tournament?: Resource | null,
): boolean {
  if (!user || !match) return false;
  if (isMatchSuperAdminLevel1(user) || isMatchSuperAdminLevel2(user)) return true;
  const ownerId = tournamentOwnerId(match, tournament);
  const userId = entityId(user.id);
  return Boolean(ownerId && userId && ownerId === userId);
}

/**
 * Edición completa del equipo (logo, nombre, colores, plantilla).
 * Fuente de verdad: `can_edit` del API (incluye capitanes). Fallback local si no viene.
 */
export function canEditTeam(
  user: User | null | undefined,
  team: TeamPermissionFields | null | undefined,
  tournament: Resource | null | undefined,
): boolean {
  if (!user || !team) return false;
  if (team.can_edit === true) return true;
  if (team.can_edit === false) return false;
  if (isSportsSuperAdmin(user) || isSportsResourceOwner(user, tournament)) return true;
  if (isSportsResourceOwner(user, team)) return true;
  const coachEmail = (team.coach_email || '').trim().toLowerCase();
  return !!coachEmail && coachEmail === (user.email || '').trim().toLowerCase();
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
    return canManageSportsResource(user, resource);
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
    canManageMatch: (
      match: MatchPermissionFields | null | undefined,
      tournament?: Resource | null,
    ) => canManageMatch(user, match, tournament),
    canManageProduct: (product: ShopProductOwnerFields | null | undefined) =>
      canManageProduct(user, product),
    canSeeMyCreatedProducts: canSeeMyCreatedProducts(user),
  };
};
