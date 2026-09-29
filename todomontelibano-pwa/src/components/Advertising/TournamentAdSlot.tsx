import React, { useCallback, useEffect, useState } from 'react';
import BannerAd from '../BannerAd';
import { useBannersByPosition } from '../../hooks/useSports';

interface TournamentAdSlotProps {
  position: string;
  tournamentId?: string;
  variant?: 'horizontal' | 'square' | 'compact';
  className?: string;
}

interface SlotBanner {
  id: string;
  image: string;
  title: string;
  link_url?: string;
  description?: string;
}

const ROTATION_MS = 4000;
const SLIDE_MS = 700;

const FRAME_SIZE: Record<NonNullable<TournamentAdSlotProps['variant']>, string> = {
  horizontal: 'w-full h-48 md:h-56',
  square: 'w-full aspect-square max-w-xs',
  compact: 'w-full h-32',
};

const RotatingBanners: React.FC<{
  banners: SlotBanner[];
  variant: NonNullable<TournamentAdSlotProps['variant']>;
  className?: string;
}> = ({ banners, variant, className }) => {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const current = index % count;

  const goTo = useCallback(
    (next: number) => {
      if (next === current) return;
      setPrevious(current);
      setIndex(next);
      setTick((value) => value + 1);
    },
    [current]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setTimeout(() => goTo((current + 1) % count), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [paused, count, current, goTo]);

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [previous, tick]);

  const renderBanner = (banner: SlotBanner) => (
    <BannerAd
      id={banner.id}
      image={banner.image}
      title={banner.title}
      link_url={banner.link_url}
      description={banner.description}
      variant={variant}
    />
  );

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${FRAME_SIZE[variant]} ${className ?? ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Patrocinadores del torneo"
    >
      {previous !== null && banners[previous] && (
        <div key={`out-${tick}`} className="absolute inset-0 ad-slide-out" aria-hidden="true">
          {renderBanner(banners[previous])}
        </div>
      )}
      <div key={`in-${tick}`} className={`absolute inset-0 ${tick > 0 ? 'ad-slide-in' : ''}`}>
        {renderBanner(banners[current])}
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {banners.map((banner, dot) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => goTo(dot)}
            aria-label={`Ver patrocinador ${dot + 1} de ${count}`}
            aria-current={dot === current}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              dot === current ? 'h-5 bg-white' : 'h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const TournamentAdSlot: React.FC<TournamentAdSlotProps> = ({
  position,
  tournamentId,
  variant = 'horizontal',
  className,
}) => {
  const { data: banners } = useBannersByPosition(position, tournamentId);
  const list = (banners ?? []) as SlotBanner[];

  if (!list.length) return null;

  if (list.length === 1) {
    const banner = list[0];
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
  }

  return <RotatingBanners banners={list.slice(0, 3)} variant={variant} className={className} />;
};

export default TournamentAdSlot;
