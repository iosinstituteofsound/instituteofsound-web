/**
 * Semantic color design tokens (shadcn/ui compatible).
 * Themes control colors only — fonts, radius, and layout stay in globals.css.
 */

export const SEMANTIC_COLOR_KEYS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
] as const

export type SemanticColorKey = (typeof SEMANTIC_COLOR_KEYS)[number]
export type SemanticColors = Record<SemanticColorKey, string>
export type ThemeMode = 'light' | 'dark'

export interface ThemeTokens {
  colors: Record<ThemeMode, SemanticColors>
}

export const COLOR_GROUPS: Array<{ label: string; description: string; keys: SemanticColorKey[] }> = [
  { label: 'Base', description: 'Page background and default text', keys: ['background', 'foreground'] },
  {
    label: 'Surfaces',
    description: 'Cards, dialogs, and elevated panels',
    keys: ['card', 'card-foreground', 'popover', 'popover-foreground'],
  },
  {
    label: 'Brand & actions',
    description: 'Primary buttons, links, and key CTAs',
    keys: ['primary', 'primary-foreground'],
  },
  {
    label: 'Secondary',
    description: 'Secondary buttons and subdued actions',
    keys: ['secondary', 'secondary-foreground'],
  },
  {
    label: 'Muted',
    description: 'Subtle backgrounds and helper text',
    keys: ['muted', 'muted-foreground'],
  },
  {
    label: 'Accent',
    description: 'Hover states, sidebar highlights, badges',
    keys: ['accent', 'accent-foreground'],
  },
  {
    label: 'Destructive',
    description: 'Delete, error, and danger actions',
    keys: ['destructive', 'destructive-foreground'],
  },
  {
    label: 'Borders & focus',
    description: 'Borders, inputs, and focus rings',
    keys: ['border', 'input', 'ring'],
  },
]

export const DEFAULT_LIGHT_COLORS: SemanticColors = {
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',
  card: 'oklch(1 0 0)',
  'card-foreground': 'oklch(0.145 0 0)',
  popover: 'oklch(1 0 0)',
  'popover-foreground': 'oklch(0.145 0 0)',
  primary: 'oklch(0.205 0 0)',
  'primary-foreground': 'oklch(0.985 0 0)',
  secondary: 'oklch(0.97 0 0)',
  'secondary-foreground': 'oklch(0.205 0 0)',
  muted: 'oklch(0.97 0 0)',
  'muted-foreground': 'oklch(0.556 0 0)',
  accent: 'oklch(0.97 0 0)',
  'accent-foreground': 'oklch(0.205 0 0)',
  destructive: 'oklch(0.577 0.245 27.325)',
  'destructive-foreground': 'oklch(0.985 0 0)',
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.708 0 0)',
}

export const DEFAULT_DARK_COLORS: SemanticColors = {
  background: 'oklch(0.145 0 0)',
  foreground: 'oklch(0.985 0 0)',
  card: 'oklch(0.205 0 0)',
  'card-foreground': 'oklch(0.985 0 0)',
  popover: 'oklch(0.205 0 0)',
  'popover-foreground': 'oklch(0.985 0 0)',
  primary: 'oklch(0.922 0 0)',
  'primary-foreground': 'oklch(0.205 0 0)',
  secondary: 'oklch(0.269 0 0)',
  'secondary-foreground': 'oklch(0.985 0 0)',
  muted: 'oklch(0.269 0 0)',
  'muted-foreground': 'oklch(0.708 0 0)',
  accent: 'oklch(0.269 0 0)',
  'accent-foreground': 'oklch(0.985 0 0)',
  destructive: 'oklch(0.704 0.191 22.216)',
  'destructive-foreground': 'oklch(0.985 0 0)',
  border: 'oklch(1 0 0 / 10%)',
  input: 'oklch(1 0 0 / 15%)',
  ring: 'oklch(0.556 0 0)',
}

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    light: DEFAULT_LIGHT_COLORS,
    dark: DEFAULT_DARK_COLORS,
  },
}

export const CSS_COLOR_VARS = SEMANTIC_COLOR_KEYS.map((key) => `--${key}` as const)

export function cloneThemeTokens(tokens: ThemeTokens): ThemeTokens {
  return {
    colors: {
      light: { ...tokens.colors.light },
      dark: { ...tokens.colors.dark },
    },
  }
}

export function mergeSemanticColors(
  base: SemanticColors,
  overrides?: Partial<SemanticColors> | Record<string, string>,
): SemanticColors {
  const merged = { ...base }
  if (!overrides) return merged

  for (const key of SEMANTIC_COLOR_KEYS) {
    const value = overrides[key]
    if (typeof value === 'string' && value.trim()) merged[key] = value.trim()
  }
  return merged
}

/** Normalize API/legacy token shapes into color-only ThemeTokens. */
export function normalizeThemeTokens(raw?: unknown): ThemeTokens {
  const tokens = (raw ?? {}) as Record<string, unknown>
  const colorsRaw = (tokens.colors ?? {}) as Record<string, unknown>

  let lightOverrides: Record<string, string> = {}
  let darkOverrides: Record<string, string> = {}

  if (colorsRaw.light && typeof colorsRaw.light === 'object') {
    lightOverrides = colorsRaw.light as Record<string, string>
  }
  if (colorsRaw.dark && typeof colorsRaw.dark === 'object') {
    darkOverrides = colorsRaw.dark as Record<string, string>
  }

  const hasModeSplit = Boolean(colorsRaw.light || colorsRaw.dark)
  if (!hasModeSplit) {
    const flat = colorsRaw as Record<string, string>
    lightOverrides = flat
    darkOverrides = flat
  }

  return {
    colors: {
      light: mergeSemanticColors(DEFAULT_LIGHT_COLORS, lightOverrides),
      dark: mergeSemanticColors(DEFAULT_DARK_COLORS, darkOverrides),
    },
  }
}

export function buildBrandThemeTokens(brand: {
  light?: Partial<SemanticColors>
  dark?: Partial<SemanticColors>
}): ThemeTokens {
  return {
    colors: {
      light: mergeSemanticColors(DEFAULT_LIGHT_COLORS, brand.light),
      dark: mergeSemanticColors(DEFAULT_DARK_COLORS, brand.dark),
    },
  }
}

export function formatColorLabel(key: SemanticColorKey): string {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getThemeTokenFieldId(mode: ThemeMode, key: SemanticColorKey): string {
  return `theme-token-field-${mode}-${key}`
}

export function themeTokensToCssProperties(
  tokens: ThemeTokens | unknown,
  mode: ThemeMode,
): Record<string, string> {
  const resolved = normalizeThemeTokens(tokens)
  const colors = resolved.colors[mode]
  const style: Record<string, string> = {}

  for (const key of SEMANTIC_COLOR_KEYS) {
    style[`--${key}`] = colors[key]
  }

  return style
}

/** Persist only color tokens to the API. */
export function serializeThemeTokens(tokens: ThemeTokens): ThemeTokens {
  return normalizeThemeTokens(tokens)
}
