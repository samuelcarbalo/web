import React from 'react';
import { isChunkLoadError, recoverFromStaleChunks } from '../lib/chunkRecovery';

type Props = { children: React.ReactNode; onReset?: () => void };

type State = { hasError: boolean; message?: string; isChunk: boolean };

/**
 * Captura excepciones de render y ChunkLoadError (lazy + MIME text/html).
 * Un chunk desactualizado recarga sola una vez; si persiste, muestra UI amigable.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, isChunk: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      isChunk: isChunkLoadError(error),
      message: error?.message || 'Error inesperado',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (isChunkLoadError(error)) {
      void recoverFromStaleChunks();
    }
  }

  private handleReload = () => {
    window.location.assign('/');
  };

  private handleHardReload = () => {
    void recoverFromStaleChunks().then((ok) => {
      if (!ok) window.location.reload();
    });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {this.state.isChunk ? 'Nueva versión disponible' : 'Ocurrió un error inesperado'}
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {this.state.isChunk
              ? 'La aplicación se actualizó. Recarga para cargar los archivos más recientes.'
              : 'La página no pudo renderizarse. Recarga para continuar; el resto de la app no debería quedar en blanco.'}
          </p>
          {this.state.message && !this.state.isChunk && (
            <p className="mt-2 text-xs text-gray-400 break-words">{this.state.message}</p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleHardReload}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500"
            >
              Recargar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
