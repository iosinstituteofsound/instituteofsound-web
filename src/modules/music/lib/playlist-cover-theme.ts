import type { CSSProperties } from 'react'

export type PlaylistCoverTheme = {
  top: string
  mid: string
  glow: string
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = hex.replace('#', '')
  if (n.length !== 6) return null
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function themeFromRgb(r: number, g: number, b: number): PlaylistCoverTheme {
  const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
  const targetLum = 0.28
  const scale = lum > 0 ? targetLum / Math.max(lum, 0.08) : 1
  const dr = Math.min(255, r * scale * 0.72)
  const dg = Math.min(255, g * scale * 0.72)
  const db = Math.min(255, b * scale * 0.72)
  const mr = mix(dr, 18, 0.35)
  const mg = mix(dg, 18, 0.35)
  const mb = mix(db, 18, 0.35)
  return {
    top: rgbToHex(dr, dg, db),
    mid: rgbToHex(mr, mg, mb),
    glow: rgbToHex(mix(r, 255, 0.08), mix(g, 255, 0.08), mix(b, 255, 0.08)),
  }
}

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i += 1) h = (h + slug.charCodeAt(i) * 29) % 100000
  return h
}

export function fallbackPlaylistCoverTheme(slug: string): PlaylistCoverTheme {
  const hue = hashSlug(slug) % 360
  return themeFromRgb(
    80 + (hue % 80),
    40 + ((hue * 2) % 60),
    50 + ((hue * 3) % 70),
  )
}

export function extractPlaylistCoverTheme(url: string): Promise<PlaylistCoverTheme | null> {
  return new Promise((resolve) => {
    if (!url.trim()) {
      resolve(null)
      return
    }

    const img = new Image()
    const isLocal = url.startsWith('blob:') || url.startsWith('data:')
    if (!isLocal) img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const width = 64
        const height = 64
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const { data } = ctx.getImageData(0, 0, width, height)

        let rSum = 0
        let gSum = 0
        let bSum = 0
        let weightSum = 0

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const i = (y * width + x) * 4
            const r = data[i]!
            const g = data[i + 1]!
            const b = data[i + 2]!
            const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
            if (lum < 0.08 || lum > 0.95) continue
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const sat = max === 0 ? 0 : (max - min) / max
            const topBias = y < height * 0.55 ? 1.35 : 0.65
            const weight = (0.35 + sat * 0.9) * topBias
            rSum += r * weight
            gSum += g * weight
            bSum += b * weight
            weightSum += weight
          }
        }

        if (weightSum <= 0) {
          resolve(null)
          return
        }

        resolve(themeFromRgb(rSum / weightSum, gSum / weightSum, bSum / weightSum))
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => resolve(null)
    img.src = url
  })
}

export function playlistCoverThemeStyle(theme: PlaylistCoverTheme): CSSProperties {
  const top = hexToRgb(theme.top)
  const mid = hexToRgb(theme.mid)
  if (!top || !mid) return {}
  return {
    '--pl-theme-top': theme.top,
    '--pl-theme-mid': theme.mid,
    '--pl-theme-glow': theme.glow,
    '--pl-theme-top-rgb': `${top.r}, ${top.g}, ${top.b}`,
    '--pl-theme-mid-rgb': `${mid.r}, ${mid.g}, ${mid.b}`,
  } as CSSProperties
}
