import { api } from './api';
import type { PaginatedResponse } from '../types';

export interface EventListing {
  id: string;
  title: string;
  slug: string;
  description?: string;
  event_category: string;
  category_label?: string;
  start_datetime: string;
  end_datetime?: string | null;
  location?: string;
  address?: string;
  is_online: boolean;
  online_url?: string;
  cover_image?: string;
  organizer_name?: string;
  contact_phone?: string;
  contact_email?: string;
  external_link?: string;
  price_info?: string;
  posted_at?: string;
  expires_at?: string;
  days_remaining?: number;
  is_expired?: boolean;
  is_active?: boolean;
  views_count?: number;
  moderation_status?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  event_category: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  address?: string;
  is_online?: boolean;
  online_url?: string;
  cover_image?: string;
  organizer_name?: string;
  contact_phone?: string;
  contact_email?: string;
  external_link?: string;
  price_info?: string;
}

export const getEvents = async (params?: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<EventListing>>(
    '/events/listings/',
    { params }
  );
  return response.data;
};

export const getEvent = async (slug: string) => {
  const response = await api.get<EventListing>(`/events/listings/${slug}/`);
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get<EventListing[]>('/events/listings/my_events/');
  return response.data;
};

export const createEvent = async (data: CreateEventData) => {
  const response = await api.post('/events/listings/', data);
  return response.data;
};

export const updateEvent = async (slug: string, data: Partial<CreateEventData>) => {
  const response = await api.patch(`/events/listings/${slug}/`, data);
  return response.data;
};

export const deleteEvent = async (slug: string) => {
  await api.delete(`/events/listings/${slug}/`);
};
