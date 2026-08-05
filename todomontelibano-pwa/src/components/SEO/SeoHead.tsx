import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_SEO_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  type SeoMeta,
} from '../../config/seo';

interface SeoHeadProps extends Partial<SeoMeta> {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  children?: React.ReactNode;
}

const SeoHead: React.FC<SeoHeadProps> = ({
  title = SITE_NAME,
  description = DEFAULT_SEO_DESCRIPTION,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  children,
}) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const image = ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="es" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content={String(DEFAULT_OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(DEFAULT_OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={DEFAULT_OG_IMAGE_ALT} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={DEFAULT_OG_IMAGE_ALT} />

      {children}
    </Helmet>
  );
};

export default SeoHead;
