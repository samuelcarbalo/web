import { absoluteUrl, MAIN_NAV_ITEMS, ROUTES, SITE_NAME, SITE_URL } from '../../../config/seo';

export const buildHomeSchema = () => {
  const navElements = MAIN_NAV_ITEMS.map((item: (typeof MAIN_NAV_ITEMS)[number], index: number) => ({
    '@type': 'SiteNavigationElement',
    position: index + 1,
    name: item.name,
    description: item.description,
    url: absoluteUrl(item.path),
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/icon-512x512.png'),
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'es-CO',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${absoluteUrl(ROUTES.empleos)}?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      hasPart: navElements,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Servicios principales',
      itemListElement: navElements.map((el: (typeof navElements)[number], i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'WebPage',
          name: el.name,
          url: el.url,
          description: el.description,
        },
      })),
    },
  ];
};

export const buildJobsCollectionSchema = (jobCount?: number) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Bolsa de Empleo CordobaTech',
  description: 'Listado de vacantes y ofertas laborales disponibles en CordobaTech.',
  url: absoluteUrl(ROUTES.empleos),
  inLanguage: 'es-CO',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'Thing',
    name: 'Empleo y reclutamiento',
  },
  ...(jobCount !== undefined && {
    numberOfItems: jobCount,
  }),
});

/** Ejemplo JobPosting para detalle de vacante */
export const buildJobPostingSchema = (job: {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location?: string;
  posted_at: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_type?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: job.title,
  description: job.description,
  identifier: {
    '@type': 'PropertyValue',
    name: SITE_NAME,
    value: job.id,
  },
  datePosted: job.posted_at,
  hiringOrganization: {
    '@type': 'Organization',
    name: job.company_name,
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: job.location || 'Córdoba',
      addressCountry: 'CO',
    },
  },
  employmentType: job.job_type?.toUpperCase().replace('_', ' ') || 'FULL_TIME',
  ...(job.salary_min && {
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.currency || 'COP',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max || job.salary_min,
        unitText: 'MONTH',
      },
    },
  }),
  url: absoluteUrl(ROUTES.empleosDetail(String(job.id))),
});

export const buildEventsCollectionSchema = (eventCount?: number) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Eventos publicitarios CordobaTech',
  description:
    'Agenda de ferias, conciertos, activaciones de marca y eventos publicitarios locales en CordobaTech.',
  url: absoluteUrl(ROUTES.eventos),
  inLanguage: 'es-CO',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'Thing',
    name: 'Eventos publicitarios y agenda local',
  },
  ...(eventCount !== undefined && {
    numberOfItems: eventCount,
  }),
});

export const buildEventSchema = (event: {
  slug: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string | null;
  location?: string;
  address?: string;
  is_online?: boolean;
  online_url?: string;
  cover_image?: string;
  organizer_name?: string;
  price_info?: string;
  event_category?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.title,
  description: event.description || event.title,
  startDate: event.start_datetime,
  ...(event.end_datetime && { endDate: event.end_datetime }),
  eventAttendanceMode: event.is_online
    ? 'https://schema.org/OnlineEventAttendanceMode'
    : 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  ...(event.is_online && event.online_url
    ? { location: { '@type': 'VirtualLocation', url: event.online_url } }
    : {
        location: {
          '@type': 'Place',
          name: event.location || 'Córdoba',
          address: event.address || event.location || 'Córdoba, Colombia',
        },
      }),
  ...(event.cover_image && { image: [event.cover_image] }),
  ...(event.organizer_name && {
    organizer: {
      '@type': 'Organization',
      name: event.organizer_name,
    },
  }),
  ...(event.price_info && {
    offers: {
      '@type': 'Offer',
      price: event.price_info,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(ROUTES.eventosDetail(event.slug)),
    },
  }),
  url: absoluteUrl(ROUTES.eventosDetail(event.slug)),
  isAccessibleForFree: !event.price_info || /gratis/i.test(event.price_info),
});
