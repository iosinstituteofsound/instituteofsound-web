import {
  CSS_COLOR_VARS,
  SEMANTIC_COLOR_KEYS,
  type ThemeMode,
  type ThemeTokens,
  normalizeThemeTokens,
} from '@/shared/design-tokens/theme-tokens'

export function applyThemeTokens(rawTokens: ThemeTokens | unknown, mode: ThemeMode) {
  if (typeof document === 'undefined') return

  const tokens = normalizeThemeTokens(rawTokens)
  const root = document.documentElement
  const colors = tokens.colors[mode]

  for (const key of SEMANTIC_COLOR_KEYS) {
    root.style.setProperty(`--${key}`, colors[key])
  }

  root.dataset.badgeTheme = 'active'
}

export function resetThemeOverrides() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  for (const cssVar of CSS_COLOR_VARS) {
    root.style.removeProperty(cssVar)
  }
  delete root.dataset.badgeTheme
}

export function resolveThemeMode(mode: 'light' | 'dark' | 'system'): ThemeMode {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
