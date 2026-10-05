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
