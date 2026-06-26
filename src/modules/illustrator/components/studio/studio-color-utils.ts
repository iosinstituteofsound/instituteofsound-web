export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function hexToRgb(hex: string) {
  const raw = hex.replace('#', '')
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const num = Number.parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb(h: number, s: number, l: number) {
  const sn = s / 100
  const ln = l / 100

  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const hn = h / 360

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

export function hslToHex(h: number, s: number, l: number) {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

export function hueFromWheelClick(x: number, y: number, size: number) {
  const cx = size / 2
  const cy = size / 2
  const angle = Math.atan2(y - cy, x - cx)
  const deg = (angle * 180) / Math.PI + 90
  return ((deg % 360) + 360) % 360
}

export function rgbToHsb(r: number, g: number, b: number) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  const v = max
  const s = max === 0 ? 0 : d / max

  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      default:
        h = ((rn - gn) / d + 4) / 6
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  }
}

export function hsbToRgb(h: number, s: number, b: number) {
  const sn = s / 100
  const vn = b / 100
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => vn * (1 - sn * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255),
  }
}

export function hexToHsb(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsb(r, g, b)
}

export function hsbToHex(h: number, s: number, b: number) {
  const { r, g, b: blue } = hsbToRgb(h, s, b)
  return rgbToHex(r, g, blue)
}

export function angleFromCenter(x: number, y: number, cx: number, cy: number) {
  const angle = Math.atan2(y - cy, x - cx)
  const deg = (angle * 180) / Math.PI + 90
  return ((deg % 360) + 360) % 360
}

export function sbFromSquareClick(
  x: number,
  y: number,
  width: number,
  height: number,
): { s: number; b: number } {
  const s = clamp((x / width) * 100, 0, 100)
  const b = clamp(100 - (y / height) * 100, 0, 100)
  return { s: Math.round(s), b: Math.round(b) }
}

export function sbFromDiscClick(
  x: number,
  y: number,
  width: number,
  height: number,
): { s: number; b: number } {
  return sbFromSquareClick(x, y, width, height)
}

export type HarmonyMode =
  | 'complementary'
  | 'split-complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'

export function getHarmonyHues(mode: HarmonyMode, hue: number): number[] {
  const h = ((hue % 360) + 360) % 360
  switch (mode) {
    case 'complementary':
      return [h, (h + 180) % 360]
    case 'split-complementary':
      return [h, (h + 150) % 360, (h + 210) % 360]
    case 'analogous':
      return [(h + 330) % 360, h, (h + 30) % 360]
    case 'triadic':
      return [h, (h + 120) % 360, (h + 240) % 360]
    case 'tetradic':
      return [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360]
    default:
      return [h]
  }
}

export function markerPositionOnWheel(
  hue: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number } {
  const rad = ((hue - 90) * Math.PI) / 180
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy + Math.sin(rad) * radius,
  }
}

export function markerPositionOnSquare(
  s: number,
  b: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: (s / 100) * width,
    y: (1 - b / 100) * height,
  }
}

export function contrastTextColor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#111111' : '#ffffff'
}
