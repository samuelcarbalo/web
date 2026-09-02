import { useEffect, useState } from 'react';

/** Muestra un hint de apoyo tras N ms mientras la petición sigue en curso. */
export function useDelayedLoadingHint(isActive: boolean, delayMs = 3000): boolean {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowHint(false);
      return;
    }

    const timer = window.setTimeout(() => setShowHint(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [isActive, delayMs]);

  return showHint;
}
