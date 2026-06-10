import { colorPalettes, themeMetaColors } from './design-tokens'

/** Add themes here — palette colors live in design-tokens `colorPalettes`. */
export const themeDefinitions = {
  dark: {
    label: 'Dark',
    hint: 'Classic IOS black',
    colorScheme: 'dark',
  },
  bright: {
    label: 'Bright',
    hint: 'Light editorial',
    colorScheme: 'light',
  },
  metallic: {
    label: 'Metallic',
    hint: 'Gunmetal steel',
    colorScheme: 'dark',
  },
  obsidian: {
    label: 'Obsidian',
    hint: 'Dark grid · violet',
    colorScheme: 'dark',
  },
  inferno: {
    label: 'Inferno',
    hint: 'Molten ember · fire glow',
    colorScheme: 'dark',
  },
} as const

export type ThemeMode = keyof typeof themeDefinitions

export const THEME_STORAGE_KEY = 'ios-theme-mode'

export const themeModeLabels: Record<ThemeMode, string> = Object.fromEntries(
  Object.entries(themeDefinitions).map(([id, def]) => [id, def.label]),
) as Record<ThemeMode, string>

export const themeModeHints: Record<ThemeMode, string> = Object.fromEntries(
  Object.entries(themeDefinitions).map(([id, def]) => [id, def.hint]),
) as Record<ThemeMode, string>

export const themeModes = Object.keys(themeDefinitions) as ThemeMode[]

export { colorPalettes, themeMetaColors }

function paletteToLegacy(mode: ThemeMode) {
  const p = colorPalettes[mode]
  return {
    void: p.void,
    signal: p.signal,
    muted: p.muted,
    surface: p.surface,
    paper: p.paper,
    elevated: p.elevated,
    border: p.border,
    edge: p.edge,
    'rs-red': p.rsRed,
    'mh-red': p.mhRed,
    'mh-black': p.mhBlack,
    neon: p.neon,
    crimson: p.crimson,
    gold: p.gold,
    foreground: p.foreground,
    'muted-foreground': p.mutedForeground,
    background: p.background,
  } as const
}

/** Kebab-case palette maps (legacy CSS key style) */
export const darkPalette = paletteToLegacy('dark')
export const brightPalette = paletteToLegacy('bright')
export const metallicPalette = paletteToLegacy('metallic')
export const obsidianPalette = paletteToLegacy('obsidian')
export const infernoPalette = paletteToLegacy('inferno')

export type ThemeToken = keyof typeof darkPalette

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value != null && value in themeDefinitions
}

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'dark'
  } catch {
    return 'dark'
  }
}

export function themeColorScheme(mode: ThemeMode): 'light' | 'dark' {
  return themeDefinitions[mode].colorScheme
}
