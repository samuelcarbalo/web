/** Resuelve la URL de checkout según el entorno activo (Test vs Producción). */
export function resolveMpInitPoint(
  pref: {
    init_point?: string | null;
    sandbox_init_point?: string | null;
    is_production?: boolean;
  },
  isProduction: boolean,
): string | null {
  if (isProduction) {
    return pref.init_point || pref.sandbox_init_point || null;
  }
  return pref.sandbox_init_point || pref.init_point || null;
}
