import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { useMyEvents } from '../../hooks/useEvents';

const MyEvents: React.FC = () => {
  const { data: events, isLoading } = useMyEvents();

  return (
    <div className="page-container page-section">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Mis eventos</h1>
        <Link
          to="/eventos/publicar"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : !events?.length ? (
        <p className="text-gray-500 text-center py-12">Aún no has publicado eventos.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/eventos/${ev.slug}`}
              className="card-static p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <Calendar className="w-8 h-8 text-violet-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{ev.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(ev.start_datetime).toLocaleDateString('es-CO')}
                  {ev.days_remaining != null && ` · ${ev.days_remaining} días restantes`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
