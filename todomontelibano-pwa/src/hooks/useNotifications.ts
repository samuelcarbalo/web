import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/notificationsApi';
import {
  isNotificationsRealtimeLive,
  subscribeNotificationsRealtime,
} from '../lib/notificationsRealtime';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unread?: boolean) => [...notificationKeys.all, 'list', unread] as const,
  unread: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (enabled = true, unreadOnly = false) => {
  const [realtimeLive, setRealtimeLive] = useState(isNotificationsRealtimeLive);

  useEffect(() => subscribeNotificationsRealtime(setRealtimeLive), []);

  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => getNotifications(unreadOnly ? { unread: true } : undefined),
    enabled,
    refetchInterval: realtimeLive ? 60_000 : 15_000,
    staleTime: 10_000,
    throwOnError: false,
  });
};

export const useNotificationUnreadCount = (enabled = true) => {
  const [realtimeLive, setRealtimeLive] = useState(isNotificationsRealtimeLive);

  useEffect(() => subscribeNotificationsRealtime(setRealtimeLive), []);

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getNotificationUnreadCount,
    enabled,
    refetchInterval: realtimeLive ? 60_000 : 15_000,
    staleTime: 10_000,
    throwOnError: false,
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
