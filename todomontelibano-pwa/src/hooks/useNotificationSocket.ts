import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ensureNotificationPermission,
  getNotificationsWebSocketUrl,
  showLocalPaymentNotification,
} from '../lib/notificationsRealtime';
import { notificationKeys } from './useNotifications';
import type { Notification } from '../types/notification';

/**
 * Mantiene un WebSocket a /ws/notifications/ mientras haya sesión.
 * Al llegar payment_* invalida la campana y muestra alerta local (SW / Notification API).
 */
export function useNotificationSocket(enabled: boolean) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const url = getNotificationsWebSocketUrl();
      if (!url.includes('token=')) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        void ensureNotificationPermission();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type?: string;
            notification?: Notification;
          };
          if (data.type !== 'notification.new' || !data.notification) return;

          void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          void queryClient.invalidateQueries({ queryKey: ['me'] });
          void queryClient.invalidateQueries({ queryKey: ['payment-orders'] });

          const n = data.notification;
          if (String(n.type).startsWith('payment_')) {
            void showLocalPaymentNotification(n);
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (cancelled) return;
        const delay = Math.min(30000, 1000 * 2 ** retryRef.current);
        retryRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    const onSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === 'NOTIFICATION_CLICK' && typeof data.url === 'string') {
        window.location.assign(data.url);
      }
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, [enabled, queryClient]);
}
