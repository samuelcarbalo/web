import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BarChart3, Crown, Eye, Loader2, Megaphone, X } from 'lucide-react';
import { getAdImpressionsSummary, type AdAnalyticsRow } from '../../lib/adAnalyticsApi';
import { bogotaDateKey, formatBogotaDate } from '../../lib/bogotaTime';
import DailyViewsChart from '../Ads/DailyViewsChart';
import { formatDayKey, numberFormat, shiftDateKey } from '../../lib/dateKeys';

type DateRange = { start: string; end: string };

function defaultRange(): DateRange {
  const today = bogotaDateKey();
  return { start: shiftDateKey(today, -29), end: today };
}

function formatLastView(iso: string | null): string {
  if (!iso) return 'Nunca';
  return formatBogotaDate(iso, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function apiError(error: unknown): string {
  const data = (error as { response?: { data?: Record<string, unknown> } } | null)?.response?.data;
  const message = data?.detail ?? data?.ad_id ?? data?.start_date ?? data?.end_date;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  return error ? 'No se pudo cargar el historial de publicidad.' : '';
}

const inputClass =
  'mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100';

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string }> = ({
  icon,
  label,
  value,
  hint,
}) => (
  <div className="card-static">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums truncate">{value}</p>
        {hint && <p className="text-xs text-gray-500 truncate">{hint}</p>}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
      active
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
    }`}
  >
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

const AdDailyDetailModal: React.FC<{ ad: AdAnalyticsRow; range: DateRange; onClose: () => void }> = ({
  ad,
  range,
  onClose,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ad-impressions-summary', range.start, range.end, ad.id],
    queryFn: () => getAdImpressionsSummary({ start_date: range.start, end_date: range.end, ad_id: ad.id }),
  });
  const days = data?.daily.length || 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="card-static max-w-3xl w-full relative" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="absolute right-3 top-3 p-1" onClick={onClose} aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white pr-8">{ad.title}</h3>
        <p className="text-sm text-gray-500">
          {ad.sponsor || 'Sin patrocinador'} · {ad.position_display}
          {ad.tournament_name ? ` · ${ad.tournament_name}` : ''}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDayKey(range.start, { day: 'numeric', month: 'short', year: 'numeric' })} –{' '}
          {formatDayKey(range.end, { day: 'numeric', month: 'short', year: 'numeric' })} (hora de Colombia)
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-red-600">{apiError(error)}</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-3 gap-3 my-4 text-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Views del período</p>
                <p className="text-xl font-black tabular-nums">{numberFormat.format(data.total_views)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Promedio diario</p>
                <p className="text-xl font-black tabular-nums">{numberFormat.format(Math.round(data.total_views / days))}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mejor día</p>
                <p className="text-xl font-black tabular-nums">
                  {data.peak_day ? formatDayKey(data.peak_day.date, { day: 'numeric', month: 'short' }) : '—'}
                </p>
              </div>
            </div>
            <DailyViewsChart data={data.daily} peakDate={data.peak_day?.date} />
          </>
        ) : null}
      </div>
    </div>
  );
};

const AdminAdsImpressionsPanel: React.FC = () => {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [adId, setAdId] = useState('');
  const [detail, setDetail] = useState<AdAnalyticsRow | null>(null);
  const validRange = !!range.start && !!range.end && range.start <= range.end;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['admin-ad-impressions-summary', range.start, range.end, adId],
    queryFn: () => getAdImpressionsSummary({ start_date: range.start, end_date: range.end, ad_id: adId }),
    placeholderData: keepPreviousData,
    enabled: validRange,
  });

  const kpis = data?.kpis;
  const rows = data?.ads ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-violet-600" />
            Historial de patrocinios y views
          </h2>
          <p className="text-sm text-gray-500">
            Views reales (anuncio visible al menos 50 % en pantalla). Fechas en hora de Colombia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-violet-600" />}
          <Link to="/admin/publicidad/metricas" className="text-sm font-semibold text-violet-600 hover:underline">
            Métricas avanzadas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={<Megaphone className="w-5 h-5" />}
          label="Anuncios activos"
          value={kpis ? numberFormat.format(kpis.active_ads) : '—'}
          hint={kpis ? `${numberFormat.format(kpis.total_ads)} registrados` : undefined}
        />
        <KpiCard
          icon={<Eye className="w-5 h-5" />}
          label="Views registradas"
          value={kpis ? numberFormat.format(kpis.views_in_range) : '—'}
          hint={kpis ? `${numberFormat.format(kpis.views_all_time)} en total histórico` : undefined}
        />
        <KpiCard
          icon={<Crown className="w-5 h-5" />}
          label="Patrocinador más visto"
          value={kpis?.top_sponsor?.name ?? '—'}
          hint={
            kpis?.top_sponsor
              ? `${numberFormat.format(kpis.top_sponsor.views)} views en el período`
              : 'Sin views en el período'
          }
        />
      </div>

      <div className="card-static space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs font-semibold text-gray-500">
            Fecha inicio
            <input
              type="date"
              value={range.start}
              max={range.end}
              onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Fecha fin
            <input
              type="date"
              value={range.end}
              min={range.start}
              onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Anuncio / Patrocinador
            <select value={adId} onChange={(e) => setAdId(e.target.value)} className={inputClass}>
              <option value="">Todos</option>
              {(data?.options ?? []).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.sponsor ? `${opt.title} — ${opt.sponsor}` : opt.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!validRange && <p className="text-sm text-red-600">La fecha de inicio no puede ser posterior a la fecha fin.</p>}
        {error && <p className="text-sm text-red-600">{apiError(error)}</p>}
      </div>

      <div className="card-static overflow-hidden !p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">No hay anuncios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Patrocinador / Banner</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 text-right">Total views</th>
                  <th className="px-4 py-3">Última visualización</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{ad.sponsor || 'Sin patrocinador'}</p>
                      <p className="text-xs text-gray-500">{ad.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {ad.position_display}
                      {ad.tournament_name && <p className="text-xs text-gray-500">{ad.tournament_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <p className="font-bold text-gray-900 dark:text-white">{numberFormat.format(ad.total_views)}</p>
                      <p className="text-xs text-gray-500">{numberFormat.format(ad.views_in_range)} en el período</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {formatLastView(ad.last_viewed_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={ad.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(ad)}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Detalle diario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && validRange && <AdDailyDetailModal ad={detail} range={range} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default AdminAdsImpressionsPanel;
