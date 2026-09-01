import { useLocation } from 'react-router-dom';
import { buildCanonicalUrl, canonicalizePath } from '../config/seo';

/**
 * URL canónica limpia: HTTPS, dominio oficial sin www, sin query ni slash final.
 * Úsala en Helmet / JSON-LD para que Google no consolide rutas SPA hacia el home.
 */
export function useCanonicalUrl(overridePath?: string): { path: string; href: string } {
  const { pathname } = useLocation();
  const path = canonicalizePath(overridePath ?? pathname);
  return { path, href: buildCanonicalUrl(path) };
}
