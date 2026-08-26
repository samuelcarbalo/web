/** Versión de app para invalidar Cache Storage tras un deploy (sin reload loop). */
export const APP_VERSION = '1.0.3';

/** Query param para assets estáticos en /public (SVG/PNG sin hash de Vite). */
export const ASSET_VERSION = '1.2';

export const assetUrl = (path: string) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const sep = clean.includes('?') ? '&' : '?';
  return `${clean}${sep}v=${ASSET_VERSION}`;
};
