import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { initTheme } from './hooks/useTheme'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { setupBlankScreenRecovery, setupPwaUpdates } from './lib/pwa'
import { recoverFromStaleChunks, setupChunkLoadRecovery } from './lib/chunkRecovery'

initTheme()
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
