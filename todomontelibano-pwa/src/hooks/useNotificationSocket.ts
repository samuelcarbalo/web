import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ensureNotificationPermission,
  getNotificationsWebSocketUrl,
  openSafeWebSocket,
  setNotificationsRealtimeLive,
  showLocalPaymentNotification,
} from '../lib/notificationsRealtime';
import { notificationKeys } from './useNotifications';
import type { Notification } from '../types/notification';

const MAX_WS_RETRIES = 2;

/**
 * WebSocket a /ws/notifications/. Si Channels/ASGI no está disponible, deja de reintentar
 * y cae a polling HTTP (useNotifications) sin romper el resto de la app.
 */
export function useNotificationSocket(enabled: boolean) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setNotificationsRealtimeLive(false);
      return;
    }

    let cancelled = false;

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const startPolling = () => {
      setNotificationsRealtimeLive(false);
      if (pollingRef.current || cancelled) return;
      pollingRef.current = setInterval(() => {
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      }, 15_000);
    };

    const closeSocket = () => {
      const ws = wsRef.current;
      wsRef.current = null;
      if (!ws) return;
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {
        /* ignore */
      }
    };

    const connect = () => {
      if (cancelled) return;
      closeSocket();

      const url = getNotificationsWebSocketUrl();
      const ws = openSafeWebSocket(url);
      if (!ws) {
        startPolling();
        return;
      }

      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        stopPolling();
        setNotificationsRealtimeLive(true);
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

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        setNotificationsRealtimeLive(false);
        if (cancelled) return;

        // 4001 = token inválido; no reintentar en bucle
        if (event.code === 4001 || retryRef.current >= MAX_WS_RETRIES) {
          startPolling();
          return;
        }

        const delay = Math.min(15_000, 2000 * 2 ** retryRef.current);
        retryRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
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
      stopPolling();
      closeSocket();
      setNotificationsRealtimeLive(false);
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, [enabled, queryClient]);
}
