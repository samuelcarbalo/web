import { useEffect, useState } from "react";
import { api } from "../lib/api";

function scheduleIdle(task: () => void, timeoutMs = 2500): () => void {
  if (typeof window === "undefined") {
    task();
    return () => undefined;
  }

  const ric = window.requestIdleCallback?.bind(window);
  if (ric) {
    const id = ric(() => task(), { timeout: timeoutMs });
    return () => window.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(task, Math.min(timeoutMs, 800));
  return () => window.clearTimeout(id);
}

/**
 * Contador público de usuarios activos (GET /auth/users-count/).
 * Diferido tras el primer paint / idle para no alargar la critical request chain ni el LCP.
 */
export function useActiveUsersCount() {
  const [activeUsers, setActiveUsers] = useState<string>("—");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;

    // Espera al siguiente frame (Hero ya puede pintar) y luego idle.
    const raf = window.requestAnimationFrame(() => {
      cancelIdle = scheduleIdle(() => {
        if (cancelled) return;

        const load = async () => {
          setIsLoading(true);
          setIsError(false);
          try {
            const response = await api.get<{ active_users?: number }>("/auth/users-count/");
            const count = response.data?.active_users;
            if (!cancelled) {
              setActiveUsers(typeof count === "number" ? count.toLocaleString("es-CO") : "—");
            }
          } catch {
            if (!cancelled) {
              setActiveUsers("—");
              setIsError(true);
            }
          } finally {
            if (!cancelled) setIsLoading(false);
          }
        };

        void load();
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      cancelIdle?.();
    };
  }, []);

  return { activeUsers, isLoading, isError };
}
