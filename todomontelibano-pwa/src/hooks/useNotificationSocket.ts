import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ensureNotificationPermission,
  getNotificationsWebSocketUrl,
  openSafeWebSocket,
  setNotificationsRealtimeLive,
  showLocalPaymentNotification,
} from '../lib/notificationsRealtime';
import {
  getWsReconnectDelay,
  shouldReconnectWebSocket,
  WS_CLOSE_TOKEN_EXPIRED,
  WS_CLOSE_UNAUTHORIZED,
} from '../lib/wsReconnect';
import { notificationKeys } from './useNotifications';
import type { Notification } from '../types/notification';

/** Tras agotar reintentos WS, cae a polling HTTP cada 15s. */
const MAX_WS_RETRIES = 12;

/**
 * WebSocket a /ws/notifications/. Reconexión con backoff exponencial si Render
 * reinicia o suspende la instancia. Sin token válido → polling HTTP.
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

    const scheduleReconnect = (closeCode: number) => {
      if (cancelled) return;

      if (
        !shouldReconnectWebSocket(closeCode) ||
        closeCode === WS_CLOSE_UNAUTHORIZED ||
        closeCode === WS_CLOSE_TOKEN_EXPIRED ||
        retryRef.current >= MAX_WS_RETRIES
      ) {
        startPolling();
        return;
      }

      const delay = getWsReconnectDelay(retryRef.current);
      retryRef.current += 1;
      timerRef.current = setTimeout(connect, delay);
    };

    const connect = () => {
      if (cancelled) return;
      closeSocket();

      const url = getNotificationsWebSocketUrl();
      const ws = openSafeWebSocket(url);
      if (!ws) {
        scheduleReconnect(1006);
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
        scheduleReconnect(event.code);
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
