import { BRAND_DISPLAY_NAME } from './brand';

/** URL base del sitio (producción). Configurar en .env: VITE_SITE_URL */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://capisjdigital.site';
export const SITE_NAME = BRAND_DISPLAY_NAME;
export const SITE_LOCALE = 'es_CO';

/**
 * Imagen OG/Twitter (ideal 1200×630, HTTPS, URL directa al archivo).
 * Evitar enlaces tipo ibb.co/xxx (página HTML); usar i.ibb.co/.../archivo.jpg
 */
export const DEFAULT_OG_IMAGE =
  import.meta.env.VITE_OG_IMAGE ||
  'https://i.ibb.co/wZNxrY8t/CAPISJ-DIGITAL-logo-principal.jpg';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — Empleos, deportes, bienes raíces y eventos en Córdoba`;

export const DEFAULT_SEO_DESCRIPTION =
  `Plataforma integral ${SITE_NAME}: bolsa de empleo, torneos deportivos, propiedades inmobiliarias y eventos publicitarios en Córdoba, Colombia.`;


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
  creditos: '/creditos',
  tienda: '/tienda',
  tiendaProducto: (slug: string) => `/tienda/${slug}`,
  tiendaCarrito: '/tienda/carrito',
  tiendaCheckout: '/tienda/checkout',
  tiendaResultado: '/tienda/resultado',
  tiendaPedidos: '/tienda/pedidos',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
} as const;

/** Navegación principal para Schema.org SiteNavigationElement */
export const MAIN_NAV_ITEMS = [
  { name: 'Empleos', path: ROUTES.empleos, description: 'Bolsa de trabajo y vacantes' },
  { name: 'Deportes', path: ROUTES.deportes, description: 'Torneos y ligas locales' },
  { name: 'Tienda', path: ROUTES.tienda, description: 'Catálogo y compras locales' },
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

const brand = BRAND_DISPLAY_NAME;

export const SEO_PAGES: Record<string, SeoMeta> = {
  '/': {
    title: `${brand} | Empleos, Deportes, Bienes Raíces y Eventos en Córdoba`,
    description:
      `Plataforma integral ${brand}: bolsa de empleo, torneos deportivos, propiedades inmobiliarias y eventos publicitarios en Córdoba. Publica ferias, conciertos y activaciones de marca con visibilidad local.`,
    path: '/',
    ogType: 'website',
  },
  [ROUTES.empleos]: {
    title: `Bolsa de Empleo | Vacantes y Trabajo | ${brand}`,
    description:
      `Explora ofertas laborales en ${brand}. Postula a vacantes de empresas locales o publica empleos si eres reclutador.`,
    path: ROUTES.empleos,
    ogType: 'website',
  },
  [ROUTES.deportes]: {
    title: `Deportes y Torneos Locales | ${brand}`,
    description:
      'Consulta torneos de fútbol, softbol y más. Organiza ligas, equipos y calendarios deportivos en Córdoba.',
    path: ROUTES.deportes,
    ogType: 'website',
  },
  [ROUTES.bienesRaices]: {
    title: `Bienes Raíces | Propiedades en Venta y Alquiler | ${brand}`,
    description:
      `Encuentra casas, apartamentos y locales comerciales. Publica o contacta propietarios en el portal inmobiliario de ${brand}.`,
    path: ROUTES.bienesRaices,
    ogType: 'website',
  },
  [ROUTES.eventos]: {
    title: `Eventos Publicitarios | Ferias, Conciertos y Agenda Local | ${brand}`,
    description:
      `Descubre y publica eventos publicitarios en Córdoba: ferias, conciertos, activaciones de marca y networking con ${brand}.`,
    path: ROUTES.eventos,
    ogType: 'website',
  },
  [ROUTES.tienda]: {
    title: `Tienda | Catálogo de Productos | ${brand}`,
    description:
      `Explora el catálogo de productos locales en ${brand}. Filtra por categoría y compra con Mercado Pago.`,
    path: ROUTES.tienda,
    ogType: 'website',
  },
  [ROUTES.eventosPublicar]: {
    title: `Publicar Evento Publicitario | ${brand}`,
    description: `Publica tu feria, concierto o activación de marca en la agenda de ${brand}.`,
    path: ROUTES.eventosPublicar,
    noindex: true,
  },
  [ROUTES.eventosMisEventos]: {
    title: `Mis Eventos | ${brand}`,
    description: `Gestiona tus eventos publicados en ${brand}.`,
    path: ROUTES.eventosMisEventos,
    noindex: true,
  },
  [ROUTES.contact]: {
    title: `Contacto | ${brand}`,
    description: `Escríbenos con dudas, sugerencias o reportes sobre ${brand}.`,
    path: ROUTES.contact,
    ogType: 'website',
  },
  [ROUTES.login]: {
    title: `Iniciar Sesión | ${brand}`,
    description: `Accede a tu cuenta de ${brand}.`,
    path: ROUTES.login,
    noindex: true,
  },
  [ROUTES.register]: {
    title: `Crear Cuenta | ${brand}`,
    description: `Regístrate gratis en ${brand}.`,
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
  { path: ROUTES.tienda, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.contact, priority: 0.5, changefreq: 'monthly' as const },
  { path: ROUTES.privacy, priority: 0.3, changefreq: 'yearly' as const },
  { path: ROUTES.terms, priority: 0.3, changefreq: 'yearly' as const },
];

export const absoluteUrl = (path: string) =>
  `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

/** Quita sufijo " | MARCA" para pasar title base a SeoHead. */
export const stripSiteSuffix = (title: string) =>
  title.replace(new RegExp(` \\| ${SITE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
