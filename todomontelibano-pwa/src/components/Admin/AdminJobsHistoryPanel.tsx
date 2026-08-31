import React, { useState } from 'react';
import { BarChart3, ExternalLink, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type JobOfferHistoryRow } from '../../lib/adminApi';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AdminJobsHistoryPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'external'>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-jobs-history', submitted, page, typeFilter],
    queryFn: async () => {
      const params: { search?: string; page?: number; is_external?: string } = { page };
      if (submitted) params.search = submitted;
      if (typeFilter === 'external') params.is_external = 'true';
      if (typeFilter === 'internal') params.is_external = 'false';
      const { data: payload } = await adminApi.listJobHistory(params);
      return payload;
    },
  });

  const rows: JobOfferHistoryRow[] = data?.results ?? [];

  return (
    <div className="mb-10">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-2xl bg-violet-100 dark:bg-violet-950/50">
          <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Historial y Métricas de Vacantes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registro consolidado de ofertas internas y externas, incluidas las caducadas y depuradas.
          </p>
        </div>
      </div>

      <form
        className="card-static mb-4 flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSubmitted(search.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por título, empresa o publicador..."
          />
        </div>
        <select
          className="input-field sm:w-48"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as typeof typeFilter);
            setPage(1);
          }}
        >
          <option value="all">Todas</option>
          <option value="internal">Internas</option>
          <option value="external">Externas</option>
        </select>
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>

      {isLoading && <p className="text-sm text-gray-500">Cargando historial…</p>}
      {isError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          No se pudo cargar el historial. Verifica que tu cuenta sea staff/admin.
        </p>
      )}

      <div className="overflow-x-auto card-static !p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Publicado por</th>
              <th className="px-4 py-3">Creación</th>
              <th className="px-4 py-3">Caducidad</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Aplicaciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay registros de historial todavía.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900 dark:text-white">{row.title}</p>
                    <p className="text-xs text-gray-500">
                      {row.company_name}
                      {row.is_purged ? ' · depurada' : ' · activa'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.published_by_name || row.published_by_email || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.expired_at)}</td>
                  <td className="px-4 py-3">
                    {row.is_external ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <ExternalLink className="w-3 h-3" />
                        Externa
                      </span>
                    ) : (
                      <span className="inline-flex text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
                        Interna
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-extrabold tabular-nums">
                    {row.total_applications_count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (data.total_pages ?? 1) > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            className="btn-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500 self-center">
            Página {data.current_page} de {data.total_pages}
          </span>
          <button
            type="button"
            disabled={page >= data.total_pages}
            className="btn-secondary"
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminJobsHistoryPanel;
