/**
 * Post-Vite: genera HTML estático por ruta pública para Googlebot.
 * Se ejecuta DESPUÉS de `vite build` (no en closeBundle paralelo al PWA).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PRERENDER_ROUTES,
  buildSitemapXml,
  canonicalUrl,
  escapeHtml,
  prerenderShell,
} from './seoPublicRoutes.mjs';

function replaceOnce(source, pattern, replacement) {
  if (!pattern.test(source)) {
    throw new Error(`Prerender: no se encontró el patrón ${pattern}`);
  }
  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

function applyRouteToHtml(template, route) {
  const canonical = canonicalUrl(route.path);
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const shell = prerenderShell(route);

  let html = template;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );
  html = replaceOnce(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    '<meta name="robots" content="index, follow" />',
  );
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  );

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.title,
    description: route.description,
    url: canonical,
    isPartOf: { '@id': 'https://chever.co/#website' },
    about: { '@id': 'https://chever.co/#organization' },
  };
  const schemaTag = `<script type="application/ld+json" id="ld-page">${JSON.stringify(pageSchema)}</script>`;
  if (html.includes('id="ld-page"')) {
    html = html.replace(
      /<script type="application\/ld\+json" id="ld-page">[\s\S]*?<\/script>/,
      schemaTag,
    );
  } else {
    html = html.replace('</head>', `    ${schemaTag}\n  </head>`);
  }

  html = replaceOnce(
    html,
    /<!--prerender-start-->[\s\S]*?<!--prerender-end-->/,
    `<!--prerender-start-->\n        ${shell}\n        <!--prerender-end-->`,
  );

  return html;
}

const distDir = join(process.cwd(), 'dist');
const templatePath = join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf8');

if (!template.includes('<title>') || !template.includes('<!--prerender-start-->')) {
  throw new Error('dist/index.html no tiene las marcas SEO esperadas. ¿falló vite build?');
}

for (const route of PRERENDER_ROUTES) {
  const html = applyRouteToHtml(template, route);
  if (route.path === '/') {
    writeFileSync(templatePath, html, 'utf8');
  } else {
    const dir = join(distDir, route.path.replace(/^\//, ''));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html, 'utf8');
  }
  console.log(`prerender → dist${route.path === '/' ? '/index.html' : `${route.path}/index.html`}`);
}

writeFileSync(join(distDir, 'sitemap.xml'), buildSitemapXml(), 'utf8');
console.log('prerender → dist/sitemap.xml (sin /google*)');
