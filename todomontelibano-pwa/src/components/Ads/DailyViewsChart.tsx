import React from 'react';
import type { AdAnalyticsDay } from '../../lib/adAnalyticsApi';
import { formatDayKey, numberFormat } from '../../lib/dateKeys';

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
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];

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
              <title>{`${formatDayKey(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}: ${numberFormat.format(day.views)} visualizaciones`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={height - 10} textAnchor="middle" className="fill-gray-400 text-[10px]">
                {formatDayKey(day.date, { day: 'numeric', month: 'short' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default DailyViewsChart;
