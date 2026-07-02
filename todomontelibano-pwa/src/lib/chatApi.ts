import { api } from './api';
import type { PaginatedResponse } from '../types';
import type {
  Conversation,
  Message,
  CreateConversationPayload,
  StartRealEstateChatPayload,
  SendMessagePayload,
} from '../types/chat';

export const getConversations = async (params?: { type?: string; page?: number }) => {
  const response = await api.get<PaginatedResponse<Conversation>>('/messaging/conversations/', { params });
  return response.data;
};

export const getConversation = async (id: string) => {
  const response = await api.get<Conversation>(`/messaging/conversations/${id}/`);
  return response.data;
};

export const getConversationByApplication = async (applicationId: string) => {
  const response = await api.get<Conversation>(
    `/messaging/conversations/by-application/${applicationId}/`
  );
  return response.data;
};

export const createConversation = async (data: CreateConversationPayload) => {
  const response = await api.post<Conversation>('/messaging/conversations/', data);
  return response.data;
};

export const startRealEstateChat = async (data: StartRealEstateChatPayload) => {
  const response = await api.post<Conversation>('/messaging/conversations/start-real-estate/', data);
  return response.data;
};

export const getMessages = async (conversationId: string, params?: { page?: number; before?: string }) => {
  const response = await api.get<PaginatedResponse<Message>>(
    `/messaging/conversations/${conversationId}/messages/`,
    { params }
  );
  return response.data;
};

export const sendMessage = async (conversationId: string, data: SendMessagePayload) => {
  const response = await api.post<Message>(
    `/messaging/conversations/${conversationId}/send/`,
    data
  );
  return response.data;
};

export const markConversationAsRead = async (conversationId: string) => {
  const response = await api.post<{ success: boolean; read_at: string }>(
    `/messaging/conversations/${conversationId}/mark_read/`
  );
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get<{ unread_count: number }>('/messaging/conversations/unread-count/');
  return response.data;
};

export const editMessage = async (messageId: string, body: string) => {
  const response = await api.patch<Message>(`/messaging/messages/${messageId}/`, { body });
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
  await api.delete(`/messaging/messages/${messageId}/`);
};

export const getWebSocketUrl = (conversationId: string): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const wsBase = apiUrl.replace(/^http/, 'ws').replace('/api/v1', '');
  const token = localStorage.getItem('access_token') || '';
  return `${wsBase}/ws/messaging/conversations/${conversationId}/?token=${token}`;
};
