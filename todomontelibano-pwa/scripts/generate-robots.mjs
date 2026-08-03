/**
 * Genera public/robots.txt con la URL del sitemap según VITE_SITE_URL (.env).
 * Ejecutar antes del build: npm run prebuild
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadSiteUrl() {
  const envPath = resolve(root, '.env');
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, 'utf8').match(/^VITE_SITE_URL=(.+)$/m);
    if (match?.[1]) return match[1].trim().replace(/\/$/, '');
  }
  return 'https://capisjdigital.site';
}

const siteUrl = loadSiteUrl();

const robots = `User-agent: *
Allow: /

Disallow: /login
Disallow: /register
Disallow: /dashboard
Disallow: /profile
Disallow: /applications
Disallow: /messages
Disallow: /creditos

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(resolve(root, 'public/robots.txt'), robots, 'utf8');
console.log(`robots.txt generado → Sitemap: ${siteUrl}/sitemap.xml`);
