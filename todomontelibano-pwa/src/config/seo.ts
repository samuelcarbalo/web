import { BRAND_DISPLAY_NAME } from './brand';

/** Origen canónico oficial (HTTPS, sin www). Las etiquetas SEO siempre apuntan aquí. */
export const CANONICAL_ORIGIN = 'https://chever.co';

/** URL base del sitio (producción). Configurar en .env: VITE_SITE_URL */
export const SITE_URL = CANONICAL_ORIGIN;
export const SITE_NAME = BRAND_DISPLAY_NAME;
export const SITE_LOCALE = 'es_CO';

/**
 * Imagen OG/Twitter (ideal 1200×630, HTTPS, URL directa al archivo).
 * Evitar enlaces tipo ibb.co/xxx (página HTML); usar i.ibb.co/.../archivo.jpg
 */
export const DEFAULT_OG_IMAGE =
  import.meta.env.VITE_OG_IMAGE || `${SITE_URL.replace(/\/$/, '')}/chever_oficial.svg?v=1.3`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — Empleos, deportes, bienes raíces y eventos en Córdoba`;

export const DEFAULT_SEO_DESCRIPTION =
  'Explora productos en la tienda, encuentra oportunidades laborales y participa en torneos deportivos en Montelíbano y Córdoba.';

export const SEO_KEYWORDS =
  'Chéver, Chever deportes, torneos Córdoba, empleos Córdoba, Chéver app, plataforma Córdoba Colombia';


/** Rutas canónicas SEO (español) */
export const ROUTES = {
  home: '/',
  empleos: '/empleos',
  empleosDetail: (id: string) => `/empleos/${id}`,
  empleosCreate: '/empleos/publicar',
  empleosMyOffers: '/empleos/mis-ofertas',
  deportes: '/deportes',
  deportesCreate: '/deportes/tournaments/create',
  bienesRaices: '/bienes-raices',
  bienesRaicesDetail: (id: string) => `/bienes-raices/${id}`,
  bienesRaicesCreate: '/bienes-raices/publicar',
  eventos: '/eventos',
  eventosDetail: (slug: string) => `/eventos/${slug}`,
  eventosPublicar: '/eventos/publicar',
  eventosMisEventos: '/eventos/mis-eventos',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  recuperarContrasena: '/recuperar-contrasena',
  resetPassword: '/reset-password',
  creditos: '/creditos',
  tienda: '/tienda',
  tiendaCreate: '/tienda/publicar',
  tiendaEdit: (slug: string) => `/tienda/editar/${slug}`,
  tiendaProducto: (slug: string) => `/tienda/${slug}`,
  tiendaCarrito: '/tienda/carrito',
  tiendaCheckout: '/tienda/checkout',
  tiendaResultado: '/tienda/resultado',
  tiendaPedidos: '/tienda/pedidos',
  tiendaMisProductos: '/dashboard/tienda/mis-productos',
  dashboardTienda: '/dashboard/tienda',
  facturas: '/facturas',
  facturacion: '/dashboard/facturacion',
  adminUsers: '/dashboard/admin',
  adminCredits: '/dashboard/admin?focus=credits',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
} as const;

/** Navegación principal para Schema.org SiteNavigationElement */
export const MAIN_NAV_ITEMS = [
  { name: 'Tienda', path: ROUTES.tienda, description: 'Catálogo y compras locales' },
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

const brand = BRAND_DISPLAY_NAME;

export const SEO_PAGES: Record<string, SeoMeta> = {
  '/': {
    title: `${brand} | Comercio, Empleos y Deportes en Córdoba`,
    description: DEFAULT_SEO_DESCRIPTION,
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
  [ROUTES.privacy]: {
    title: `Política de Privacidad | ${brand}`,
    description: `Cómo ${brand} trata tus datos personales.`,
    path: ROUTES.privacy,
  },
  [ROUTES.terms]: {
    title: `Términos de Servicio | ${brand}`,
    description: `Condiciones de uso de la plataforma ${brand}.`,
    path: ROUTES.terms,
  },
  [ROUTES.creditos]: {
    title: `Créditos | Publica en ${brand}`,
    description: `Compra créditos para publicar empleos, inmuebles, eventos y torneos en ${brand}.`,
    path: ROUTES.creditos,
    noindex: true,
  },
  [ROUTES.tiendaCarrito]: {
    title: `Carrito | ${brand}`,
    description: `Revisa los productos de tu carrito en la tienda de ${brand}.`,
    path: ROUTES.tiendaCarrito,
    noindex: true,
  },
  [ROUTES.tiendaCheckout]: {
    title: `Checkout | ${brand}`,
    description: `Finaliza tu compra en ${brand} con Mercado Pago.`,
    path: ROUTES.tiendaCheckout,
    noindex: true,
  },
  [ROUTES.tiendaResultado]: {
    title: `Resultado de pago | ${brand}`,
    description: `Estado de tu pedido en ${brand}.`,
    path: ROUTES.tiendaResultado,
    noindex: true,
  },
  [ROUTES.tiendaPedidos]: {
    title: `Mis pedidos | ${brand}`,
    description: `Historial de compras en ${brand}.`,
    path: ROUTES.tiendaPedidos,
    noindex: true,
  },
  '/dashboard': {
    title: `Panel | ${brand}`,
    description: `Tu panel de ${brand}.`,
    path: '/dashboard',
    noindex: true,
  },
  '/profile': {
    title: `Perfil | ${brand}`,
    description: `Gestiona tu perfil en ${brand}.`,
    path: '/profile',
    noindex: true,
  },
  '/applications': {
    title: `Postulaciones | ${brand}`,
    description: `Tus postulaciones en ${brand}.`,
    path: '/applications',
    noindex: true,
  },
  '/messages': {
    title: `Mensajes | ${brand}`,
    description: `Bandeja de mensajes de ${brand}.`,
    path: '/messages',
    noindex: true,
  },
};

/** Rutas del sitemap con prioridad (solo URLs canónicas indexables). */
export const SITEMAP_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' as const },
  { path: ROUTES.tienda, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.deportes, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.empleos, priority: 0.9, changefreq: 'daily' as const },
  { path: ROUTES.bienesRaices, priority: 0.8, changefreq: 'daily' as const },
  { path: ROUTES.eventos, priority: 0.8, changefreq: 'weekly' as const },
  { path: ROUTES.contact, priority: 0.5, changefreq: 'monthly' as const },
  { path: ROUTES.privacy, priority: 0.3, changefreq: 'yearly' as const },
  { path: ROUTES.terms, priority: 0.3, changefreq: 'yearly' as const },
];

const NOINDEX_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/recuperar-contrasena',
  '/reset-password',
  '/dashboard',
  '/profile',
  '/applications',
  '/messages',
  '/creditos',
  '/admin',
  '/api',
  '/empleos/publicar',
  '/empleos/editar',
  '/empleos/mis-ofertas',
  '/tienda/publicar',
  '/tienda/editar',
  '/tienda/carrito',
  '/tienda/checkout',
  '/tienda/resultado',
  '/tienda/pedidos',
  '/facturas',
  '/deportes/my_tournaments',
  '/deportes/tournaments/create',
  '/eventos/publicar',
  '/eventos/mis-eventos',
  '/bienes-raices/publicar',
  '/bienes-raices/editar',
  '/bienes-raices/mis-publicaciones',
] as const;

export const canonicalizePath = (pathname: string): string => {
  const raw = (pathname || '/').split('?')[0].split('#')[0];
  if (!raw || raw === '/') return '/';
  return raw.replace(/\/+$/, '') || '/';
};

export const buildCanonicalUrl = (pathname: string): string => {
  const path = canonicalizePath(pathname);
  return path === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${path}`;
};

export const isNoindexPath = (pathname: string): boolean => {
  const path = canonicalizePath(pathname);
  if (SEO_PAGES[path]?.noindex) return true;
  if (path.includes('/editar/') || path.endsWith('/edit') || path.includes('/edit/')) return true;
  return NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

export const absoluteUrl = (path: string) => buildCanonicalUrl(path);

/** Quita sufijo " | MARCA" o prefijo "MARCA - " para pasar title base a SeoHead. */
export const stripSiteSuffix = (title: string) => {
  const escaped = SITE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`^${escaped} - `).test(title)) {
    return title;
  }
  return title.replace(new RegExp(` \\| ${escaped}$`), '');
};
