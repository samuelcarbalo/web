import { api } from './api';

export interface SponsorshipPlan {
  id: string;
  label: string;
  credits: number;
  days: number;
  description: string;
}

export interface SponsorshipAvailability {
  available: boolean;
  tournament_id: string;
  tournament_name: string;
  tournament_status: string;
  days_remaining: number;
  message: string;
  active_sponsorship: {
    id: string;
    title: string;
    plan: string;
    plan_label: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
    image: string;
    link_url: string;
  } | null;
}

export interface PurchaseSponsorshipData {
  tournament: string;
  plan: string;
  title: string;
  description?: string;
  image: string;
  link_url?: string;
}

export interface ClassifiedAdPlan {
  id: string;
  label: string;
  credits: number;
  target_reach: number;
  frequency_cap: number;
  days: number;
  description: string;
}

export interface ClassifiedAdCampaign {
  id: string;
  content_type: string;
  object_id: string;
  plan: string;
  position: string;
  title: string;
  target_reach: number;
  frequency_cap: number;
  unique_views: number;
  total_impressions: number;
  max_impressions: number;
  days_remaining: number;
  status: string;
  is_active_now?: boolean;
}

export interface PurchaseCampaignData {
  content_type: 'job' | 'real_estate' | 'event';
  object_id: string;
  plan: string;
  position: string;
  title: string;
  description?: string;
  image: string;
  link_url?: string;
}

export const getSponsorshipPlans = async () => {
  const response = await api.get<SponsorshipPlan[]>('/advertising/sponsorships/plans/');
  return response.data;
};

export const getSponsorshipAvailability = async (slug: string) => {
  const response = await api.get<SponsorshipAvailability>(
    '/advertising/sponsorships/availability/',
    { params: { slug } }
  );
  return response.data;
};

export const purchaseSponsorship = async (data: PurchaseSponsorshipData) => {
  const response = await api.post('/advertising/sponsorships/purchase/', data);
  return response.data;
};

export const getClassifiedAdPlans = async () => {
  const response = await api.get<ClassifiedAdPlan[]>('/advertising/campaigns/plans/');
  return response.data;
};

export const getClassifiedPositions = async (contentType: string) => {
  const response = await api.get<{ value: string; label: string }[]>(
    '/advertising/campaigns/positions/',
    { params: { content_type: contentType } }
  );
  return response.data;
};

export const purchaseAdCampaign = async (data: PurchaseCampaignData) => {
  const response = await api.post('/advertising/campaigns/purchase/', data);
  return response.data;
};

export const getMyAdCampaigns = async () => {
  const response = await api.get<ClassifiedAdCampaign[]>('/advertising/campaigns/my_campaigns/');
  return response.data;
};

export const getBannerConfig = async () => {
  const response = await api.get<{ owner_banners_enabled: boolean }>(
    '/sports/banners/config/'
  );
  return response.data;
};
