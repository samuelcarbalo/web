import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { initTheme } from './hooks/useTheme'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { clearChunkReloadFlag } from './lib/lazyWithRetry'

initTheme()
clearChunkReloadFlag()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
