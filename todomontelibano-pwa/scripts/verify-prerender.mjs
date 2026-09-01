/**
 * Comprueba que el build dejó HTML legible por ruta (Googlebot no depende de <noscript>).
 * Uso: node scripts/verify-prerender.mjs
 * Opcional: VERIFY_SEO_LIVE=1 para curl https://chever.co/tienda con UA Googlebot.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRERENDER_ROUTES, canonicalUrl } from './seoPublicRoutes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

function htmlPath(routePath) {
  return routePath === '/' ? join(distDir, 'index.html') : join(distDir, routePath.slice(1), 'index.html');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function verifyFile(route) {
  const file = htmlPath(route.path);
  assert(existsSync(file), `Falta HTML prerenderizado: ${file}`);
  const html = readFileSync(file, 'utf8');
  const canonical = canonicalUrl(route.path);

  assert(html.includes(`<title>${route.title}</title>`), `${route.path}: title incorrecto`);
  assert(html.includes(`content="${route.description}"`), `${route.path}: description ausente`);
  assert(html.includes('name="robots" content="index, follow"'), `${route.path}: robots incorrecto`);
  assert(html.includes(`rel="canonical" href="${canonical}"`), `${route.path}: canonical incorrecto`);
  assert(html.includes('<h1'), `${route.path}: falta H1 visible`);
  assert(html.includes('<h2'), `${route.path}: falta H2 visible`);
  assert(html.includes(route.body.slice(0, 24)), `${route.path}: falta texto visible`);
  assert(!html.includes('Activa JavaScript'), `${route.path}: todavía pide activar JavaScript`);
  const noscriptIdx = html.indexOf('<noscript>');
  const h1Idx = html.indexOf('<h1');
  assert(h1Idx !== -1 && (noscriptIdx === -1 || h1Idx < noscriptIdx || !html.includes('<noscript>')), `${route.path}: el contenido visible no debe vivir solo en noscript`);
  console.log(`ok  ${route.path} → ${file.replace(root, '.')}`);
}

function verifySitemap() {
  const file = join(distDir, 'sitemap.xml');
  assert(existsSync(file), 'Falta dist/sitemap.xml');
  const xml = readFileSync(file, 'utf8');
  assert(!xml.includes('google2d8cfb01b92b319a'), 'sitemap.xml todavía incluye la verificación de Google');
  assert(!xml.includes('/google'), 'sitemap.xml no debe listar /google*');
  for (const route of PRERENDER_ROUTES) {
    assert(xml.includes(`<loc>${canonicalUrl(route.path)}</loc>`), `sitemap.xml sin ${route.path}`);
  }
  console.log('ok  sitemap.xml sin archivo de verificación y con URLs canónicas');
}

async function verifyLiveGooglebot() {
  if (process.env.VERIFY_SEO_LIVE !== '1') {
    console.log('skip curl live (define VERIFY_SEO_LIVE=1 para probar producción)');
    return;
  }
  const url = 'https://chever.co/tienda';
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  });
  const html = await response.text();
  assert(response.ok, `Googlebot ${url} → HTTP ${response.status}`);
  assert(html.includes('<h1'), `Googlebot ${url} no trajo H1`);
  assert(!html.includes('Activa JavaScript'), `Googlebot ${url} todavía muestra el aviso de JavaScript`);
  console.log(`ok  curl -A Googlebot ${url} (${html.length} bytes)`);
}

try {
  assert(existsSync(distDir), 'No existe dist/. Ejecuta npm run build primero.');
  for (const route of PRERENDER_ROUTES) {
    verifyFile(route);
  }
  verifySitemap();
  await verifyLiveGooglebot();
  console.log('\nPrerender SEO: todas las rutas públicas tienen HTML legible.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
