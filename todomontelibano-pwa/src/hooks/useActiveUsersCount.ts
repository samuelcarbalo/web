import { useEffect, useState } from "react";
import { api } from "../lib/api";

/** Contador público de usuarios activos (GET /auth/users-count/). */
export function useActiveUsersCount() {
  const [activeUsers, setActiveUsers] = useState<string>("—");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

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

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activeUsers, isLoading, isError };
}
