import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/notificationsApi';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unread?: boolean) => [...notificationKeys.all, 'list', unread] as const,
  unread: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (enabled = true, unreadOnly = false) => {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => getNotifications(unreadOnly ? { unread: true } : undefined),
    enabled,
    refetchInterval: 30000,
    staleTime: 15000,
  });
};

export const useNotificationUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getNotificationUnreadCount,
    enabled,
    refetchInterval: 30000,
    staleTime: 15000,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
