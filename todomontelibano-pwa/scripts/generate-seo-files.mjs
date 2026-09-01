/**
 * Genera public/robots.txt y public/sitemap.xml (solo URLs canónicas 200 OK).
 * Excluye archivos de verificación de Google y rutas técnicas.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRobotsTxt, buildSitemapXml } from './seoPublicRoutes.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const robots = buildRobotsTxt();
const sitemap = buildSitemapXml();

writeFileSync(resolve(root, 'public/robots.txt'), robots, 'utf8');
writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8');

console.log('SEO files → public/robots.txt, public/sitemap.xml (9 URLs canónicas, sin /google*)');
