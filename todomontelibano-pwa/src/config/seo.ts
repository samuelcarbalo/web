/** URL base del sitio (producción). Configurar en .env: VITE_SITE_URL */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://cordobatech.com';
export const SITE_NAME = 'NissigDigital';
export const SITE_LOCALE = 'es_CO';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512x512.png`;

/** Rutas canónicas SEO (español) */
export const ROUTES = {
  home: '/',
  empleos: '/empleos',
  empleosDetail: (id: string) => `/empleos/${id}`,
  empleosCreate: '/empleos/publicar',
  empleosMyOffers: '/empleos/mis-ofertas',
  deportes: '/deportes',
  bienesRaices: '/bienes-raices',
  bienesRaicesDetail: (id: string) => `/bienes-raices/${id}`,
  eventos: '/eventos',
  eventosDetail: (slug: string) => `/eventos/${slug}`,
  eventosPublicar: '/eventos/publicar',
  eventosMisEventos: '/eventos/mis-eventos',
  login: '/login',
  register: '/register',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
} as const;

/** Navegación principal para Schema.org SiteNavigationElement */
export const MAIN_NAV_ITEMS = [
  { name: 'Empleos', path: ROUTES.empleos, description: 'Bolsa de trabajo y vacantes' },
  { name: 'Deportes', path: ROUTES.deportes, description: 'Torneos y ligas locales' },
  { name: 'Bienes Raíces', path: ROUTES.bienesRaices, description: 'Propiedades en venta y alquiler' },
  {
    name: 'Eventos publicitarios',
    path: ROUTES.eventos,
    description: 'Ferias, conciertos, activaciones de marca y agenda local con publicidad',
  },
] as const;

export interface SeoMeta {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  noindex?: boolean;
}

export const SEO_PAGES: Record<string, SeoMeta> = {
  '/': {
    title: 'NissigDigital | Empleos, Deportes, Bienes Raíces y Eventos en Córdoba',
    description:
      'Plataforma integral de NissigDigital: bolsa de empleo, torneos deportivos, propiedades inmobiliarias y eventos publicitarios. Publica ferias, conciertos y activaciones de marca con visibilidad local.',
    path: '/',
    ogType: 'website',
  },
  [ROUTES.empleos]: {
    title: 'Bolsa de Empleo | Vacantes y Trabajo | NissigDigital',
    description:
      'Explora ofertas laborales en NissigDigital. Postula a vacantes de empresas locales o publica empleos si eres reclutador.',
    path: ROUTES.empleos,
    ogType: 'website',
  },
  [ROUTES.deportes]: {
    title: 'Deportes y Torneos Locales | NissigDigital',
    description:
      'Consulta torneos de fútbol, softbol y más. Organiza ligas, equipos y calendarios deportivos en tu región.',
    path: ROUTES.deportes,
    ogType: 'website',
  },
  [ROUTES.bienesRaices]: {
    title: 'Bienes Raíces | Propiedades en Venta y Alquiler | NissigDigital',
    description:
      'Encuentra casas, apartamentos y locales comerciales. Publica o contacta propietarios en el portal inmobiliario de NissigDigital.',
    path: ROUTES.bienesRaices,
    ogType: 'website',
  },
  [ROUTES.eventos]: {
    title: 'Eventos Publicitarios | Ferias, Conciertos y Agenda Local | NissigDigital',
    description:
      'Descubre y publica eventos publicitarios: ferias, conciertos, activaciones de marca, networking y agenda cultural. Aumenta la visibilidad de tu evento con campañas en NissigDigital.',
    path: ROUTES.eventos,
    ogType: 'website',
  },
  [ROUTES.eventosPublicar]: {
    title: 'Publicar Evento Publicitario | NissigDigital',
    description: 'Publica tu feria, concierto o activación de marca en la agenda de NissigDigital.',
    path: ROUTES.eventosPublicar,
    noindex: true,
  },
  [ROUTES.eventosMisEventos]: {
    title: 'Mis Eventos | NissigDigital',
    description: 'Gestiona tus eventos publicados en NissigDigital.',
    path: ROUTES.eventosMisEventos,
    noindex: true,
  },
  [ROUTES.contact]: {
    title: 'Contacto | NissigDigital',
    description: 'Escríbenos con dudas, sugerencias o reportes sobre NissigDigital.',
    path: ROUTES.contact,
    ogType: 'website',
  },
  [ROUTES.login]: {
    title: 'Iniciar Sesión | NissigDigital',
    description: 'Accede a tu cuenta de NissigDigital.',
    path: ROUTES.login,
    noindex: true,
  },
  [ROUTES.register]: {
    title: 'Crear Cuenta | NissigDigital',
    description: 'Regístrate gratis en NissigDigital.',
    path: ROUTES.register,
    noindex: true,
  },
};

/** Rutas del sitemap con prioridad */
export const SITEMAP_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' as const },
  { path: ROUTES.empleos, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.deportes, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.bienesRaices, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.eventos, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.contact, priority: 0.5, changefreq: 'monthly' as const },
  { path: ROUTES.privacy, priority: 0.3, changefreq: 'yearly' as const },
  { path: ROUTES.terms, priority: 0.3, changefreq: 'yearly' as const },
];

export const absoluteUrl = (path: string) =>
  `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
