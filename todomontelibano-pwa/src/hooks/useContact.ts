import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  ContactMessage,
  ContactMessagePayload,
  SendContactMessageResponse,
} from '../lib/contactApi';

const CONTACT_KEY = ['contact', 'messages'];

export const sendContactMessage = async (data: ContactMessagePayload) => {
  const response = await api.post<SendContactMessageResponse>('/contact/messages/', data);
  return response.data;
};

export const getContactMessages = async (params?: { is_read?: boolean; search?: string }) => {
  const response = await api.get<{ results?: ContactMessage[]; count?: number } | ContactMessage[]>(
    '/contact/messages/',
    { params }
  );
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  return payload.results ?? [];
};

export const markContactMessageRead = async (id: string, is_read: boolean) => {
  const response = await api.patch<ContactMessage>(`/contact/messages/${id}/`, { is_read });
  return response.data;
};

export const useSendContactMessage = () =>
  useMutation({ mutationFn: sendContactMessage });

export const useContactMessages = (enabled: boolean, params?: { is_read?: boolean; search?: string }) =>
  useQuery({
    queryKey: [...CONTACT_KEY, params],
    queryFn: () => getContactMessages(params),
    enabled,
  });

export const useMarkContactMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) =>
      markContactMessageRead(id, is_read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEY });
    },
  });
};
