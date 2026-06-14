import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/context/AuthContext'
import { LoginGateProvider } from '@/context/LoginGateContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary'
import { applyPerformanceProfile } from '@/lib/performance'
import './index.css'
import './app-shell.css'
import './dashboard-studio.css'
import './ios-preview-parity.css'
import './network.css'
import './styles/network-profile.css'
import App from './App.tsx'

applyPerformanceProfile()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LoginGateProvider>
            <App />
          </LoginGateProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </StrictMode>
)
