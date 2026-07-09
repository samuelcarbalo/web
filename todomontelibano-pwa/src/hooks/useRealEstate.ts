import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaginatedResponse, RealEstateOffer } from '../types';

const REAL_ESTATE_KEY = 'real-estate';

export interface ListingFilters {
  search?: string;
  category?: string;
  property_type?: string;
  location?: string;
  page?: number;
}

export const useListings = (filters?: ListingFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [REAL_ESTATE_KEY, 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<RealEstateOffer>>('/real-estate/offers/', {
        params: {
          search: filters?.search || undefined,
          category: filters?.category || undefined,
          property_type: filters?.property_type || undefined,
          location: filters?.location || undefined,
          page: filters?.page,
        },
      });
      return response.data;
    },
    ...options,
  });
};

export const useMyListings = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [REAL_ESTATE_KEY, 'my-offers'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<RealEstateOffer>>(
        '/real-estate/offers/my_offers/'
      );
      return response.data;
    },
    ...options,
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: [REAL_ESTATE_KEY, id],
    queryFn: async () => {
      const response = await api.get<RealEstateOffer>(`/real-estate/offers/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post<RealEstateOffer>('/real-estate/offers/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Partial<RealEstateOffer> }) => {
      const isFormData = data instanceof FormData;
      const response = await api.patch<RealEstateOffer>(`/real-estate/offers/${id}/`, data, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/real-estate/offers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY] });
    },
  });
};

export const useRenewListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/real-estate/offers/${id}/renew/`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [REAL_ESTATE_KEY] });
    },
  });
};
