/**
 * Fechas de partidos en hora de Colombia (America/Bogota, UTC-5 fijo, sin horario de verano),
 * independiente de la zona horaria del navegador.
 */
export const BOGOTA_TZ = 'America/Bogota';
export const BOGOTA_OFFSET = '-05:00';

const DATETIME_LOCAL_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/;

function parse(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function bogotaParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

/** ISO del servidor → valor para <input type="datetime-local"> en hora de Bogotá. */
export function toBogotaInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = parse(iso);
  if (!date) return '';
  const p = bogotaParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Valor de <input type="datetime-local"> → ISO con offset explícito, ej. "2026-10-05T23:00:00-05:00". */
export function bogotaInputToISO(value: string | null | undefined): string | null {
  const match = value ? DATETIME_LOCAL_RE.exec(value.trim()) : null;
  if (!match) return null;
  const [, dateString, timeString] = match;
  const iso = `${dateString}T${timeString}:00${BOGOTA_OFFSET}`;
  return parse(iso) ? iso : null;
}

/** Clave de día "YYYY-MM-DD" en hora de Bogotá (para agrupar y filtrar por día). */
export function bogotaDateKey(value: string | Date = new Date()): string {
  const date = parse(value);
  if (!date) return '';
  const p = bogotaParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

export function formatBogotaTime(value: string | Date): string {
  const date = parse(value);
  return date
    ? date.toLocaleTimeString('es-CO', { timeZone: BOGOTA_TZ, hour: '2-digit', minute: '2-digit' })
    : '';
}

export function formatBogotaDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  const date = parse(value);
  return date ? date.toLocaleDateString('es-CO', { ...options, timeZone: BOGOTA_TZ }) : '';
}
