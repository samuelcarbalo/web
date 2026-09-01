import React from 'react';
import { Link } from 'react-router-dom';
import brandMark from '../../assets/chever-logo.svg';
import brandOficial from '../../assets/chever_oficial.svg';
import { BRAND_DISPLAY_NAME, BRAND_LOGO_IMG_CLASS } from '../../config/brand';

export type BrandLogoVariant = 'oficial' | 'mark';

/** Dimensiones intrínsecas para reservar espacio (CLS) antes de aplicar Tailwind. */
const INTRINSIC: Record<BrandLogoVariant, { width: number; height: number }> = {
  oficial: { width: 180, height: 48 },
  mark: { width: 160, height: 87 },
};

type BrandLogoProps = {
  /** Image size classes (Tailwind). */
  className?: string;
  /** Wrap logo in a link to home. */
  linkToHome?: boolean;
  /** Tooltip del enlace al inicio. */
  title?: string;
  /**
   * oficial — wordmark (Navbar, auth, footer, PWA)
   * mark — isotipo (loaders, empty states, hero decor)
   */
  variant?: BrandLogoVariant;
  /** Override intrínseco width (opcional). */
  width?: number;
  /** Override intrínseco height (opcional). */
  height?: number;
};

/**
 * Marca Chever. En dark mode el SVG negro se invierte a blanco.
 * Siempre declara width/height HTML para evitar CLS en Lighthouse.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-12 w-auto max-w-[200px]',
  linkToHome = true,
  title = 'Ir al inicio',
  variant = 'oficial',
  width,
  height,
}) => {
  const src = variant === 'mark' ? brandMark : brandOficial;
  const intrinsic = INTRINSIC[variant];

  const img = (
    <img
      src={src}
      alt={BRAND_DISPLAY_NAME}
      width={width ?? intrinsic.width}
      height={height ?? intrinsic.height}
      decoding="async"
      className={`${BRAND_LOGO_IMG_CLASS} mx-auto ${className}`}
    />
  );

  if (!linkToHome) return img;

  return (
    <Link
      to="/"
      title={title}
      className="inline-flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 rounded-xl"
      aria-label={`${BRAND_DISPLAY_NAME} — inicio`}
    >
      {img}
    </Link>
  );
};

export default BrandLogo;
