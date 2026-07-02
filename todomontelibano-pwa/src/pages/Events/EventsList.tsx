import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Plus, Search, Sparkles, Globe } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { useAuthStore } from '../../store/authStore';
import { useBannersByPosition } from '../../hooks/useSports';
import BannerAd from '../../components/BannerAd';
import ClassifiedAdSlot from '../../components/Advertising/ClassifiedAdSlot';
import JsonLd from '../../components/SEO/JsonLd';
import { buildEventsCollectionSchema } from '../../components/SEO/schemas/seoSchemas';
import type { EventListing } from '../../lib/eventsApi';

const categoryLabels: Record<string, string> = {
  feria: 'Feria',
  concierto: 'Concierto',
  negocios: 'Negocios',
  cultural: 'Cultural',
  gastronomico: 'Gastronómico',
  deportivo: 'Deportivo',
  otro: 'Otro',
};

const EventsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const { data, isLoading } = useEvents({
    search: search || undefined,
    event_category: category || undefined,
  } as Record<string, string>);
  const { data: listBanners } = useBannersByPosition('events_list_top');

  const events: EventListing[] = data?.results ?? [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="page-container page-section">
      <JsonLd data={buildEventsCollectionSchema(events.length)} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-violet-600" />
            Eventos publicitarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ferias, conciertos, activaciones de marca y agenda local. Publica tu evento o amplía su
            alcance con campañas publicitarias.
          </p>
        </div>
        {isAuthenticated && (user?.role === 'manager' || user?.role === 'admin') && (
          <div className="flex gap-2">
            <Link
              to="/eventos/mis-eventos"
              className="px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 text-sm font-medium"
            >
              Mis eventos
            </Link>
            <Link
              to="/eventos/publicar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-600 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Publicar evento
            </Link>
          </div>
        )}
      </div>

      {listBanners?.[0] ? (
        <div className="mb-6">
          <BannerAd {...listBanners[0]} variant="horizontal" />
        </div>
      ) : (
        <ClassifiedAdSlot position="events_list_top" variant="horizontal" className="mb-6" />
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="card-static text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay eventos publicados aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/eventos/${ev.slug}`}
              className="card-static overflow-hidden hover:shadow-md transition-shadow group"
            >
              {ev.cover_image ? (
                <img
                  src={ev.cover_image}
                  alt=""
                  className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform"
                />
              ) : (
                <div className="h-40 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-violet-400" />
                </div>
              )}
              <div className="p-4">
                <span className="text-xs font-semibold text-violet-600 uppercase">
                  {ev.category_label || categoryLabels[ev.event_category] || ev.event_category}
                </span>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mt-1 line-clamp-2">
                  {ev.title}
                </h2>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(ev.start_datetime)}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  {ev.is_online ? (
                    <>
                      <Globe className="w-3.5 h-3.5" /> En línea
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" /> {ev.location || 'Por confirmar'}
                    </>
                  )}
                </p>
                {ev.price_info && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                    {ev.price_info}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
