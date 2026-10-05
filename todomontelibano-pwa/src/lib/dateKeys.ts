/** Utilidades para claves de día "YYYY-MM-DD" (día calendario, sin conversión de zona). */

export const numberFormat = new Intl.NumberFormat('es-CO');

/** Suma días a una fecha "YYYY-MM-DD" sin depender de la zona del navegador. */
export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function formatDayKey(key: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('es-CO', { ...options, timeZone: 'UTC' });
}
