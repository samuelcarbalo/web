import React from 'react';
import BannerAd from '../BannerAd';
import { useBannersByPosition } from '../../hooks/useSports';

interface ClassifiedAdSlotProps {
  position: string;
  objectId?: string;
  variant?: 'horizontal' | 'square' | 'compact';
  className?: string;
}

const ClassifiedAdSlot: React.FC<ClassifiedAdSlotProps> = ({
  position,
  objectId,
  variant = 'horizontal',
  className,
}) => {
  const { data: banners } = useBannersByPosition(position, undefined, objectId);

  if (!banners?.length) return null;

  const banner = banners[0];
  return (
    <BannerAd
      id={banner.id}
      image={banner.image}
      title={banner.title}
      link_url={banner.link_url}
      description={banner.description}
      variant={variant}
      className={className}
    />
  );
};

export default ClassifiedAdSlot;
