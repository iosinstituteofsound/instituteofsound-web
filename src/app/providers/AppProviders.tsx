import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/app/providers/query-client'
import { RealtimeProvider } from '@/app/providers/RealtimeProvider'
import { router } from '@/app/router/routes'
import { AppErrorBoundary } from '@/app/providers/error-boundary'
import { Toaster } from '@/shared/components/ui/sonner'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { useTheme } from '@/shared/hooks/use-theme'
import { useBadgeThemeApplier } from '@/shared/hooks/use-badge-theme'
import { ThemeEffectsLayer } from '@/shared/components/theme-effects/theme-effects-layer'

function ThemeInitializer() {
  useTheme()
  useBadgeThemeApplier()
  return null
}

export function AppProviders() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider>
          <TooltipProvider>
            <ThemeInitializer />
            <ThemeEffectsLayer />
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </RealtimeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}
