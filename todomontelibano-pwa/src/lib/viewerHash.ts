const STORAGE_KEY = 'ct_viewer_hash';

/** Identificador anónimo estable para medir alcance único de campañas. */
export function getViewerHash(): string {
  try {
    let hash = localStorage.getItem(STORAGE_KEY);
    if (!hash) {
      hash =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(STORAGE_KEY, hash);
    }
    return hash;
  } catch {
    return `session_${Date.now()}`;
  }
}
