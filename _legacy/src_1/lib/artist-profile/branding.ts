import type { CSSProperties } from 'react'
import { themeColors } from '@/lib/theme/tokens'

export type ArtistThemePreset = 'metal' | 'cinematic' | 'minimal' | 'raw'

export const DEFAULT_ACCENT_COLOR = themeColors.mhRed
export const DEFAULT_THEME_PRESET: ArtistThemePreset = 'metal'

export const ARTIST_THEME_PRESETS: {
  id: ArtistThemePreset
  label: string
  description: string
  suggestedAccent: string
}[] = [
  {
    id: 'metal',
    label: 'Brutalist Metal',
    description: 'Sharp IOS energy — red heat, display type, industrial edges.',
    suggestedAccent: themeColors.mhRed,
  },
  {
    id: 'cinematic',
    label: 'Cinematic Dark',
    description: 'Soft gradients, serif story moments, film-poster mood.',
    suggestedAccent: themeColors.crimson,
  },
  {
    id: 'minimal',
    label: 'Minimal Monochrome',
    description: 'Clean lines, quiet background — your accent does the talking.',
    suggestedAccent: themeColors.signal,
  },
  {
    id: 'raw',
    label: 'Raw Underground',
    description: 'Heavy grain, harsh contrast, zine / basement-show feel.',
    suggestedAccent: themeColors.rsRed,
  },
]

export const ACCENT_SWATCHES = [
  themeColors.mhRed,
  themeColors.rsRed,
  themeColors.crimson,
  '#6b21a8',
  '#2563eb',
  '#0d9488',
  themeColors.gold,
  themeColors.signal,
] as const

const HEX_RE = /^#?([0-9a-f]{6})$/i

export function normalizeAccentColor(input: string): string | null {
  const raw = input.trim()
  const m = raw.match(HEX_RE)
  if (!m) return null
  return `#${m[1].toLowerCase()}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeAccentColor(hex)
  if (!n) return null
  const h = n.slice(1)
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))))
  const r = f(rgb.r).toString(16).padStart(2, '0')
  const g = f(rgb.g).toString(16).padStart(2, '0')
  const b = f(rgb.b).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

export function isValidThemePreset(value: string): value is ArtistThemePreset {
  return ARTIST_THEME_PRESETS.some((p) => p.id === value)
}

export function resolveAccentColor(accent?: string | null): string {
  return normalizeAccentColor(accent ?? '') ?? DEFAULT_ACCENT_COLOR
}

export function resolveThemePreset(preset?: string | null): ArtistThemePreset {
  if (preset && isValidThemePreset(preset)) return preset
  return DEFAULT_THEME_PRESET
}

/** CSS variables injected on `.artist-site` */
export function artistBrandingStyle(
  accent?: string | null,
  _preset?: ArtistThemePreset
): CSSProperties {
  const color = resolveAccentColor(accent)
  const rgb = hexToRgb(color)
  if (!rgb) {
    return { ['--artist-accent' as string]: DEFAULT_ACCENT_COLOR }
  }
  const { r, g, b } = rgb
  return {
    ['--artist-accent' as string]: color,
    ['--artist-accent-rgb' as string]: `${r} ${g} ${b}`,
    ['--artist-accent-soft' as string]: `rgba(${r}, ${g}, ${b}, 0.14)`,
    ['--artist-accent-border' as string]: `rgba(${r}, ${g}, ${b}, 0.45)`,
    ['--artist-accent-glow' as string]: `rgba(${r}, ${g}, ${b}, 0.35)`,
    ['--artist-accent-dark' as string]: darken(color, 0.35),
    ['--artist-accent-text' as string]: color,
  }
}

export function artistSiteThemeClass(preset: ArtistThemePreset): string {
  return `artist-site-theme-${preset}`
}
