import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { TRPCProvider } from '@/providers/trpc'
import { ThemeProvider } from '@/providers/theme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import './i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="dlz-theme">
          <TRPCProvider>
            <App />
            <Toaster position="top-right" richColors />
          </TRPCProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
