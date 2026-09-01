/** Origen canónico oficial: HTTPS, sin www. */
export const CANONICAL_ORIGIN = 'https://chever.co';

const DESCRIPTION =
  'Explora productos en la tienda, encuentra oportunidades laborales y participa en torneos deportivos en Montelíbano y Córdoba.';

/**
 * Únicas URLs que deben vivir en sitemap.xml (200 OK, indexables).
 * Nunca incluir /google*.html ni rutas técnicas.
 */
export const SITEMAP_ROUTES = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    title: 'Chéver | Comercio, Empleos y Deportes en Córdoba',
    description: DESCRIPTION,
    h1: 'Conectamos el talento, el comercio y el deporte de Córdoba en un solo lugar.',
    h2: 'La plataforma de la comunidad en Montelíbano',
    body: 'Organiza torneos, encuentra empleo, explora productos locales y conecta con ofertas exclusivas en Córdoba, Colombia.',
    prerender: true,
  },
  {
    path: '/tienda',
    changefreq: 'daily',
    priority: '0.9',
    title: 'Tienda | Productos locales | Chéver',
    description:
      'Explora el catálogo de productos locales en la tienda Chéver. Ofertas y comercios de Montelíbano y Córdoba. Compra con Mercado Pago.',
    h1: 'Tienda local de Montelíbano y Córdoba',
    h2: 'Productos, comercios y ofertas cerca de ti',
    body: 'Navega el catálogo de la comunidad, filtra por categoría y compra productos locales con pago seguro.',
    prerender: true,
  },
  {
    path: '/deportes',
    changefreq: 'daily',
    priority: '0.9',
    title: 'Deportes y torneos | Chéver',
    description:
      'Consulta torneos de fútbol, softbol y béisbol en Córdoba. Calendario, equipos y ligas locales en Chéver.',
    h1: 'Torneos y deportes en Córdoba',
    h2: 'Fútbol, softbol y béisbol de la comunidad',
    body: 'Sigue partidos activos, inscribe tu equipo y organiza ligas regionales desde un solo lugar.',
    prerender: true,
  },
  {
    path: '/empleos',
    changefreq: 'daily',
    priority: '0.9',
    title: 'Empleos | Vacantes en Córdoba | Chéver',
    description:
      'Encuentra oportunidades laborales en Montelíbano y Córdoba. Bolsa de empleo local de Chéver para empresas y candidatos.',
    h1: 'Bolsa de empleo en Córdoba',
    h2: 'Vacantes recientes en Montelíbano y la región',
    body: 'Postula a ofertas de empresas locales o publica vacantes si contratas talento en Córdoba.',
    prerender: true,
  },
  {
    path: '/bienes-raices',
    changefreq: 'daily',
    priority: '0.8',
    title: 'Bienes raíces | Propiedades en Córdoba | Chéver',
    description:
      'Casas, apartamentos, locales y terrenos en venta y arriendo en Montelíbano y Córdoba.',
    h1: 'Bienes raíces en Córdoba',
    h2: 'Propiedades en venta y arriendo',
    body: 'Explora inmuebles locales y contacta a propietarios de forma directa.',
    prerender: true,
  },
  {
    path: '/eventos',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Eventos | Agenda local | Chéver',
    description:
      'Ferias, conciertos y activaciones de marca en Córdoba. Agenda de eventos publicitarios de Chéver.',
    h1: 'Eventos y agenda local',
    h2: 'Ferias, conciertos y activaciones en Córdoba',
    body: 'Descubre qué ocurre en Montelíbano y publica tu evento para llegar a la comunidad.',
    prerender: true,
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: '0.5',
    title: 'Contacto | Chéver',
    description: 'Escríbenos con dudas, sugerencias o reportes sobre la plataforma Chéver en Córdoba.',
    h1: 'Contacto',
    h2: 'Habla con el equipo de Chéver',
    body: 'Envíanos un mensaje sobre empleos, tienda, deportes o soporte de la plataforma.',
    prerender: true,
  },
  {
    path: '/privacy',
    changefreq: 'yearly',
    priority: '0.3',
    title: 'Política de privacidad | Chéver',
    description: 'Cómo Chéver trata tus datos personales en Córdoba, Colombia.',
    h1: 'Política de privacidad',
    h2: 'Tus datos en Chéver',
    body: 'Consulta cómo recolectamos, usamos y protegemos la información de la comunidad.',
    prerender: true,
  },
  {
    path: '/terms',
    changefreq: 'yearly',
    priority: '0.3',
    title: 'Términos de servicio | Chéver',
    description: 'Condiciones de uso de la plataforma Chéver.',
    h1: 'Términos de servicio',
    h2: 'Condiciones de uso',
    body: 'Revisa las reglas para publicar, comprar y participar en Chéver.',
    prerender: true,
  },
];

export const PRERENDER_ROUTES = SITEMAP_ROUTES.filter((route) => route.prerender);

export function canonicalUrl(path) {
  const clean = path === '/' ? '/' : path.replace(/\/+$/, '');
  return clean === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${clean}`;
}

export function buildSitemapXml(now = new Date()) {
  const lastmod = now.toISOString().slice(0, 10);
  const urls = SITEMAP_ROUTES.map((route) => {
    return `  <url>
    <loc>${canonicalUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`;
}

export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function prerenderShell(route) {
  const title = escapeHtml(route.h1);
  const h2 = escapeHtml(route.h2);
  const body = escapeHtml(route.body);
  return `<main id="prerender-shell" style="font-family:system-ui,sans-serif;max-width:48rem;margin:0 auto;padding:2.5rem 1.25rem;color:#0f172a;line-height:1.6">
  <p style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:.75rem;color:#0f766e;margin:0 0 .75rem">Chéver · Montelíbano, Córdoba</p>
  <h1 style="font-size:clamp(1.75rem,4vw,2.75rem);line-height:1.15;margin:0 0 1rem">${title}</h1>
  <h2 style="font-size:1.15rem;font-weight:700;margin:0 0 .75rem;color:#334155">${h2}</h2>
  <p style="margin:0 0 1.5rem;font-size:1.05rem">${body}</p>
  <nav aria-label="Secciones principales">
    <ul style="padding-left:1.2rem">
      <li><a href="/tienda">Tienda</a></li>
      <li><a href="/empleos">Empleos</a></li>
      <li><a href="/deportes">Deportes</a></li>
      <li><a href="/bienes-raices">Bienes raíces</a></li>
      <li><a href="/eventos">Eventos</a></li>
    </ul>
  </nav>
</main>`;
}
