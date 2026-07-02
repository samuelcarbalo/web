import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBannerConfig,
  getClassifiedAdPlans,
  getClassifiedPositions,
  getSponsorshipAvailability,
  getSponsorshipPlans,
  getMyAdCampaigns,
  purchaseAdCampaign,
  purchaseSponsorship,
  type PurchaseCampaignData,
  type PurchaseSponsorshipData,
} from '../lib/advertisingApi';

const SPONSORSHIP_KEY = 'sponsorship';
const CAMPAIGN_KEY = 'ad-campaign';

export const useSponsorshipPlans = () =>
  useQuery({
    queryKey: [SPONSORSHIP_KEY, 'plans'],
    queryFn: getSponsorshipPlans,
    staleTime: 1000 * 60 * 30,
  });

export const useSponsorshipAvailability = (slug?: string) =>
  useQuery({
    queryKey: [SPONSORSHIP_KEY, 'availability', slug],
    queryFn: () => getSponsorshipAvailability(slug!),
    enabled: !!slug,
    refetchInterval: 1000 * 60 * 5,
  });

export const usePurchaseSponsorship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseSponsorshipData) => purchaseSponsorship(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPONSORSHIP_KEY] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({
        queryKey: [SPONSORSHIP_KEY, 'availability'],
      });
    },
  });
};

export const useClassifiedAdPlans = () =>
  useQuery({
    queryKey: [CAMPAIGN_KEY, 'plans'],
    queryFn: getClassifiedAdPlans,
    staleTime: 1000 * 60 * 30,
  });

export const useClassifiedPositions = (contentType: string) =>
  useQuery({
    queryKey: [CAMPAIGN_KEY, 'positions', contentType],
    queryFn: () => getClassifiedPositions(contentType),
    enabled: !!contentType,
  });

export const usePurchaseAdCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseCampaignData) => purchaseAdCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_KEY] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useMyAdCampaigns = (enabled = true) =>
  useQuery({
    queryKey: [CAMPAIGN_KEY, 'mine'],
    queryFn: getMyAdCampaigns,
    enabled,
  });

export const useBannerConfig = () =>
  useQuery({
    queryKey: ['banners', 'config'],
    queryFn: getBannerConfig,
    staleTime: 1000 * 60 * 60,
  });
