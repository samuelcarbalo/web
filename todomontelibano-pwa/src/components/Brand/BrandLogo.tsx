import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../../assets/CAPISJ_DIGITAL_logo_principal.svg';
import { BRAND_DISPLAY_NAME } from '../../config/brand';

type BrandLogoProps = {
  /** Image height in Tailwind units (default h-12). */
  className?: string;
  /** Wrap logo in a link to home. */
  linkToHome?: boolean;
};

/**
 * Official CAPISJ DIGITAL SVG mark for auth headers and chrome.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-12 w-auto max-w-[200px]',
  linkToHome = true,
}) => {
  const img = (
    <img
      src={brandLogo}
      alt={BRAND_DISPLAY_NAME}
      className={`object-contain mx-auto ${className}`}
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
