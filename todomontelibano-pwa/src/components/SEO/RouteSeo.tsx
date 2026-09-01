import React from 'react';
import { useLocation } from 'react-router-dom';
import SeoHead from './SeoHead';
import {
  canonicalizePath,
  DEFAULT_SEO_DESCRIPTION,
  isNoindexPath,
  ROUTES,
  SEO_PAGES,
  SITE_NAME,
  stripSiteSuffix,
} from '../../config/seo';

/** Aplica metadatos según la ruta actual. Nunca deja una pestaña sin title/description. */
const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();
  const path = canonicalizePath(pathname);

  const exact = SEO_PAGES[path];
  if (exact) {
    return (
      <SeoHead
        title={stripSiteSuffix(exact.title)}
        description={exact.description}
        path={exact.path}
        ogType={exact.ogType}
        noindex={exact.noindex}
      />
    );
  }

  const sectionPrefixes: { prefix: string; key: string }[] = [
    { prefix: ROUTES.empleos, key: ROUTES.empleos },
    { prefix: ROUTES.deportes, key: ROUTES.deportes },
    { prefix: ROUTES.bienesRaices, key: ROUTES.bienesRaices },
    { prefix: ROUTES.eventos, key: ROUTES.eventos },
    { prefix: ROUTES.tienda, key: ROUTES.tienda },
    { prefix: ROUTES.creditos, key: ROUTES.creditos },
    { prefix: '/dashboard', key: '/dashboard' },
    { prefix: '/profile', key: '/profile' },
    { prefix: '/applications', key: '/applications' },
    { prefix: '/messages', key: '/messages' },
  ];

  for (const { prefix, key } of sectionPrefixes) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      const meta = SEO_PAGES[key];
      if (!meta) continue;
      return (
        <SeoHead
          title={stripSiteSuffix(meta.title)}
          description={meta.description}
          path={path}
          ogType={meta.ogType}
          noindex={meta.noindex || isNoindexPath(path)}
        />
      );
    }
  }

  return (
    <SeoHead
      title={SITE_NAME}
      description={DEFAULT_SEO_DESCRIPTION}
      path={path}
    />
  );
};

export default RouteSeo;
