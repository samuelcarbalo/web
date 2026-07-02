import { api } from './api';
import type { PaginatedResponse } from '../types';
import type { Notification } from '../types/notification';

export const getNotifications = async (params?: { unread?: boolean; page?: number }) => {
  const response = await api.get<PaginatedResponse<Notification>>('/notifications/', { params });
  return response.data;
};

export const getNotificationUnreadCount = async () => {
  const response = await api.get<{ unread_count: number }>('/notifications/unread-count/');
  return response.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.post<Notification>(`/notifications/${id}/mark-read/`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.post<{ success: boolean; marked: number }>('/notifications/mark-all-read/');
  return response.data;
};
