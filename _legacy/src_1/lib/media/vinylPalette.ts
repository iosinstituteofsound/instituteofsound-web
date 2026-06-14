/** Build vinyl groove colors from a cover accent hex. */
export function vinylPaletteFromHex(hex: string): {
  accent: string
  light: string
  dark: string
} {
  const n = hex.replace('#', '')
  if (n.length !== 6) {
    return { accent: '#1a5c6e', light: '#3d8fa8', dark: '#0d2a33' }
  }
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)

  const mix = (rr: number, gg: number, bb: number) =>
    `#${[rr, gg, bb].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`

  return {
    accent: hex,
    light: mix(r * 0.55 + 255 * 0.45, g * 0.55 + 255 * 0.45, b * 0.55 + 255 * 0.45),
    dark: mix(r * 0.35, g * 0.35, b * 0.35),
  }
}

export const VINYL_FALLBACK = vinylPaletteFromHex('#8b3a62')
