type ApiErrorItem = { field?: string; message?: string };

type ApiErrorBody = {
  detail?: string;
  message?: string;
  error?: ApiErrorItem[] | string;
  success?: boolean;
};

/** Normaliza birth_date al formato ISO estricto YYYY-MM-DD para la API. */
export function formatBirthDateForApi(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const isoPrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix) return isoPrefix[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Convierte birth_date de la API al valor esperado por input[type=date]. */
export function normalizeBirthDateForInput(value: string | null | undefined): string {
  return formatBirthDateForApi(value) ?? '';
}

export function parseApiFieldErrors(error: unknown): Record<string, string> {
  const data = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
  if (!data) return {};

  const mapped: Record<string, string> = {};

  if (Array.isArray(data.error)) {
    for (const item of data.error) {
      const field = item.field?.trim();
      const message = item.message?.trim();
      if (field && message) mapped[field] = message;
    }
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    mapped._form = data.error.trim();
  }

  return mapped;
}

export function parseApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
  if (!data) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();

  const fieldErrors = parseApiFieldErrors(error);
  const messages = Object.values(fieldErrors);
  if (messages.length) return messages.join(' ');

  return fallback;
}
