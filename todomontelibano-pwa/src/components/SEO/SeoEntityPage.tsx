import React from 'react';
import SeoHead from './SeoHead';
import JsonLd from './JsonLd';
import { SITE_NAME } from '../../config/seo';

export interface SeoEntityPageProps {
  /** Título del recurso (ej. nombre del empleo). */
  title: string;
  description: string;
  /** Ruta canónica, ej. /empleos/uuid */
  path: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  isLoading?: boolean;
  isError?: boolean;
  /** Metadatos mínimos mientras carga (evita HTML vacío para crawlers). */
  fallbackTitle?: string;
  fallbackDescription?: string;
  noindex?: boolean;
}

/**
 * Envoltorio SEO para páginas de detalle alimentadas por Django REST.
 * Renderiza meta + JSON-LD incluso en loading/error con fallbacks.
 */
const SeoEntityPage: React.FC<SeoEntityPageProps> = ({
  title,
  description,
  path,
  ogType = 'article',
  ogImage,
  jsonLd,
  isLoading = false,
  isError = false,
  fallbackTitle = `Contenido | ${SITE_NAME}`,
  fallbackDescription = `Información en ${SITE_NAME}. Empleos, deportes, bienes raíces y eventos en Córdoba.`,
  noindex = false,
}) => {
  const resolvedTitle =
    isError ? `No encontrado | ${SITE_NAME}` : isLoading ? fallbackTitle : title;

  const resolvedDescription =
    isError
      ? 'El recurso solicitado no está disponible.'
      : isLoading
        ? fallbackDescription
        : description;

  return (
    <>
      <SeoHead
        title={resolvedTitle}
        description={resolvedDescription}
        path={path}
        ogType={ogType}
        ogImage={ogImage}
        noindex={noindex || isError}
      />
      {jsonLd && !isLoading && !isError && <JsonLd data={jsonLd} />}
    </>
  );
};

export default SeoEntityPage;
