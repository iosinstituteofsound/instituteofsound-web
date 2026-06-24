import {
  CSS_COLOR_VARS,
  CSS_STATUS_VARS,
  SEMANTIC_COLOR_KEYS,
  SUBMISSION_STATUS_KEYS,
  statusKeyToCssVar,
  type ThemeMode,
  type ThemeTokens,
  normalizeThemeTokens,
} from '@/shared/design-tokens/theme-tokens'

export function applyThemeTokens(
  rawTokens: ThemeTokens | unknown,
  mode: ThemeMode,
  meta?: { slug?: string },
) {
  if (typeof document === 'undefined') return

  const tokens = normalizeThemeTokens(rawTokens)
  const root = document.documentElement
  const colors = tokens.colors[mode]
  const statusColors = tokens.statusColors?.[mode]

  for (const key of SEMANTIC_COLOR_KEYS) {
    root.style.setProperty(`--${key}`, colors[key])
  }

  if (statusColors) {
    for (const key of SUBMISSION_STATUS_KEYS) {
      root.style.setProperty(statusKeyToCssVar(key), statusColors[key])
    }
  }

  root.dataset.badgeTheme = 'active'

  if (meta?.slug) root.dataset.themeSlug = meta.slug
  else delete root.dataset.themeSlug

  if (tokens.badgeVariant) root.dataset.themeVariant = tokens.badgeVariant
  else delete root.dataset.themeVariant
}

export function resetThemeOverrides() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  for (const cssVar of CSS_COLOR_VARS) {
    root.style.removeProperty(cssVar)
  }
  for (const cssVar of CSS_STATUS_VARS) {
    root.style.removeProperty(cssVar)
  }
  delete root.dataset.badgeTheme
  delete root.dataset.themeSlug
  delete root.dataset.themeVariant
}

export function resolveThemeMode(mode: 'light' | 'dark' | 'system'): ThemeMode {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
