import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider } from './context/AuthContext'
import { ErrorFallback } from './components/common/ErrorFallback'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => console.error('Error no controlado en la aplicación:', error, info.componentStack)}
      onReset={() => window.location.reload()}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
