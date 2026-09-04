import type { Profile, User } from '../types';

const ORG_ROLES = new Set(['user', 'manager', 'admin']);
const HIERARCHY_ROLES = new Set([
  'SUPER_ADMIN_L1',
  'SUPER_ADMIN_L2',
  'SUPER_ADMIN',
  'super_admin',
]);

function unwrapUserPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as Record<string, unknown>;
  if (data.email || data.id || data.admin_level != null || data.hierarchy_role) {
    return data;
  }
  if (data.data && typeof data.data === 'object') {
    return unwrapUserPayload(data.data);
  }
  if (data.user && typeof data.user === 'object') {
    return unwrapUserPayload(data.user);
  }
  return data;
}

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function asAdminLevel(value: unknown): 0 | 1 | 2 {
  const n = Number(value);
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 0;
}

function asId(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: unknown }).id ?? '');
  }
  return String(value);
}

function orgRoleOf(rawRole: string): User['role'] {
  if (rawRole === 'manager' || rawRole === 'admin' || rawRole === 'user') return rawRole;
  return 'user';
}

/**
 * Normaliza /auth/me/, login.user y payloads anidados al User del store.
 * Conserva role de organización y guarda hierarchy_role (SUPER_ADMIN_L1/L2).
 */
export function mapAuthUser(
  raw: unknown,
  profile?: Partial<Profile> | null,
): User {
  const payload = unwrapUserPayload(raw);
  const rawRole = String(payload.role ?? '');
  const hierarchyFromRole = HIERARCHY_ROLES.has(rawRole) ? rawRole : '';
  const hierarchy = String(payload.hierarchy_role ?? payload.panel_role ?? hierarchyFromRole ?? '') || null;
  let adminLevel = asAdminLevel(payload.admin_level);
  const isSuperuser = asBool(payload.is_superuser) || asBool(payload.is_super_admin_l1);
  const isL2 = asBool(payload.is_super_admin_l2) || hierarchy === 'SUPER_ADMIN_L2' || adminLevel === 2;
  if (isL2) adminLevel = 2;
  else if (isSuperuser || hierarchy === 'SUPER_ADMIN_L1' || hierarchy === 'SUPER_ADMIN' || hierarchy === 'super_admin') {
    if (adminLevel !== 2) adminLevel = 1;
  }

  const organization = payload.organization;
  const organizationId =
    asId(profile?.organization) ||
    (organization && typeof organization === 'object'
      ? asId((organization as { id?: unknown }).id)
      : asId(organization));

  const fullName =
    profile?.user_name ||
    String(payload.full_name || payload.email || '');

  return {
    id: asId(profile?.user) || asId(payload.id),
    email: String(profile?.user_email || payload.email || ''),
    first_name: String(payload.first_name || fullName.split(' ')[0] || ''),
    last_name: String(
      payload.last_name || fullName.split(' ').slice(1).join(' ') || '',
    ),
    name: fullName,
    phone: profile?.phone,
    organization: organizationId || undefined,
    organization_name:
      profile?.organization_name ||
      (organization && typeof organization === 'object'
        ? String((organization as { name?: unknown }).name || '')
        : String(payload.organization_name || '')) || undefined,
    role: orgRoleOf(rawRole),
    hierarchy_role: hierarchy && hierarchy !== 'null' ? hierarchy : null,
    is_superuser: isSuperuser,
    is_staff: asBool(payload.is_staff) || isSuperuser || isL2,
    is_super_admin_l1: adminLevel === 1 || asBool(payload.is_super_admin_l1),
    is_super_admin_l2: adminLevel === 2 || asBool(payload.is_super_admin_l2),
    admin_level: adminLevel,
    is_unlimited_credits: asBool(payload.is_unlimited_credits),
    user_type: (payload.user_type as User['user_type']) || 'person',
    avatar: profile?.avatar,
    bio: profile?.bio || undefined,
    location: profile?.location || undefined,
    job_title: profile?.job_title || undefined,
    completion_percentage: profile?.completion_percentage,
    credits: Number(payload.credits) || 0,
    sports_module_active: asBool(payload.sports_module_active),
    sports_module_expires_at: (payload.sports_module_expires_at as string | null) ?? null,
    store_unlimited_until: (payload.store_unlimited_until as string | null) ?? null,
    store_unlimited_activations_pending:
      Number(payload.store_unlimited_activations_pending) || 0,
  };
}

export { ORG_ROLES, HIERARCHY_ROLES };
