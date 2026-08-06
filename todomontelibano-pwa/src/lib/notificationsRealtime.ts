import { getWebSocketBaseUrl } from '../api/config';
import type { Notification } from '../types/notification';

export function getNotificationsWebSocketUrl(): string {
  const token = localStorage.getItem('access_token') || '';
  return `${getWebSocketBaseUrl()}/ws/notifications/?token=${token}`;
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
      new Notification(title, { body, icon: '/icon-192x192.png', tag: `notif-${n.id}` });
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
      new Notification(title, { body, icon: '/icon-192x192.png', tag: `notif-${n.id}` });
    }
  }
}

function defaultTitle(type: Notification['type']): string {
  if (type === 'payment_success') return '¡Pago aprobado!';
  if (type === 'payment_failed') return 'Pago rechazado';
  if (type === 'payment_pending') return 'Pago pendiente';
  return 'CAPISJ DIGITAL';
}
