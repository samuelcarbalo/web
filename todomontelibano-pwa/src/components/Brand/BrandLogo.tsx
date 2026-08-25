import React from 'react';
import { Link } from 'react-router-dom';
import brandMark from '../../assets/chever-logo.svg';
import brandOficial from '../../assets/chever_oficial.svg';
import { BRAND_DISPLAY_NAME, BRAND_LOGO_IMG_CLASS } from '../../config/brand';

export type BrandLogoVariant = 'oficial' | 'mark';

type BrandLogoProps = {
  /** Image size classes (Tailwind). */
  className?: string;
  /** Wrap logo in a link to home. */
  linkToHome?: boolean;
  /**
   * oficial — wordmark (Navbar, auth, footer, PWA)
   * mark — isotipo (loaders, empty states, hero decor)
   */
  variant?: BrandLogoVariant;
};

/**
 * Marca Chever. En dark mode el SVG negro se invierte a blanco.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-12 w-auto max-w-[200px]',
  linkToHome = true,
  variant = 'oficial',
}) => {
  const src = variant === 'mark' ? brandMark : brandOficial;

  const img = (
    <img
      src={src}
      alt={BRAND_DISPLAY_NAME}
      className={`${BRAND_LOGO_IMG_CLASS} mx-auto ${className}`}
    />
  );

  if (!linkToHome) return img;

  return (
    <Link
      to="/"
      className="inline-flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 rounded-xl"
      aria-label={`${BRAND_DISPLAY_NAME} — inicio`}
    >
      {img}
    </Link>
  );
};

export default BrandLogo;
