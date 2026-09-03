/** Costos de consumo interno (deben coincidir con el backend) */
export const CREDIT_COSTS = {
  job: 5,
  realEstate: 5,
  tournament: 200,
  sportsModule: 200,
  event: 5,
  store: 10,
  storeUnlimitedActivation: 250,
} as const;

/** Textos de membresía de Tienda Virtual */
export const SPORTS_MODULE_DAYS = 30;

export const SPORTS_MODULE_COPY = {
  title: 'Plan Administración Deportiva Completa',
  priceLabel: '200 Créditos / Mes',
  description:
    'Acceso ilimitado por 30 días a la creación, edición, eliminación y gestión de torneos, calendarios, equipos y jugadores por 200 créditos.',
  benefits: [
    'Creación, edición y eliminación ilimitada de torneos por 30 días.',
    'Gestión completa de equipos, plantillas y jugadores.',
    'Generación y control de calendarios, tablas de posiciones y partidos.',
  ],
} as const;

export const STORE_UNLIMITED_COPY = {
  monthEquivalency: '250 créditos equivalen a 1 mes ilimitado de Tienda Virtual.',
  surplusUsage:
    'Los créditos sobrantes del saldo podrán usarse libremente en empleos, torneos, bienes raíces y demás servicios.',
} as const;

/** Planes de patrocinio exclusivo de torneo (fallback si API no responde) */
export const FALLBACK_SPONSORSHIP_PLANS = [
  { id: 'week', label: 'Semana', credits: 80, days: 7, description: 'Patrocinio exclusivo por 7 días.' },
  { id: 'month', label: 'Mes', credits: 250, days: 30, description: 'Patrocinio exclusivo por 30 días.' },
  {
    id: 'bimester',
    label: 'Bimestre',
    credits: 450,
    days: 60,
    description:
      'Patrocinio exclusivo por 60 días. Al vencer, el espacio queda libre aunque el torneo siga activo.',
  },
] as const;

/** Planes publicitarios clasificados (empleos, inmuebles, eventos) */
export const FALLBACK_CLASSIFIED_AD_PLANS = [
  {
    id: 'basic',
    label: 'Básico',
    credits: 15,
    target_reach: 50,
    frequency_cap: 3,
    days: 15,
    description: '50 personas distintas, máx. 3 veces por persona.',
  },
  {
    id: 'standard',
    label: 'Estándar',
    credits: 25,
    target_reach: 100,
    frequency_cap: 5,
    days: 30,
    description: '100 personas distintas, máx. 5 veces por persona.',
  },
  {
    id: 'plus',
    label: 'Plus',
    credits: 45,
    target_reach: 250,
    frequency_cap: 5,
    days: 30,
    description: '250 personas distintas, máx. 5 veces por persona.',
  },
] as const;

export const CREDIT_VALUE_COP = 1000;

export const ROUTES_CREDITS = {
  packages: '/creditos',
  result: '/creditos/resultado',
} as const;

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cop: number;
  badge: string | null;
  savings_cop: number;
  description: string;
  standard_price_cop?: number;
}

/** Fallback local si la API no responde (debe coincidir con payments/packages.py) */
export const FALLBACK_PACKAGES: CreditPackage[] = [
  {
    id: 'basico',
    name: 'Paquete Básico',
    credits: 20,
    price_cop: 20000,
    badge: null,
    savings_cop: 0,
    description: 'Precio estándar — ideal para probar la plataforma.',
    standard_price_cop: 20000,
  },
  {
    id: 'bronce',
    name: 'Paquete Bronce',
    credits: 30,
    price_cop: 28000,
    badge: 'Promoción',
    savings_cop: 2000,
    description: 'Ahorra $2.000 COP respecto al precio estándar.',
    standard_price_cop: 30000,
  },
  {
    id: 'plata',
    name: 'Paquete Plata',
    credits: 50,
    price_cop: 45000,
    badge: 'Paquete intermedio',
    savings_cop: 5000,
    description: '50 créditos para empleos, inmuebles o eventos. El Módulo Deportivo cuesta 200 créditos / 30 días.',
    standard_price_cop: 50000,
  },
  {
    id: 'oro',
    name: 'Paquete Oro',
    credits: 100,
    price_cop: 80000,
    badge: '¡Recomendado para Empresas!',
    savings_cop: 20000,
    description: 'Máximo ahorro para empresas con publicaciones frecuentes.',
    standard_price_cop: 100000,
  },
  {
    id: 'platino',
    name: 'Paquete Platino',
    credits: 250,
    price_cop: 200000,
    badge: 'Patrocinio mensual',
    savings_cop: 50000,
    description:
      '250 créditos — alcanzan para activar 1 mes ilimitado de Tienda Virtual al publicar, o usar en otros servicios.',
    standard_price_cop: 250000,
  },
  {
    id: 'diamante',
    name: 'Paquete Diamante',
    credits: 450,
    price_cop: 350000,
    badge: 'Patrocinio ejecutivo',
    savings_cop: 100000,
    description:
      '450 créditos: activa Tienda Ilimitada por 30 días al publicar (250 cr); los 200 restantes quedan libres para empleos, torneos, bienes raíces y demás servicios.',
    standard_price_cop: 450000,
  },
];

export const formatCop = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);

export function hasActiveSportsModule(user?: {
  sports_module_active?: boolean;
  sports_module_expires_at?: string | null;
  is_unlimited_credits?: boolean;
  is_superuser?: boolean;
  admin_level?: number;
} | null): boolean {
  if (!user) return false;
  if (user.is_unlimited_credits || user.is_superuser || user.admin_level === 1) return true;
  if (!user.sports_module_expires_at) return false;
  return new Date(user.sports_module_expires_at).getTime() > Date.now();
}

export function sportsModuleDaysLeft(user?: {
  sports_module_expires_at?: string | null;
} | null): number | null {
  if (!user?.sports_module_expires_at) return null;
  const ms = new Date(user.sports_module_expires_at).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function hasActiveStoreUnlimited(user?: {
  store_unlimited_until?: string | null;
} | null): boolean {
  if (!user?.store_unlimited_until) return false;
  return new Date(user.store_unlimited_until).getTime() > Date.now();
}

export function storePublishCreditCost(user?: {
  credits?: number;
  is_unlimited_credits?: boolean;
  is_superuser?: boolean;
  store_unlimited_until?: string | null;
} | null): number {
  if (!user) return CREDIT_COSTS.store;
  if (user.is_unlimited_credits || user.is_superuser) return 0;
  if (hasActiveStoreUnlimited(user)) return 0;
  if ((user.credits ?? 0) >= CREDIT_COSTS.storeUnlimitedActivation) {
    return CREDIT_COSTS.storeUnlimitedActivation;
  }
  return CREDIT_COSTS.store;
}
