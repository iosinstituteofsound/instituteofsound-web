import { normalizeAccentColor } from './branding'

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

/**
 * Sample a remote image and pick a vibrant accent hex (for branding).
 * Requires CORS on the image host (Cloudinary works).
 */
export function extractAccentFromImageUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url?.trim()) {
      resolve(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const size = 48
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        let bestScore = -1
        let best = { r: 212, g: 0, b: 0 }

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
          if (lum < 0.12 || lum > 0.92) continue
          const sat = saturation(r, g, b)
          const score = sat * (1 - Math.abs(lum - 0.45))
          if (score > bestScore) {
            bestScore = score
            best = { r, g, b }
          }
        }

        const hex = normalizeAccentColor(rgbToHex(best.r, best.g, best.b))
        resolve(hex)
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => resolve(null)
    img.src = url
  })
}
