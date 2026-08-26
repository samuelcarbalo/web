import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { initTheme } from './hooks/useTheme'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { setupBlankScreenRecovery, setupPwaUpdates, purgeCachesIfVersionChanged } from './lib/pwa'
import { recoverFromStaleChunks, setupChunkLoadRecovery } from './lib/chunkRecovery'

initTheme()
void purgeCachesIfVersionChanged()
setupPwaUpdates()
setupBlankScreenRecovery()
setupChunkLoadRecovery()

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason as { message?: string; name?: string } | undefined
  if (
    reason?.message?.includes('dynamically imported module') ||
    reason?.name === 'ChunkLoadError'
  ) {
    event.preventDefault()
    void recoverFromStaleChunks()
  }
})

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </HelmetProvider>
    </StrictMode>,
  )
  // React ya reemplazó #root; limpiar flag del watchdog de index.html
  try {
    sessionStorage.removeItem('boot_watchdog_v1')
  } catch {
    /* ignore */
  }
}
