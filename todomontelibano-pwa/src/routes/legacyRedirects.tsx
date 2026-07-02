import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** Redirige rutas legacy /jobs/* → /empleos/* */
export const JobsLegacyRedirect: React.FC = () => {
  const location = useLocation();
  const { pathname, search } = location;

  const exact: Record<string, string> = {
    '/jobs': '/empleos',
    '/jobs/create': '/empleos/publicar',
    '/jobs/my_offers': '/empleos/mis-ofertas',
  };
  if (exact[pathname]) {
    return <Navigate to={exact[pathname] + search} replace />;
  }
  if (pathname.startsWith('/jobs/edit/')) {
    return <Navigate to={pathname.replace('/jobs/edit/', '/empleos/editar/') + search} replace />;
  }
  const detailMatch = pathname.match(/^\/jobs\/([^/]+)$/);
  if (detailMatch && detailMatch[1] !== 'create' && detailMatch[1] !== 'my_offers') {
    return <Navigate to={`/empleos/${detailMatch[1]}${search}`} replace />;
  }
  return <Navigate to="/empleos" replace />;
};

/** Redirige /sports → /deportes (subrutas deportivas permanecen bajo /deportes) */
export const SportsLegacyRedirect: React.FC = () => {
  const location = useLocation();
  const { pathname, search } = location;

  if (pathname === '/sports') {
    return <Navigate to="/deportes" replace />;
  }
  return <Navigate to={pathname.replace('/sports', '/deportes') + search} replace />;
};

/** Redirige /real-estate/* → /bienes-raices/* */
export const RealEstateLegacyRedirect: React.FC = () => {
  const location = useLocation();
  const { pathname, search } = location;

  const exact: Record<string, string> = {
    '/real-estate': '/bienes-raices',
    '/real-estate/my_listings': '/bienes-raices/mis-publicaciones',
    '/real-estate/create': '/bienes-raices/publicar',
  };
  if (exact[pathname]) {
    return <Navigate to={exact[pathname] + search} replace />;
  }
  if (pathname.startsWith('/real-estate/edit/')) {
    return <Navigate to={pathname.replace('/real-estate/edit/', '/bienes-raices/editar/') + search} replace />;
  }
  const detailMatch = pathname.match(/^\/real-estate\/([^/]+)$/);
  if (detailMatch) {
    return <Navigate to={`/bienes-raices/${detailMatch[1]}${search}`} replace />;
  }
  return <Navigate to="/bienes-raices" replace />;
};
