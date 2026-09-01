import React, { memo, useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ShoppingBag,
  Tag,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '../../config/seo';
import { getMediaUrl } from '../../lib/api';
import { useShopProducts } from '../../hooks/useShop';
import type { ShopProduct } from '../../types/shop';

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
const HERO_IMAGE_WIDTH = 1536;
const HERO_IMAGE_HEIGHT = 1024;

type HeroSrcSet = {
  readonly avif: readonly [string, string];
  readonly webp: readonly [string, string];
  readonly jpg: readonly [string, string];
};

type HeroSlide = {
  readonly id: 'shop' | 'sports' | 'jobs';
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly ctaLabel: string;
  readonly ctaTo: string;
  readonly ctaIcon: LucideIcon;
  readonly alt: string;
  readonly objectPosition: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'shop',
    kicker: 'Tienda Chéver',
    title: 'Tienda y ofertas destacadas de Córdoba',
    subtitle:
      'Productos locales, descuentos y ofertas por tiempo limitado. Compra en Montelíbano sin salir de Chéver.',
    ctaLabel: 'Ir a la Tienda',
    ctaTo: ROUTES.tienda,
    ctaIcon: ShoppingBag,
    alt: 'Productos locales y comercios de Montelíbano, Córdoba',
    objectPosition: '22% 58%',
  },
  {
    id: 'sports',
    kicker: 'Deportes',
    title: 'Torneos y eventos deportivos en un solo lugar',
    subtitle:
      'Sigue ligas, partidos y convocatorias de fútbol, softbol y béisbol en la región.',
    ctaLabel: 'Ver Torneos y Deportes',
    ctaTo: ROUTES.deportes,
    ctaIcon: Trophy,
    alt: 'Niños y niñas jugando fútbol en un barrio de Córdoba',
    objectPosition: '40% 42%',
  },
  {
    id: 'jobs',
    kicker: 'Empleo local',
    title: 'Empleos y servicios para el talento de Córdoba',
    subtitle:
      'Vacantes recientes, oficios y oportunidades en Montelíbano y la zona. Publica o postúlate hoy.',
    ctaLabel: 'Ver Empleos',
    ctaTo: ROUTES.empleos,
    ctaIcon: Briefcase,
    alt: 'Personas trabajando en comercios y negocios locales de Montelíbano',
    objectPosition: '28% 45%',
  },
];

const SLIDE_IMAGES: Record<HeroSlide['id'], HeroSrcSet> = {
  shop: {
    avif: [shop768Avif, shop1536Avif],
    webp: [shop768Webp, shop1536Webp],
    jpg: [shop768Jpg, shop1536Jpg],
  },
  sports: {
    avif: [sports768Avif, sports1536Avif],
    webp: [sports768Webp, sports1536Webp],
    jpg: [sports768Jpg, sports1536Jpg],
  },
  jobs: {
    avif: [jobs768Avif, jobs1536Avif],
    webp: [jobs768Webp, jobs1536Webp],
    jpg: [jobs768Jpg, jobs1536Jpg],
  },
};

const srcSetFrom = (urls: readonly [string, string]): string =>
  `${urls[0]} 768w, ${urls[1]} 1536w`;

const HeroPicture = memo(function HeroPicture({
  images,
  alt,
  priority,
  objectPosition,
}: {
  images: HeroSrcSet;
  alt: string;
  priority: boolean;
  objectPosition: string;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSetFrom(images.avif)} sizes="100vw" />
      <source type="image/webp" srcSet={srcSetFrom(images.webp)} sizes="100vw" />
      <img
        src={priority ? images.jpg[0] : images.jpg[1]}
        srcSet={srcSetFrom(images.jpg)}
        sizes="100vw"
        alt={alt}
        width={HERO_IMAGE_WIDTH}
        height={HERO_IMAGE_HEIGHT}
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover [transform:translateZ(0)]"
        style={{ objectPosition }}
      />
    </picture>
  );
});

const EMPTY_FEATURED: ShopProduct[] = [];

const HeroSlidePanel = memo(function HeroSlidePanel({
  slide,
  images,
  priority,
  featuredProducts,
}: {
  slide: HeroSlide;
  images: HeroSrcSet;
  priority: boolean;
  featuredProducts: ShopProduct[];
}) {
  const CtaIcon = slide.ctaIcon;
  const isShop = slide.id === 'shop';

  return (
    <article
      className="relative min-w-0 shrink-0 grow-0 basis-full h-full [backface-visibility:hidden] [transform:translate3d(0,0,0)] [contain:layout_paint]"
      aria-roledescription="diapositiva"
      aria-label={slide.title}
    >
      <div className="absolute inset-0">
        <HeroPicture
          images={images}
          alt={slide.alt}
          priority={priority}
          objectPosition={slide.objectPosition}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/82 to-primary-950/30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-950/35"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col justify-end page-container max-md:!px-14 pb-20 pt-16 sm:pb-24">
        <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-primary-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-200">
          {slide.kicker} · Montelíbano
        </p>
        <h2 className="max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
          {slide.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base sm:text-xl font-medium leading-relaxed text-white/95">
          {slide.subtitle}
        </p>

        {isShop && featuredProducts.length > 0 && (
          <ul className="mt-5 flex max-w-xl flex-wrap gap-2">
            {featuredProducts.map((product) => {
              const img = getMediaUrl(product.image_url);
              return (
                <li key={product.id}>
                  <Link
                    to={`${ROUTES.tienda}/${product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-primary-950/80 py-1 pl-1 pr-3 text-sm font-bold text-emerald-50 hover:bg-primary-900"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <Tag className="ml-2 h-4 w-4 text-emerald-300" aria-hidden="true" />
                    )}
                    <span className="max-w-[10rem] truncate">{product.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {isShop && featuredProducts.length === 0 && (
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-200">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Ofertas y catálogo listos para explorar
          </p>
        )}

        <div className="mt-8">
          <Link
            to={slide.ctaTo}
            className="inline-flex min-h-12 items-center justify-center rounded-3xl bg-emerald-400 px-8 py-3.5 text-base font-extrabold text-primary-950 shadow-[0_12px_36px_rgba(52,211,153,0.42)] transition-colors hover:bg-emerald-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950 sm:px-10 sm:py-4 sm:text-lg"
          >
            <CtaIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            {slide.ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
});

const HeroSection: React.FC = () => {
  const carouselId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { data: featuredData } = useShopProducts({ featured: true, in_stock: true });
  const featuredProducts = (featuredData?.results ?? []).filter((p) => p.is_featured !== false).slice(0, 3);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false, duration: 18, watchDrag: true },
    [
      Autoplay({
        delay: AUTOPLAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
        playOnInit: true,
      }),
    ],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    if (reduceMotion) autoplay.stop();
    else autoplay.play();
  }, [emblaApi, reduceMotion]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  return (
    <section
      className="relative isolate overflow-hidden bg-primary-950"
      aria-labelledby={`${carouselId}-title`}
    >
      <h1 id={`${carouselId}-title`} className="sr-only">
        Conectamos el talento, el comercio y el deporte de Córdoba en un solo lugar.
      </h1>

      <div className="relative min-h-[34rem] h-[min(40rem,calc(100svh-4.5rem))] md:h-[min(44rem,calc(100svh-5rem))]">
        <div className="h-full overflow-hidden touch-pan-y [transform:translateZ(0)]" ref={emblaRef}>
          <div className="flex h-full will-change-transform [backface-visibility:hidden] [transform:translate3d(0,0,0)]">
            {HERO_SLIDES.map((slide, slideIndex) => (
              <HeroSlidePanel
                key={slide.id}
                slide={slide}
                images={SLIDE_IMAGES[slide.id]}
                priority={slideIndex === 0}
                featuredProducts={slide.id === 'shop' ? featuredProducts : EMPTY_FEATURED}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-1.5 top-[26%] z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-primary-950/80 text-white shadow-lg transition hover:bg-emerald-400 hover:text-primary-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-5 md:top-1/2 md:h-14 md:w-14"
          aria-label="Diapositiva anterior"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-1.5 top-[26%] z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-primary-950/80 text-white shadow-lg transition hover:bg-emerald-400 hover:text-primary-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-5 md:top-1/2 md:h-14 md:w-14"
          aria-label="Diapositiva siguiente"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>

        <div
          className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2"
          role="tablist"
          aria-label="Diapositivas del hero"
        >
          {HERO_SLIDES.map((slide, slideIndex) => {
            const selected = slideIndex === selectedIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={slide.title}
                onClick={() => goTo(slideIndex)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  selected ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 57C1200 60 1320 60 1380 60L1440 60V80H0Z"
            className="fill-gray-50 dark:fill-gray-950"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
