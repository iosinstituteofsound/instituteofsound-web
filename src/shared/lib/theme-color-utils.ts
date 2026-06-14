const DEFAULT_HEX = '#2563eb'

export type ParsedCssColor = {
  r: number
  g: number
  b: number
  alpha: number
}

export type OklchParts = {
  l: string
  c: string
  h: string
  alpha: number
}

export type CssColorFormat = 'oklch' | 'hex' | 'rgba' | 'other'

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function clampAlpha(value: number) {
  return Math.min(1, Math.max(0, value))
}

function parseAlphaComponent(raw: string): number {
  const trimmed = raw.trim()
  if (trimmed.endsWith('%')) return clampAlpha(Number.parseFloat(trimmed) / 100)
  return clampAlpha(Number.parseFloat(trimmed))
}

function hexToRgb(hex: string): ParsedCssColor | null {
  const normalized = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
      alpha: 1,
    }
  }
  if (/^#[0-9a-fA-F]{8}$/.test(normalized)) {
    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
      alpha: Number.parseInt(normalized.slice(7, 9), 16) / 255,
    }
  }
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const [, r, g, b] = normalized
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
      alpha: 1,
    }
  }
  if (/^#[0-9a-fA-F]{4}$/.test(normalized)) {
    const [, r, g, b, a] = normalized
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
      alpha: Number.parseInt(`${a}${a}`, 16) / 255,
    }
  }
  return null
}

function parseRgbFunction(color: string): ParsedCssColor | null {
  const match = color
    .trim()
    .match(/^rgba?\(\s*([\d.]+)(?:%?)\s*,?\s*([\d.]+)(?:%?)\s*,?\s*([\d.]+)(?:%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i)
  if (!match) return null

  const toChannel = (value: string) => {
    const parsed = Number.parseFloat(value)
    return value.includes('%') ? clampChannel((parsed / 100) * 255) : clampChannel(parsed)
  }

  return {
    r: toChannel(match[1]),
    g: toChannel(match[2]),
    b: toChannel(match[3]),
    alpha: match[4] ? parseAlphaComponent(match[4]) : 1,
  }
}

export function parseOklch(color: string): OklchParts | null {
  const match = color
    .trim()
    .match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i)
  if (!match) return null

  return {
    l: match[1],
    c: match[2],
    h: match[3],
    alpha: match[4] ? parseAlphaComponent(match[4]) : 1,
  }
}

export function formatOklch(parts: Pick<OklchParts, 'l' | 'c' | 'h'>, alpha: number): string {
  const clampedAlpha = clampAlpha(alpha)
  if (clampedAlpha >= 1) return `oklch(${parts.l} ${parts.c} ${parts.h})`

  const alphaLabel =
    Number.isInteger(clampedAlpha * 100) || clampedAlpha >= 0.01
      ? `${Math.round(clampedAlpha * 1000) / 10}%`
      : `${Math.round(clampedAlpha * 1000) / 1000}`

  return `oklch(${parts.l} ${parts.c} ${parts.h} / ${alphaLabel})`
}

export function detectCssColorFormat(color: string): CssColorFormat {
  const trimmed = color.trim()
  if (/^oklch\(/i.test(trimmed)) return 'oklch'
  if (/^#/.test(trimmed)) return 'hex'
  if (/^rgba?\(/i.test(trimmed)) return 'rgba'
  return 'other'
}

function parseCssColorViaCanvas(color: string): ParsedCssColor | null {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  try {
    ctx.fillStyle = color.trim()
  } catch {
    return null
  }

  if (ctx.fillStyle === '#000000' && !/^#000/i.test(color.trim()) && !/^black$/i.test(color.trim())) {
    // Invalid colors sometimes silently fall back to black — verify with DOM probe below.
  }

  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  const parsed = hexToRgb(color) ?? parseRgbFunction(color) ?? parseOklch(color)
  const alpha = parsed?.alpha ?? (a === 255 ? 1 : a / 255)

  return { r, g, b, alpha: clampAlpha(alpha) }
}

function parseCssColorViaDom(color: string): ParsedCssColor | null {
  if (typeof document === 'undefined') return null

  const probe = document.createElement('span')
  probe.style.color = color.trim()
  if (!probe.style.color) return null

  document.documentElement.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()

  return parseRgbFunction(resolved)
}

export function parseCssColor(color: string): ParsedCssColor | null {
  const trimmed = color?.trim()
  if (!trimmed) return null

  const direct = hexToRgb(trimmed) ?? parseRgbFunction(trimmed)
  if (direct) return direct

  const oklch = parseOklch(trimmed)
  if (oklch) {
    const viaDom = parseCssColorViaDom(trimmed)
    if (viaDom) return { ...viaDom, alpha: oklch.alpha }
  }

  return parseCssColorViaDom(trimmed) ?? parseCssColorViaCanvas(trimmed)
}

export function rgbToHex({ r, g, b }: Pick<ParsedCssColor, 'r' | 'g' | 'b'>): string {
  return `#${[r, g, b].map((channel) => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`
}

export function formatCssColor(
  color: Pick<ParsedCssColor, 'r' | 'g' | 'b' | 'alpha'>,
  options?: { format?: CssColorFormat; oklch?: Pick<OklchParts, 'l' | 'c' | 'h'> | null },
): string {
  const alpha = clampAlpha(color.alpha)
  const rgb = {
    r: clampChannel(color.r),
    g: clampChannel(color.g),
    b: clampChannel(color.b),
  }

  if (options?.format === 'oklch' && options.oklch) {
    return formatOklch(options.oklch, alpha)
  }

  if (alpha >= 1) return rgbToHex(rgb)

  const roundedAlpha = Math.round(alpha * 1000) / 1000
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${roundedAlpha})`
}

export function cssColorToHex(color: string): string {
  const parsed = parseCssColor(color)
  if (!parsed) return DEFAULT_HEX
  return rgbToHex(parsed)
}

export function getContrastForeground(color: string): string {
  const parsed = parseCssColor(color)
  if (!parsed) return '#fafafa'

  const { r, g, b } = parsed
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#171717' : '#fafafa'
}

export function cssColorPreviewValue(color: string): string {
  const trimmed = color?.trim()
  return trimmed || 'transparent'
}
