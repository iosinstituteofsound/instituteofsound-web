import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as gamificationApi from '@/modules/badges/api/gamification.api'
import { applyThemeTokens, resetThemeOverrides, resolveThemeMode } from '@/shared/lib/apply-theme'
import { useAuthStore } from '@/app/stores/auth-store'
import { useThemeStore } from '@/app/stores/theme-store'

export function useMyTheme(enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['gamification', 'me', 'theme'],
    queryFn: gamificationApi.getMyTheme,
    enabled: enabled && isAuthenticated,
  })
}

export function useBadgeThemeApplier() {
  const { data } = useMyTheme()
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const apply = () => {
      if (data?.source === 'badge' && data.activeTheme?.tokens) {
        applyThemeTokens(data.activeTheme.tokens, resolveThemeMode(mode))
        return
      }
      resetThemeOverrides()
    }

    apply()
    const raf = window.requestAnimationFrame(apply)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (data?.source === 'badge' && data.activeTheme?.tokens) {
        applyThemeTokens(data.activeTheme.tokens, resolveThemeMode(mode))
      }
    }

    media.addEventListener('change', handleChange)
    return () => {
      window.cancelAnimationFrame(raf)
      media.removeEventListener('change', handleChange)
      resetThemeOverrides()
    }
  }, [data, mode])
}
