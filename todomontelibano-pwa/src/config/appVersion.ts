/** Versión de app para invalidar caches del navegador tras un deploy. */
export const APP_VERSION = '1.0.2';

/** Query param para assets estáticos en /public (SVG/PNG sin hash de Vite). */
export const ASSET_VERSION = '1.1';

export const assetUrl = (path: string) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const sep = clean.includes('?') ? '&' : '?';
  return `${clean}${sep}v=${ASSET_VERSION}`;
};
