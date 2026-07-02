import React from 'react';
import BannerAd from '../BannerAd';
import { useBannersByPosition } from '../../hooks/useSports';

interface TournamentAdSlotProps {
  position: string;
  tournamentId?: string;
  variant?: 'horizontal' | 'square' | 'compact';
  className?: string;
}

const TournamentAdSlot: React.FC<TournamentAdSlotProps> = ({
  position,
  tournamentId,
  variant = 'horizontal',
  className,
}) => {
  const { data: banners } = useBannersByPosition(position, tournamentId);

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

export default TournamentAdSlot;
