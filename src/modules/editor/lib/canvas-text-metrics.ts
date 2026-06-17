import { resolveFontFamily } from '@/modules/editor/lib/article-font-library'

export interface TextInkMetrics {
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  minHeight: number
  minWidth: number
}

const DEFAULT_METRICS: TextInkMetrics = {
  paddingTop: 6,
  paddingRight: 5,
  paddingBottom: 8,
  paddingLeft: 5,
  minHeight: 24,
  minWidth: 16,
}

function primaryFontFamily(fontFamilyId: string): string {
  const cssFamily = resolveFontFamily(fontFamilyId)
  const first = cssFamily.split(',')[0]?.trim() ?? 'sans-serif'
  return first.replace(/^["']|["']$/g, '')
}

export function primaryFontFamilyForMeasure(fontFamilyId: string): string {
  return primaryFontFamily(fontFamilyId)
}

function buildFontString(
  fontSize: number,
  fontWeight: string,
  fontStyle: string,
  fontFamilyId: string,
): string {
  const family = primaryFontFamily(fontFamilyId)
  return `${fontStyle} ${fontWeight} ${fontSize}px "${family}", ${family}, sans-serif`
}

export function measureTextInk(
  text: string,
  fontSize: number,
  fontWeight: string,
  fontStyle: string,
  fontFamilyId: string,
): TextInkMetrics {
  if (typeof document === 'undefined') return DEFAULT_METRICS

  const sample = (text.trim() || 'Agpy').replace(/\s+/g, ' ')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return DEFAULT_METRICS

  ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamilyId)

  let maxAscent = 0
  let maxDescent = 0
  let maxLeft = 0
  let maxWidth = 0
  let maxRight = 0

  for (const line of sample.split('\n')) {
    const lineText = line || ' '
    let lineAscent = 0
    let lineDescent = 0
    let lineLeft = 0
    let lineRight = 0
    let lineWidth = 0

    for (const char of lineText) {
      const metrics = ctx.measureText(char)
      const ascent = metrics.actualBoundingBoxAscent ?? fontSize * 0.82
      const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.24
      const left = metrics.actualBoundingBoxLeft ?? 0
      const right = metrics.actualBoundingBoxRight ?? metrics.width

      lineAscent = Math.max(lineAscent, ascent)
      lineDescent = Math.max(lineDescent, descent)
      lineLeft = Math.max(lineLeft, left)
      lineRight = Math.max(lineRight, right)
      lineWidth += metrics.width
    }

    const whole = ctx.measureText(lineText)
    lineWidth = Math.max(lineWidth, whole.width)
    lineLeft = Math.max(lineLeft, whole.actualBoundingBoxLeft ?? 0)
    lineRight = Math.max(lineRight, whole.actualBoundingBoxRight ?? whole.width)

    maxAscent = Math.max(maxAscent, lineAscent)
    maxDescent = Math.max(maxDescent, lineDescent)
    maxLeft = Math.max(maxLeft, lineLeft)
    maxWidth = Math.max(maxWidth, lineWidth)
    maxRight = Math.max(maxRight, lineRight)
  }

  const micro = Math.max(4, Math.round(fontSize * 0.05))
  const paddingTop = Math.ceil(maxAscent * 0.12 + micro)
  const paddingBottom = Math.ceil(maxDescent * 0.2 + micro * 1.5)
  const paddingLeft = Math.ceil(maxLeft * 0.12 + micro)
  const paddingRight = Math.ceil(Math.max(0, maxWidth - maxRight) * 0.12 + micro)
  const inkHeight = Math.ceil(maxAscent + maxDescent)
  const inkWidth = Math.ceil(maxWidth + maxLeft * 0.15)

  return {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    minHeight: inkHeight + micro,
    minWidth: Math.max(inkWidth, fontSize * 0.5),
  }
}

export function getBlockTextSample(
  type: string,
  props: Record<string, unknown>,
): string {
  switch (type) {
    case 'ArticleTitle':
      return String(props.text ?? '')
    case 'ArticleSection':
      return `${String(props.heading ?? '')}\n${String(props.body ?? '').replace(/<[^>]+>/g, ' ')}`
    case 'ArticleLead':
    case 'ArticleBody':
      return String(props.body ?? '').replace(/<[^>]+>/g, ' ').trim()
    default:
      return ''
  }
}
