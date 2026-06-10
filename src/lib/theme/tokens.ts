import {
  colorCssVarMap,
  colorPalettes,
  designTokens,
  type ThemeColorName,
} from './design-tokens'

export { designTokens, colorPalettes, colorCssVarMap }
export type { ThemeColorName }

/** Default (dark) colors for static fallbacks */
export const themeColors = { ...colorPalettes.dark } as const

export type ThemeColor = ThemeColorName

/** CSS var() for ios-prefixed tokens — works in inline styles & SVG */
export function themeVar(color: ThemeColorName): string {
  return `var(${colorCssVarMap[color]})`
}

/** Read resolved color from DOM (for canvas). Falls back to dark palette. */
export function resolveThemeColor(color: ThemeColorName): string {
  const cssVar = colorCssVarMap[color]
  if (typeof document !== 'undefined') {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
    if (resolved) return resolved
  }
  return colorPalettes.dark[color]
}

/** Read any ios design token from DOM */
export function resolveThemeToken(cssVar: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return resolved || fallback
}
