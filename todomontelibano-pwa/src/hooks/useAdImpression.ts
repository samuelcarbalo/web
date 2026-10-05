import { useCallback, useEffect, useRef } from 'react';
import { trackAdImpression } from '../lib/adAnalyticsApi';

const VISIBLE_RATIO = 0.5;
/** Igual que la ventana anti-ráfaga del backend: no reenviar el mismo anuncio antes de 60 s. */
const CLIENT_DEDUP_MS = 60_000;
const lastSentAt = new Map<string, number>();

function sendImpression(adId: string) {
  const now = Date.now();
  const last = lastSentAt.get(adId);
  if (last && now - last < CLIENT_DEDUP_MS) return;
  lastSentAt.set(adId, now);
  trackAdImpression(adId).catch(() => {
    lastSentAt.delete(adId);
  });
}

/**
 * Registra una impresión cuando el anuncio está visible al menos un 50 % en pantalla.
 * Devuelve un ref callback para el contenedor del anuncio.
 */
export function useAdImpression(adId: string | undefined) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node || !adId || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some(
            (entry) => entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO
          );
          if (visible && document.visibilityState === 'visible') {
            sendImpression(adId);
            observer.disconnect();
          }
        },
        { threshold: [VISIBLE_RATIO] }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [adId]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return ref;
}
