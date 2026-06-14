/**
 * ═══════════════════════════════════════════════════════════════
 *  IOS DESIGN SYSTEM — SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════
 *
 *  Theme colors change karne ke liye `colorPalettes` edit karo.
 *  UI accent (sidebar, buttons, kickers, glows): `accent`, `accentBright`, `accentDeep`
 *
 *  Runtime: ThemeContext `applyThemePalette()` se yahan ki values <html> par lagati hai.
 *  `theme-tokens.css` sirf first-paint fallback hai — sync optional.
 *
 *  Naya theme: (1) yahan palette copy+edit, (2) palettes.ts `themeDefinitions`,
 *  (3) theme-tokens.css fallback block, (4) index.html boot metaColors.
 *  Fonts, spacing, radii, etc. shared hain — dono modes mein same.
 *
 *  Usage in React:
 *    import { useTheme, themeVar, designTokens } from '@/lib/theme'
 *
 *  Usage in CSS:
 *    var(--ios-color-mh-red)
 *    var(--ios-text-sm)
 *    var(--ios-space-4)
 *
 *  Usage in Tailwind (via @theme bridge in index.css):
 *    bg-void  text-signal  font-sans  p-ios-4
 * ═══════════════════════════════════════════════════════════════
 */

import type { ThemeMode } from './palettes'

/* ── Colors (per mode) ─────────────────────────────────────── */

export const colorPalettes = {
  dark: {
    void: '#050505',
    signal: '#f5f5f5',
    muted: '#e9e9e9',
    surface: '#0c0c0c',
    paper: '#6d6c6c',
    elevated: '#161616',
    border: '#2a2a2a',
    edge: '#3d3d3d',
    rsRed: '#e31b23',
    mhRed: '#d40000',
    mhBlack: '#0b0b0b',
    neon: '#553838',
    crimson: '#8b1538',
    gold: '#ca8a04',
    foreground: '#f5f5f5',
    mutedForeground: '#e9e9e9',
    background: '#050505',
    accent: '#d40000',
    accentBright: '#e31b23',
    accentDeep: '#a80000',
  },
  bright: {
    void: '#ffffff',
    signal: '#121212',
    muted: '#6b6b6b',
    surface: '#faf9f9',
    paper: '#eeedea',
    elevated: '#e4e3e0',
    border: '#d0cfcc',
    edge: '#a8a7a4',
    rsRed: '#660c0f',
    mhRed: '#3a3a3a',
    mhBlack: '#1a1a1a',
    neon: '#a02929',
    crimson: '#8b1538',
    gold: '#ca8a04',
    foreground: '#121212',
    mutedForeground: '#6b6b6b',
    background: '#e5cc80',
    accent: '#000000',
    accentBright: '#505050',
    accentDeep: '#8a8a8a',
  },
  metallic: {
    void: '#161a22',
    signal: '#e2e8f0',
    muted: '#8b95a8',
    surface: '#11141a',
    paper: '#161a22',
    elevated: '#1e2430',
    border: '#2a3344',
    edge: '#3d4a5c',
    rsRed: '#2b1f1f',
    mhRed: '#333649',
    mhBlack: '#06080c',
    neon: '#94a3b8',
    crimson: '#3a3032',
    gold: '#c9a227',
    foreground: '#e2e8f0',
    mutedForeground: '#8b95a8',
    background: '#0a0c10',
    accent: '#94a3b8',
    accentBright: '#cbd5e1',
    accentDeep: '#64748b',
  },
  /** Dark + subtle grid pattern — violet accent (duplicate dark, tweak colors) */
  obsidian: {
    void: '#07080f',
    signal: '#e8eaf2',
    muted: '#8b90a8',
    surface: '#0d0f18',
    paper: '#12151f',
    elevated: '#181c28',
    border: '#252a3a',
    edge: '#363d52',
    rsRed: '#a78bfa',
    mhRed: '#8b5cf6',
    mhBlack: '#04050a',
    neon: '#8b5cf6',
    crimson: '#5b21b6',
    gold: '#c9a227',
    foreground: '#e8eaf2',
    mutedForeground: '#8b90a8',
    background: '#07080f',
    accent: '#8b5cf6',
    accentBright: '#a78bfa',
    accentDeep: '#6d28d9',
  },
  /** Molten ember — warm void, fire-orange accent, heat-line pattern */
  inferno: {
    void: '#0a0504',
    signal: '#fff5eb',
    muted: '#a89488',
    surface: '#120907',
    paper: '#1a0f0c',
    elevated: '#221410',
    border: '#3d2520',
    edge: '#5c3830',
    rsRed: '#ff8c42',
    mhRed: '#ff4500',
    mhBlack: '#050302',
    neon: '#ff6b35',
    crimson: '#9a3412',
    gold: '#f59e0b',
    foreground: '#fff5eb',
    mutedForeground: '#a89488',
    background: '#0a0504',
    accent: '#ff4500',
    accentBright: '#ff8c42',
    accentDeep: '#c2410c',
  },
} as const

export type ThemeColorName = keyof typeof colorPalettes.dark

/* ── Typography ────────────────────────────────────────────── */

export const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Space Grotesk', system-ui, sans-serif",
  display: "'Syne', system-ui, sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace",
} as const

export const fontSizes = {
  '2xs': '0.4375rem', // 7px
  xs: '0.5625rem', // 9px
  sm: '0.6875rem', // 11px — buttons, tabs
  md: '0.75rem', // 12px
  base: '0.875rem', // 14px — body, inputs
  lg: '1rem', // 16px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  '4xl': '3rem', // 48px
  '5xl': '4rem', // 64px — hero display
} as const

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

export const lineHeights = {
  none: '1',
  tight: '1.2',
  snug: '1.35',
  normal: '1.5',
  relaxed: '1.65',
  loose: '1.8',
} as const

/** Editorial uppercase tracking — IOS metal labels */
export const letterSpacing = {
  tight: '0.05em',
  normal: '0.12em',
  wide: '0.18em',
  wider: '0.22em',
  label: '0.28em',
  kicker: '0.35em',
  display: '0.55em',
} as const

/* ── Spacing scale ─────────────────────────────────────────── */

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

/* ── Radii ─────────────────────────────────────────────────── */

export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  '2xl': '20px',
  full: '9999px',
  /** ios-input clip corner */
  input: '6px',
  /** ios-btn clip corner */
  button: '10px',
} as const

/* ── Shadows ───────────────────────────────────────────────── */

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
  md: '0 8px 24px -8px rgba(0, 0, 0, 0.45)',
  lg: '0 24px 80px -20px rgba(0, 0, 0, 0.55)',
  red: '0 8px 24px -8px rgba(212, 0, 0, 0.55)',
  redLg: '0 24px 80px -20px rgba(212, 0, 0, 0.35)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
} as const

/* ── Motion ────────────────────────────────────────────────── */

export const durations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const

export const easings = {
  default: 'ease',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/* ── Z-index scale ─────────────────────────────────────────── */

export const zIndex = {
  base: '0',
  raised: '10',
  dropdown: '50',
  sticky: '60',
  overlay: '80',
  modal: '100',
  toast: '110',
  loader: '10001',
} as const

/* ── App shell layout ──────────────────────────────────────── */

export const shell = {
  sidebarWidth: '19rem',
  railWidth: '20.5rem',
  topbarHeight: '3.625rem',
  mobileNavHeight: '4.5rem',
  contentMaxWidth: '90rem',
} as const

/* ── Aggregated export ─────────────────────────────────────── */

export const designTokens = {
  colors: colorPalettes,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  spacing,
  radii,
  shadows,
  durations,
  easings,
  zIndex,
  shell,
} as const

/** Meta theme-color for PWA / mobile browser chrome */
export const themeMetaColors: Record<ThemeMode, string> = {
  dark: colorPalettes.dark.void,
  bright: colorPalettes.bright.void,
  metallic: colorPalettes.metallic.void,
  obsidian: colorPalettes.obsidian.void,
  inferno: colorPalettes.inferno.void,
}

/** Map JS color key → CSS custom property name */
export const colorCssVarMap: Record<ThemeColorName, string> = {
  void: '--ios-color-void',
  signal: '--ios-color-signal',
  muted: '--ios-color-muted',
  surface: '--ios-color-surface',
  paper: '--ios-color-paper',
  elevated: '--ios-color-elevated',
  border: '--ios-color-border',
  edge: '--ios-color-edge',
  rsRed: '--ios-color-rs-red',
  mhRed: '--ios-color-mh-red',
  mhBlack: '--ios-color-mh-black',
  neon: '--ios-color-neon',
  crimson: '--ios-color-crimson',
  gold: '--ios-color-gold',
  foreground: '--ios-color-foreground',
  mutedForeground: '--ios-color-muted-foreground',
  background: '--ios-color-background',
  accent: '--ios-color-accent',
  accentBright: '--ios-color-accent-bright',
  accentDeep: '--ios-color-accent-deep',
}

/** Tailwind bridge names (without --color- prefix) */
export const tailwindColorBridge: Record<ThemeColorName, string> = {
  void: '--color-void',
  signal: '--color-signal',
  muted: '--color-muted',
  surface: '--color-surface',
  paper: '--color-paper',
  elevated: '--color-elevated',
  border: '--color-border',
  edge: '--color-edge',
  rsRed: '--color-rs-red',
  mhRed: '--color-mh-red',
  mhBlack: '--color-mh-black',
  neon: '--color-neon',
  crimson: '--color-crimson',
  gold: '--color-gold',
  foreground: '--color-foreground',
  mutedForeground: '--color-muted-foreground',
  background: '--color-background',
  accent: '--color-accent',
  accentBright: '--color-accent-bright',
  accentDeep: '--color-accent-deep',
}
