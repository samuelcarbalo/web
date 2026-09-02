const OVERLAY_REMOVE_DELAY_MS = 220;

/**
 * Marca la app como lista tras el primer render de React.
 * Retira el overlay de arranque definido en index.html (estilos críticos inline).
 */
export function markAppReady(): void {
  const html = document.documentElement;
  html.classList.remove('app-booting');
  html.classList.add('app-ready');

  const overlay = document.getElementById('app-boot-overlay');
  if (!overlay) return;

  window.setTimeout(() => {
    overlay.remove();
    document.getElementById('app-boot')?.remove();
  }, OVERLAY_REMOVE_DELAY_MS);
}

/** Programa markAppReady tras el paint post-hidratación. */
export function scheduleMarkAppReady(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => markAppReady());
  });
}
