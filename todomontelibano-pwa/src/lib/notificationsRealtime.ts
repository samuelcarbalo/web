import { getWebSocketBaseUrl } from '../api/config';
import type { Notification } from '../types/notification';

type RealtimeListener = (live: boolean) => void;

let notificationsRealtimeLive = false;
const realtimeListeners = new Set<RealtimeListener>();

export function isNotificationsRealtimeLive(): boolean {
  return notificationsRealtimeLive;
}

export function setNotificationsRealtimeLive(live: boolean): void {
  if (notificationsRealtimeLive === live) return;
  notificationsRealtimeLive = live;
  realtimeListeners.forEach((listener) => {
    try {
      listener(live);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeNotificationsRealtime(listener: RealtimeListener): () => void {
  realtimeListeners.add(listener);
  return () => realtimeListeners.delete(listener);
}

export function getNotificationsWebSocketUrl(): string {
  const token = localStorage.getItem('access_token') || '';
  return `${getWebSocketBaseUrl()}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

export function openSafeWebSocket(url: string): WebSocket | null {
  try {
    if (!url.includes('token=') || /token=($|&)/.test(url)) return null;
    return new WebSocket(url);
  } catch (error) {
    console.warn('[ws] No se pudo abrir WebSocket:', error);
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function showLocalPaymentNotification(n: Notification): Promise<void> {
  const title = n.extra_data?.title || defaultTitle(n.type);
  const body = n.message;
  const url = n.extra_data?.link || '/creditos?tab=historial';

  if (!('serviceWorker' in navigator)) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/chever-logo-pwa.svg', tag: `notif-${n.id}` });
    }
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
      url,
      tag: `notif-${n.id}`,
    });
  } catch {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/chever-logo-pwa.svg', tag: `notif-${n.id}` });
    }
  }
}

function defaultTitle(type: Notification['type']): string {
  if (type === 'payment_success') return '¡Pago aprobado!';
  if (type === 'payment_failed') return 'Pago rechazado';
  if (type === 'payment_pending') return 'Pago pendiente';
  return 'Chever';
}
