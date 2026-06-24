/**
 * Semantic color design tokens (shadcn/ui compatible).
 * Themes control colors and optional visual effects (liquid WebGL, etc.).
 */

import {
  cloneFluidConfig,
  normalizeFluidConfig,
  TRANSLUCENT_FLUID_CONFIG,
  type ThemeFluidConfig,
} from '@/shared/design-tokens/fluid-config'

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

export const SUBMISSION_STATUS_KEYS = [
  'new',
  'in_review',
  'shortlisted',
  'approved',
  'rejected',
  'archived',
] as const

export type SubmissionStatusKey = (typeof SUBMISSION_STATUS_KEYS)[number]
export type SubmissionStatusColors = Record<SubmissionStatusKey, string>

export interface ThemeTokens {
  colors: Record<ThemeMode, SemanticColors>
  statusColors?: Record<ThemeMode, SubmissionStatusColors>
  /** Visual effect variant — e.g. `liquid-webgl` for animated shader backgrounds */
  badgeVariant?: string
  /** PavelDoGreat fluid simulation settings (super-admin configurable) */
  fluidConfig?: ThemeFluidConfig
}

export type { ThemeFluidConfig }

export const TRANSLUCENT_THEME_SLUG = 'translucent'
export const LIQUID_WEBGL_VARIANT = 'liquid-webgl'

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

export const STATUS_COLOR_GROUPS: Array<{
  label: string
  description: string
  keys: SubmissionStatusKey[]
}> = [
  {
    label: 'Submission statuses',
    description: 'Colors for submission inbox status labels and badges',
    keys: [...SUBMISSION_STATUS_KEYS],
  },
]

/** Metal Hammer magazine palette — light mode (paper + blood red). */
export const METAL_HAMMER_LIGHT_COLORS: SemanticColors = {
  background: 'oklch(0.985 0 0)',
  foreground: 'oklch(0.12 0 0)',
  card: 'oklch(1 0 0)',
  'card-foreground': 'oklch(0.12 0 0)',
  popover: 'oklch(1 0 0)',
  'popover-foreground': 'oklch(0.12 0 0)',
  primary: 'oklch(0.55 0.254 25)',
  'primary-foreground': 'oklch(0.985 0 0)',
  secondary: 'oklch(0.96 0 0)',
  'secondary-foreground': 'oklch(0.12 0 0)',
  muted: 'oklch(0.96 0 0)',
  'muted-foreground': 'oklch(0.5 0 0)',
  accent: 'oklch(0.62 0.28 25)',
  'accent-foreground': 'oklch(0.985 0 0)',
  destructive: 'oklch(0.48 0.2 15)',
  'destructive-foreground': 'oklch(0.985 0 0)',
  border: 'oklch(0.88 0 0)',
  input: 'oklch(0.88 0 0)',
  ring: 'oklch(0.55 0.254 25)',
}

/** Metal Hammer magazine palette — dark mode (void black + signal red). */
export const METAL_HAMMER_DARK_COLORS: SemanticColors = {
  background: 'oklch(0.08 0 0)',
  foreground: 'oklch(0.985 0 0)',
  card: 'oklch(0.11 0 0)',
  'card-foreground': 'oklch(0.985 0 0)',
  popover: 'oklch(0.11 0 0)',
  'popover-foreground': 'oklch(0.985 0 0)',
  primary: 'oklch(0.55 0.254 25)',
  'primary-foreground': 'oklch(0.985 0 0)',
  secondary: 'oklch(0.16 0 0)',
  'secondary-foreground': 'oklch(0.985 0 0)',
  muted: 'oklch(0.16 0 0)',
  'muted-foreground': 'oklch(0.55 0 0)',
  accent: 'oklch(0.62 0.28 25)',
  'accent-foreground': 'oklch(0.985 0 0)',
  destructive: 'oklch(0.48 0.2 15)',
  'destructive-foreground': 'oklch(0.985 0 0)',
  border: 'oklch(1 0 0 / 12%)',
  input: 'oklch(1 0 0 / 15%)',
  ring: 'oklch(0.55 0.254 25)',
}

export const DEFAULT_LIGHT_COLORS: SemanticColors = METAL_HAMMER_LIGHT_COLORS

export const DEFAULT_DARK_COLORS: SemanticColors = METAL_HAMMER_DARK_COLORS

/** Default submission status colors — aligned with ios-dashboard semantic aliases. */
export const DEFAULT_LIGHT_STATUS_COLORS: SubmissionStatusColors = {
  new: 'oklch(0.48 0.12 250)',
  in_review: DEFAULT_LIGHT_COLORS.primary,
  shortlisted: 'oklch(0.62 0.18 55)',
  approved: 'oklch(0.58 0.16 150)',
  rejected: DEFAULT_LIGHT_COLORS.destructive,
  archived: DEFAULT_LIGHT_COLORS['muted-foreground'],
}

export const DEFAULT_DARK_STATUS_COLORS: SubmissionStatusColors = {
  new: 'oklch(0.72 0.12 250)',
  in_review: DEFAULT_DARK_COLORS.primary,
  shortlisted: 'oklch(0.78 0.16 55)',
  approved: 'oklch(0.72 0.16 150)',
  rejected: DEFAULT_DARK_COLORS.destructive,
  archived: DEFAULT_DARK_COLORS['muted-foreground'],
}

export const METAL_HAMMER_THEME_TOKENS: ThemeTokens = {
  colors: {
    light: METAL_HAMMER_LIGHT_COLORS,
    dark: METAL_HAMMER_DARK_COLORS,
  },
}

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    light: DEFAULT_LIGHT_COLORS,
    dark: DEFAULT_DARK_COLORS,
  },
  statusColors: {
    light: DEFAULT_LIGHT_STATUS_COLORS,
    dark: DEFAULT_DARK_STATUS_COLORS,
  },
}

export const CSS_COLOR_VARS = SEMANTIC_COLOR_KEYS.map((key) => `--${key}` as const)

export const CSS_STATUS_VARS = SUBMISSION_STATUS_KEYS.map(
  (key) => `--status-${key.replace(/_/g, '-')}` as const,
)

export function cloneThemeTokens(tokens: ThemeTokens): ThemeTokens {
  const normalized = normalizeThemeTokens(tokens)
  return {
    colors: {
      light: { ...normalized.colors.light },
      dark: { ...normalized.colors.dark },
    },
    statusColors: {
      light: { ...normalized.statusColors!.light },
      dark: { ...normalized.statusColors!.dark },
    },
    ...(normalized.badgeVariant ? { badgeVariant: normalized.badgeVariant } : {}),
    ...(normalized.fluidConfig ? { fluidConfig: cloneFluidConfig(normalized.fluidConfig) } : {}),
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

export function mergeStatusColors(
  base: SubmissionStatusColors,
  overrides?: Partial<SubmissionStatusColors> | Record<string, string>,
): SubmissionStatusColors {
  const merged = { ...base }
  if (!overrides) return merged

  for (const key of SUBMISSION_STATUS_KEYS) {
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

  const badgeVariant =
    typeof tokens.badgeVariant === 'string' && tokens.badgeVariant.trim()
      ? tokens.badgeVariant.trim()
      : undefined

  const fluidConfig =
    tokens.fluidConfig && typeof tokens.fluidConfig === 'object'
      ? normalizeFluidConfig(tokens.fluidConfig, TRANSLUCENT_FLUID_CONFIG)
      : undefined

  const lightColors = mergeSemanticColors(DEFAULT_LIGHT_COLORS, lightOverrides)
  const darkColors = mergeSemanticColors(DEFAULT_DARK_COLORS, darkOverrides)

  const statusRaw = (tokens.statusColors ?? {}) as Record<string, unknown>
  let lightStatusOverrides: Record<string, string> = {}
  let darkStatusOverrides: Record<string, string> = {}

  if (statusRaw.light && typeof statusRaw.light === 'object') {
    lightStatusOverrides = statusRaw.light as Record<string, string>
  }
  if (statusRaw.dark && typeof statusRaw.dark === 'object') {
    darkStatusOverrides = statusRaw.dark as Record<string, string>
  }

  const hasStatusModeSplit = Boolean(statusRaw.light || statusRaw.dark)
  if (!hasStatusModeSplit && Object.keys(statusRaw).length > 0) {
    const flat = statusRaw as Record<string, string>
    lightStatusOverrides = flat
    darkStatusOverrides = flat
  }

  return {
    colors: {
      light: lightColors,
      dark: darkColors,
    },
    statusColors: {
      light: mergeStatusColors(DEFAULT_LIGHT_STATUS_COLORS, lightStatusOverrides),
      dark: mergeStatusColors(DEFAULT_DARK_STATUS_COLORS, darkStatusOverrides),
    },
    ...(badgeVariant ? { badgeVariant } : {}),
    ...(fluidConfig ? { fluidConfig } : {}),
  }
}

export function buildBrandThemeTokens(brand: {
  light?: Partial<SemanticColors>
  dark?: Partial<SemanticColors>
  badgeVariant?: string
  fluidConfig?: ThemeFluidConfig
}): ThemeTokens {
  const result: ThemeTokens = {
    colors: {
      light: mergeSemanticColors(DEFAULT_LIGHT_COLORS, brand.light),
      dark: mergeSemanticColors(DEFAULT_DARK_COLORS, brand.dark),
    },
  }
  if (brand.badgeVariant?.trim()) result.badgeVariant = brand.badgeVariant.trim()
  if (brand.fluidConfig) result.fluidConfig = normalizeFluidConfig(brand.fluidConfig, TRANSLUCENT_FLUID_CONFIG)
  return result
}

/** Glassy translucent palette — violet glass UI over calm cyan-violet liquid. */
export const TRANSLUCENT_THEME_TOKENS: ThemeTokens = buildBrandThemeTokens({
  badgeVariant: LIQUID_WEBGL_VARIANT,
  fluidConfig: TRANSLUCENT_FLUID_CONFIG,
  light: {
    background: 'oklch(0.985 0.012 288 / 16%)',
    foreground: 'oklch(0.24 0.045 288)',
    card: 'oklch(0.995 0.008 288 / 36%)',
    'card-foreground': 'oklch(0.24 0.045 288)',
    popover: 'oklch(0.995 0.01 288 / 52%)',
    'popover-foreground': 'oklch(0.24 0.045 288)',
    primary: 'oklch(0.52 0.17 288)',
    'primary-foreground': 'oklch(0.985 0 0)',
    secondary: 'oklch(0.96 0.02 288 / 42%)',
    'secondary-foreground': 'oklch(0.28 0.05 288)',
    muted: 'oklch(0.96 0.018 288 / 38%)',
    'muted-foreground': 'oklch(0.46 0.05 288)',
    accent: 'oklch(0.62 0.11 210)',
    'accent-foreground': 'oklch(0.22 0.05 288)',
    destructive: 'oklch(0.52 0.2 25)',
    'destructive-foreground': 'oklch(0.985 0 0)',
    border: 'oklch(0.55 0.06 288 / 14%)',
    input: 'oklch(0.55 0.06 288 / 18%)',
    ring: 'oklch(0.52 0.17 288)',
  },
  dark: {
    background: 'oklch(0.11 0.055 288 / 82%)',
    foreground: 'oklch(0.96 0.015 288)',
    card: 'oklch(0.15 0.058 288 / 80%)',
    'card-foreground': 'oklch(0.96 0.015 288)',
    popover: 'oklch(0.17 0.058 288 / 90%)',
    'popover-foreground': 'oklch(0.96 0.015 288)',
    primary: 'oklch(0.74 0.16 288)',
    'primary-foreground': 'oklch(0.12 0.045 288)',
    secondary: 'oklch(0.20 0.052 288 / 72%)',
    'secondary-foreground': 'oklch(0.92 0.02 288)',
    muted: 'oklch(0.19 0.05 288 / 70%)',
    'muted-foreground': 'oklch(0.74 0.04 288)',
    accent: 'oklch(0.68 0.13 210)',
    'accent-foreground': 'oklch(0.96 0.015 288)',
    destructive: 'oklch(0.65 0.19 25)',
    'destructive-foreground': 'oklch(0.98 0 0)',
    border: 'oklch(0.78 0.06 288 / 20%)',
    input: 'oklch(0.72 0.05 288 / 24%)',
    ring: 'oklch(0.74 0.16 288)',
  },
})

export function formatColorLabel(key: SemanticColorKey): string {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatStatusColorLabel(key: SubmissionStatusKey): string {
  const labels: Record<SubmissionStatusKey, string> = {
    new: 'New',
    in_review: 'Under Review',
    shortlisted: 'Shortlisted',
    approved: 'Approved',
    rejected: 'Rejected',
    archived: 'Archived',
  }
  return labels[key]
}

export function statusKeyToCssVar(key: SubmissionStatusKey): string {
  return `--status-${key.replace(/_/g, '-')}`
}

export function getThemeTokenFieldId(mode: ThemeMode, key: SemanticColorKey): string {
  return `theme-token-field-${mode}-${key}`
}

export function getThemeStatusFieldId(mode: ThemeMode, key: SubmissionStatusKey): string {
  return `theme-status-field-${mode}-${key}`
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

  const statusColors = resolved.statusColors?.[mode]
  if (statusColors) {
    for (const key of SUBMISSION_STATUS_KEYS) {
      style[statusKeyToCssVar(key)] = statusColors[key]
    }
  }

  return style
}

/** Persist only color tokens to the API. */
export function serializeThemeTokens(tokens: ThemeTokens): ThemeTokens {
  return normalizeThemeTokens(tokens)
}
