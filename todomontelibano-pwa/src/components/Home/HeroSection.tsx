import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pause,
  Play,
  Radio,
  ShoppingBag,
  Tag,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '../../config/seo';

import shop768Avif from '../../assets/hero/shop-768.avif';
import shop1536Avif from '../../assets/hero/shop-1536.avif';
import shop768Webp from '../../assets/hero/shop-768.webp';
import shop1536Webp from '../../assets/hero/shop-1536.webp';
import shop768Jpg from '../../assets/hero/shop-768.jpg';
import shop1536Jpg from '../../assets/hero/shop-1536.jpg';

import sports768Avif from '../../assets/hero/sports-768.avif';
import sports1536Avif from '../../assets/hero/sports-1536.avif';
import sports768Webp from '../../assets/hero/sports-768.webp';
import sports1536Webp from '../../assets/hero/sports-1536.webp';
import sports768Jpg from '../../assets/hero/sports-768.jpg';
import sports1536Jpg from '../../assets/hero/sports-1536.jpg';

import jobs768Avif from '../../assets/hero/jobs-768.avif';
import jobs1536Avif from '../../assets/hero/jobs-1536.avif';
import jobs768Webp from '../../assets/hero/jobs-768.webp';
import jobs1536Webp from '../../assets/hero/jobs-1536.webp';
import jobs768Jpg from '../../assets/hero/jobs-768.jpg';
import jobs1536Jpg from '../../assets/hero/jobs-1536.jpg';

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD_PX = 48;
const HERO_IMAGE_WIDTH = 1536;
const HERO_IMAGE_HEIGHT = 1024;

type HeroSrcSet = {
  readonly avif: readonly [string, string];
  readonly webp: readonly [string, string];
  readonly jpg: readonly [string, string];
};

type HeroBadge = {
  readonly icon: LucideIcon;
  readonly text: string;
};

type HeroSlide = {
  readonly id: 'shop' | 'sports' | 'jobs';
  readonly label: string;
  readonly kicker: string;
  readonly alt: string;
  readonly objectPositions: readonly [string, string, string];
  readonly badges: readonly HeroBadge[];
  readonly images: HeroSrcSet;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'shop',
    label: 'Tienda y ofertas',
    kicker: 'Comercio local',
    alt: 'Productos locales y comercios de Montelíbano, Córdoba',
    objectPositions: ['22% 58%', '78% 18%', '84% 82%'],
    badges: [
      { icon: Tag, text: 'Ofertas por tiempo limitado' },
      { icon: Clock3, text: 'Descuentos de hoy en la tienda' },
    ],
    images: {
      avif: [shop768Avif, shop1536Avif],
      webp: [shop768Webp, shop1536Webp],
      jpg: [shop768Jpg, shop1536Jpg],
    },
  },
  {
    id: 'sports',
    label: 'Deportes y comunidad',
    kicker: 'Torneos activos',
    alt: 'Partido de béisbol con público y canchas de fútbol y softbol en Córdoba',
    objectPositions: ['42% 48%', '70% 12%', '18% 82%'],
    badges: [
      { icon: Radio, text: 'Partidos y torneos activos' },
      { icon: Trophy, text: 'Béisbol, softbol y fútbol regional' },
    ],
    images: {
      avif: [sports768Avif, sports1536Avif],
      webp: [sports768Webp, sports1536Webp],
      jpg: [sports768Jpg, sports1536Jpg],
    },
  },
  {
    id: 'jobs',
    label: 'Empleos y negocios',
    kicker: 'Oportunidades locales',
    alt: 'Personas trabajando en comercios y negocios locales de Montelíbano',
    objectPositions: ['28% 45%', '78% 30%', '62% 78%'],
    badges: [
      { icon: Briefcase, text: 'Vacantes recientes' },
      { icon: ShoppingBag, text: 'Negocios que están contratando' },
    ],
    images: {
      avif: [jobs768Avif, jobs1536Avif],
      webp: [jobs768Webp, jobs1536Webp],
      jpg: [jobs768Jpg, jobs1536Jpg],
    },
  },
];

const SLIDE_COUNT = HERO_SLIDES.length;

type HeroPictureProps = {
  images: HeroSrcSet;
  alt: string;
  priority: boolean;
  objectPosition: string;
  sizes: string;
  className?: string;
};

const srcSetFrom = (urls: readonly [string, string]): string =>
  `${urls[0]} 768w, ${urls[1]} 1536w`;

const HeroPicture: React.FC<HeroPictureProps> = ({
  images,
  alt,
  priority,
  objectPosition,
  sizes,
  className,
}) => (
  <picture className={className}>
    <source type="image/avif" srcSet={srcSetFrom(images.avif)} sizes={sizes} />
    <source type="image/webp" srcSet={srcSetFrom(images.webp)} sizes={sizes} />
    <img
      src={images.jpg[1]}
      srcSet={srcSetFrom(images.jpg)}
      sizes={sizes}
      alt={alt}
      width={HERO_IMAGE_WIDTH}
      height={HERO_IMAGE_HEIGHT}
      fetchPriority={priority ? 'high' : 'low'}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      draggable={false}
      className="h-full w-full object-cover"
      style={{ objectPosition }}
    />
  </picture>
);

const wrapIndex = (value: number): number => (value + SLIDE_COUNT) % SLIDE_COUNT;

const isInteractiveTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && Boolean(target.closest('a, button'));

const HeroSection: React.FC = () => {
  const carouselId = useId();
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [pageHidden, setPageHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const pointerStartX = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    setIndex(wrapIndex(next));
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) => wrapIndex(current + 1));
  }, []);

  const goPrev = useCallback(() => {
    setIndex((current) => wrapIndex(current - 1));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const autoplayPaused =
    !autoplayEnabled ||
    reduceMotion ||
    isHovering ||
    isFocusWithin ||
    isDragging ||
    pageHidden;

  useEffect(() => {
    if (autoplayPaused) return undefined;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayPaused, goNext]);

  const endDrag = useCallback(
    (clientX: number) => {
      if (activePointerId.current === null) return;
      const delta = clientX - pointerStartX.current;
      activePointerId.current = null;
      setIsDragging(false);
      setDragOffset(0);
      if (delta > SWIPE_THRESHOLD_PX) goPrev();
      else if (delta < -SWIPE_THRESHOLD_PX) goNext();
    },
    [goNext, goPrev],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isInteractiveTarget(event.target)) return;
    activePointerId.current = event.pointerId;
    pointerStartX.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    setDragOffset(event.clientX - pointerStartX.current);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    endDrag(event.clientX);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    activePointerId.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
  };

  const activeSlide = HERO_SLIDES[index];
  const trackStyle: React.CSSProperties = {
    transform: `translate3d(calc(${-index * 100}% + ${dragOffset}px), 0, 0)`,
    transition: isDragging || reduceMotion ? 'none' : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-primary-950"
      aria-labelledby={`${carouselId}-title`}
    >
      <div
        className="relative min-h-[36rem] h-[min(56rem,calc(100svh-4.5rem))] md:h-[min(56rem,calc(100svh-5rem))]"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Historias de la comunidad de Córdoba"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onFocusCapture={() => setIsFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsFocusWithin(false);
          }
        }}
      >
        <div
          ref={trackRef}
          className="absolute inset-0 flex touch-pan-y cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={trackStyle}
        >
          {HERO_SLIDES.map((slide, slideIndex) => {
            const isActive = slideIndex === index;
            const isFirstSlide = slideIndex === 0;
            return (
              <div
                key={slide.id}
                className="relative h-full w-full shrink-0"
                aria-hidden={!isActive}
              >
                <div className="absolute inset-0 lg:hidden">
                  <HeroPicture
                    images={slide.images}
                    alt={isActive ? slide.alt : ''}
                    priority={isFirstSlide}
                    objectPosition={slide.objectPositions[0]}
                    sizes="100vw"
                    className="block h-full w-full"
                  />
                </div>

                <div className="absolute inset-0 hidden lg:grid grid-cols-12 grid-rows-2 gap-1.5 p-1.5">
                  <div className="relative col-span-8 row-span-2 overflow-hidden rounded-[1.35rem]">
                    <HeroPicture
                      images={slide.images}
                      alt={isActive ? slide.alt : ''}
                      priority={isFirstSlide}
                      objectPosition={slide.objectPositions[0]}
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      className="block h-full w-full"
                    />
                  </div>
                  <div className="relative col-span-4 overflow-hidden rounded-[1.35rem]">
                    <HeroPicture
                      images={slide.images}
                      alt=""
                      priority={false}
                      objectPosition={slide.objectPositions[1]}
                      sizes="(min-width: 1024px) 34vw, 100vw"
                      className="block h-full w-full"
                    />
                  </div>
                  <div className="relative col-span-4 overflow-hidden rounded-[1.35rem]">
                    <HeroPicture
                      images={slide.images}
                      alt=""
                      priority={false}
                      objectPosition={slide.objectPositions[2]}
                      sizes="(min-width: 1024px) 34vw, 100vw"
                      className="block h-full w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/80 to-primary-950/35 sm:to-primary-950/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-primary-950/40"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-end page-container pb-16 pt-24 sm:pb-20 sm:pt-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-white">
                {activeSlide.kicker} · Montelíbano, Córdoba
              </span>
            </div>

            <h1
              id={`${carouselId}-title`}
              className="min-h-[4.5rem] sm:min-h-[6.5rem] lg:min-h-[8.25rem] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
            >
              Conectamos el talento, el comercio y el deporte de Córdoba en un solo lugar.
            </h1>

            <p className="mt-5 max-w-2xl min-h-[4.5rem] sm:min-h-[3.5rem] text-base sm:text-xl font-medium leading-relaxed text-white">
              La plataforma de la comunidad en Montelíbano: organiza torneos, encuentra empleo,
              explora productos locales y conecta con ofertas exclusivas.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2.5">
              {activeSlide.badges.map((badge) => (
                <li
                  key={badge.text}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-primary-950/70 px-3.5 py-1.5 text-sm font-bold text-emerald-100 backdrop-blur-md"
                >
                  <badge.icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  {badge.text}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex min-h-[3.5rem] flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to={ROUTES.tienda}
                className="inline-flex shrink-0 items-center justify-center rounded-3xl bg-emerald-400 px-8 py-3.5 text-base font-extrabold text-primary-950 shadow-[0_12px_36px_rgba(52,211,153,0.42)] transition-all duration-300 hover:bg-emerald-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950 sm:px-10 sm:py-4 sm:text-lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />
                Ir a la Tienda
              </Link>
              <Link
                to={ROUTES.deportes}
                className="inline-flex shrink-0 items-center justify-center rounded-3xl border-2 border-white bg-white px-8 py-3.5 text-base font-extrabold text-primary-950 shadow-xl transition-all duration-300 hover:bg-emerald-50 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950 sm:px-10 sm:py-4 sm:text-lg"
              >
                <Trophy className="mr-2 h-5 w-5" aria-hidden="true" />
                Ver Torneos y Deportes
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Diapositivas del hero">
              {HERO_SLIDES.map((slide, slideIndex) => {
                const selected = slideIndex === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={slide.label}
                    onClick={() => goTo(slideIndex)}
                    className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950 ${
                      selected ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/45 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoplayEnabled((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-primary-950/50 text-white backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={autoplayEnabled && !reduceMotion ? 'Pausar carrusel' : 'Reproducir carrusel'}
              >
                {autoplayEnabled && !reduceMotion ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-primary-950/50 text-white backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Diapositiva anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-primary-950/50 text-white backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Diapositiva siguiente"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-gray-50 dark:fill-gray-950"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
