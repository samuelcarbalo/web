import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BarChart3, ChevronLeft, Eye, Loader2, Megaphone, MousePointerClick, TrendingUp } from 'lucide-react';
import { getAdAnalytics, type AdAnalyticsDay } from '../../lib/adAnalyticsApi';
import { bogotaDateKey } from '../../lib/bogotaTime';

type Preset = '7d' | '30d' | 'month' | 'custom';

const PRESETS: { id: Preset; label: string }[] = [
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'custom', label: 'Personalizado' },
];

/** Suma días a una fecha "YYYY-MM-DD" sin depender de la zona del navegador. */
function shiftDate(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

function presetRange(preset: Exclude<Preset, 'custom'>): { start: string; end: string } {
  const today = bogotaDateKey();
  if (preset === '7d') return { start: shiftDate(today, -6), end: today };
  if (preset === '30d') return { start: shiftDate(today, -29), end: today };
  return { start: `${today.slice(0, 8)}01`, end: today };
}

function formatDay(key: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('es-CO', { ...options, timeZone: 'UTC' });
}

const numberFormat = new Intl.NumberFormat('es-CO');

const DailyViewsChart: React.FC<{ data: AdAnalyticsDay[]; peakDate?: string }> = ({ data, peakDate }) => {
  const width = 720;
  const height = 240;
  const pad = { top: 16, right: 12, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => d.views));
  const step = innerW / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(36, step * 0.7));
  const labelEvery = Math.ceil(data.length / 10);
  const ticks = [0, Math.ceil(max / 2), max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Visualizaciones diarias">
      {ticks.map((tick) => {
        const y = pad.top + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="stroke-gray-200 dark:stroke-gray-800" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
              {numberFormat.format(tick)}
            </text>
          </g>
        );
      })}
      {data.map((day, i) => {
        const h = (day.views / max) * innerH;
        const x = pad.left + i * step + (step - barW) / 2;
        const y = pad.top + innerH - h;
        const isPeak = day.date === peakDate && day.views > 0;
        return (
          <g key={day.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, day.views > 0 ? 2 : 0)}
              rx={Math.min(6, barW / 3)}
              className={isPeak ? 'fill-emerald-500' : 'fill-violet-500/80'}
            >
              <title>{`${formatDay(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}: ${numberFormat.format(day.views)} visualizaciones`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={height - 10} textAnchor="middle" className="fill-gray-400 text-[10px]">
                {formatDay(day.date, { day: 'numeric', month: 'short' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string }> = ({
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
        <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
        {hint && <p className="text-xs text-gray-500 truncate">{hint}</p>}
      </div>
    </div>
  </div>
);

const AdAnalyticsPage: React.FC = () => {
  const [preset, setPreset] = useState<Preset>('7d');
  const [range, setRange] = useState(() => presetRange('7d'));
  const [adId, setAdId] = useState('');

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['admin-ad-analytics', range.start, range.end, adId],
    queryFn: () => getAdAnalytics({ ...range, ad: adId }),
    placeholderData: keepPreviousData,
    enabled: !!range.start && !!range.end && range.start <= range.end,
  });

  const choosePreset = (next: Preset) => {
    setPreset(next);
    if (next !== 'custom') setRange(presetRange(next));
  };

  const ads = useMemo(() => data?.ads ?? [], [data]);
  const activeAds = ads.filter((ad) => ad.is_active).length;
  const days = data?.daily.length || 1;
  const errorMessage =
    (error as { response?: { data?: { detail?: string } } } | null)?.response?.data?.detail ||
    (error ? 'No se pudieron cargar las métricas.' : '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="page-container py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/dashboard/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-violet-600 mb-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Panel de administración
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-violet-600" />
              Métricas de publicidad
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualizaciones reales (anuncio visible ≥ 50 % en pantalla), agrupadas por día en hora de Colombia.
            </p>
          </div>
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-violet-600" />}
        </div>

        {/* Filtros */}
        <div className="card-static space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePreset(p.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                  preset === p.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-gray-500">
              Desde
              <input
                type="date"
                value={range.start}
                max={range.end}
                onChange={(e) => {
                  setPreset('custom');
                  setRange((r) => ({ ...r, start: e.target.value }));
                }}
                className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </label>
            <label className="text-xs font-semibold text-gray-500">
              Hasta
              <input
                type="date"
                value={range.end}
                min={range.start}
                onChange={(e) => {
                  setPreset('custom');
                  setRange((r) => ({ ...r, end: e.target.value }));
                }}
                className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </label>
            <label className="text-xs font-semibold text-gray-500">
              Anuncio
              <select
                value={adId}
                onChange={(e) => setAdId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Todos los anuncios</option>
                {ads.map((ad) => (
                  <option key={ad.id} value={ad.id}>
                    {ad.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {range.start > range.end && (
            <p className="text-sm text-red-600">La fecha de inicio no puede ser posterior a la fecha fin.</p>
          )}
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Eye className="w-5 h-5" />}
                label={data.ad ? 'Visualizaciones del anuncio' : 'Visualizaciones'}
                value={numberFormat.format(data.total_views)}
                hint={data.ad?.title}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Día de mayor impacto"
                value={data.peak_day ? numberFormat.format(data.peak_day.views) : '—'}
                hint={
                  data.peak_day
                    ? formatDay(data.peak_day.date, { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Sin visualizaciones en el rango'
                }
              />
              <StatCard
                icon={<BarChart3 className="w-5 h-5" />}
                label="Promedio diario"
                value={numberFormat.format(Math.round(data.total_views / days))}
                hint={`${days} ${days === 1 ? 'día' : 'días'}`}
              />
              <StatCard
                icon={<Megaphone className="w-5 h-5" />}
                label="Anuncios activos"
                value={numberFormat.format(activeAds)}
                hint={`${ads.length} en total`}
              />
            </div>

            <div className="card-static">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Tendencia diaria{data.ad ? ` — ${data.ad.title}` : ''}
                </h2>
                {data.ad && (
                  <button type="button" onClick={() => setAdId('')} className="text-sm font-semibold text-violet-600 hover:underline">
                    Ver todos
                  </button>
                )}
              </div>
              <DailyViewsChart data={data.daily} peakDate={data.peak_day?.date} />
            </div>

            <div className="card-static overflow-hidden !p-0">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen de anuncios</h2>
                <p className="text-xs text-gray-500">Selecciona un anuncio para ver su detalle en la gráfica.</p>
              </div>
              {ads.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-gray-500">No hay anuncios registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Anuncio</th>
                        <th className="px-4 py-3">Cliente / Patrocinador</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Vistas en rango</th>
                        <th className="px-4 py-3 text-right">Total acumulado</th>
                        <th className="px-4 py-3 text-right">
                          <MousePointerClick className="inline w-3.5 h-3.5" /> Clics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {ads.map((ad) => (
                        <tr
                          key={ad.id}
                          onClick={() => setAdId(ad.id === adId ? '' : ad.id)}
                          className={`cursor-pointer transition-colors ${
                            ad.id === adId ? 'bg-violet-50 dark:bg-violet-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <td className="px-6 py-3">
                            <p className="font-semibold text-gray-900 dark:text-white">{ad.title}</p>
                            <p className="text-xs text-gray-500">
                              {ad.position_display}
                              {ad.tournament_name ? ` · ${ad.tournament_name}` : ''}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ad.sponsor || '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                ad.is_active
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {ad.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900 dark:text-white">
                            {numberFormat.format(ad.views_in_range)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                            {numberFormat.format(ad.total_views)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                            {numberFormat.format(ad.clicks)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdAnalyticsPage;
