import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getMyEvents,
  updateEvent,
  type CreateEventData,
} from '../lib/eventsApi';

const EVENTS_KEY = 'events';

export const useEvents = (params?: Record<string, string>) =>
  useQuery({
    queryKey: [EVENTS_KEY, params],
    queryFn: () => getEvents(params),
  });

export const useEvent = (slug: string) =>
  useQuery({
    queryKey: [EVENTS_KEY, slug],
    queryFn: () => getEvent(slug),
    enabled: !!slug,
  });

export const useMyEvents = (enabled = true) =>
  useQuery({
    queryKey: [EVENTS_KEY, 'mine'],
    queryFn: getMyEvents,
    enabled,
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<CreateEventData> }) =>
      updateEvent(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteEvent(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
};
