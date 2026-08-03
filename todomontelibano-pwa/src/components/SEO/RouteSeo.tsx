import React from 'react';
import { useLocation } from 'react-router-dom';
import SeoHead from './SeoHead';
import { ROUTES, SEO_PAGES, stripSiteSuffix } from '../../config/seo';

/** Aplica metadatos según la ruta actual (rutas principales) */
const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();

  const path =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

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
  ];

  for (const { prefix, key } of sectionPrefixes) {
    if (path.startsWith(prefix)) {
      const meta = SEO_PAGES[key];
      return (
        <SeoHead
          title={stripSiteSuffix(meta.title)}
          description={meta.description}
          path={prefix}
          ogType={meta.ogType}
          noindex={path !== prefix}
        />
      );
    }
  }

  return null;
};

export default RouteSeo;
