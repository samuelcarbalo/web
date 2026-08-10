import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; message?: string };

/**
 * Evita pantalla en blanco ante excepciones de render (refs undefined tras refresh, etc.).
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Error inesperado' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.assign('/');
  };

  private handleRetry = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Algo salió mal
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            La página no pudo renderizarse. Esto a veces ocurre tras una actualización o al
            recargar una ruta protegida.
          </p>
          {this.state.message && (
            <p className="mt-2 text-xs text-gray-400 break-words">{this.state.message}</p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500"
            >
              Reintentar
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
