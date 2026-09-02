import React from 'react';

/**
 * Fallback de Suspense con estilos inline (no depende de Tailwind cargado).
 * Evita flash de contenido sin estilo mientras llega el chunk lazy.
 */
const RouteLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--boot-bg, #f9fafb)',
      color: '#64748b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div
      aria-hidden="true"
      style={{
        width: '2rem',
        height: '2rem',
        border: '3px solid #e5e7eb',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'boot-spin 0.75s linear infinite',
      }}
    />
    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Cargando…</p>
  </div>
);

export default RouteLoadingFallback;
