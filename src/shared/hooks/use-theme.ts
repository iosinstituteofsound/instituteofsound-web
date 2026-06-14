import { useEffect } from 'react'
import { useThemeStore } from '@/app/stores/theme-store'

export function useTheme() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark = mode === 'dark' || (mode === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
    }

    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])

  return { mode, setMode }
}
