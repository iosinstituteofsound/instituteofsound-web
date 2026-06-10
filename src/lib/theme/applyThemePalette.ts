import { colorCssVarMap, colorPalettes, type ThemeColorName } from './design-tokens'
import type { ThemeMode } from './palettes'

/** Push design-tokens palette onto <html> so design-tokens.ts is the live source of truth. */
export function applyThemePalette(mode: ThemeMode) {
  if (typeof document === 'undefined') return

  const palette = colorPalettes[mode]
  const root = document.documentElement

  for (const key of Object.keys(palette) as ThemeColorName[]) {
    root.style.setProperty(colorCssVarMap[key], palette[key])
  }
}
