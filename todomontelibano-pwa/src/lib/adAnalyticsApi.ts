import { api } from './api';

export interface AdAnalyticsDay {
  date: string;
  views: number;
}

export interface AdAnalyticsRow {
  id: string;
  title: string;
  sponsor: string;
  position: string;
  position_display: string;
  tournament_name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  views_in_range: number;
  total_views: number;
  /** ISO con offset -05:00 (America/Bogota) o null si nunca se ha visto. */
  last_viewed_at: string | null;
  clicks: number;
}

export interface AdAnalyticsReport {
  start: string;
  end: string;
  timezone: string;
  ad: { id: string; title: string } | null;
  total_views: number;
  peak_day: AdAnalyticsDay | null;
  daily: AdAnalyticsDay[];
  ads: AdAnalyticsRow[];
}

export interface AdAnalyticsParams {
  start: string;
  end: string;
  ad?: string;
}

export const trackAdImpression = async (adId: string) => {
  await api.post(`/ads/${adId}/track-impression/`);
};

export const getAdAnalytics = async (params: AdAnalyticsParams) => {
  const response = await api.get<AdAnalyticsReport>('/admin/ads/analytics/', {
    params: { start: params.start, end: params.end, ad: params.ad || undefined },
  });
  return response.data;
};

export interface AdImpressionsSummary extends AdAnalyticsReport {
  /** KPIs de todos los anuncios en el rango (no dependen de `ad_id`). */
  kpis: {
    active_ads: number;
    total_ads: number;
    views_in_range: number;
    views_all_time: number;
    top_sponsor: { name: string; views: number } | null;
  };
  options: { id: string; title: string; sponsor: string }[];
}

export interface AdImpressionsSummaryParams {
  start_date: string;
  end_date: string;
  ad_id?: string;
}

export const getAdImpressionsSummary = async (params: AdImpressionsSummaryParams) => {
  const response = await api.get<AdImpressionsSummary>('/admin/ads/impressions-summary/', {
    params: { start_date: params.start_date, end_date: params.end_date, ad_id: params.ad_id || undefined },
  });
  return response.data;
};
