export type Point = { x: number; y: number }

export type ShapeKind = 'rect' | 'ellipse' | 'triangle'

export type CanvasElement =
  | {
      id: string
      kind: 'stroke'
      points: Point[]
      color: string
      size: number
      opacity: number
      erase?: boolean
      smudge?: boolean
    }
  | {
      id: string
      kind: 'shape'
      shape: ShapeKind
      x: number
      y: number
      w: number
      h: number
      color: string
      strokeWidth: number
      filled: boolean
    }
  | {
      id: string
      kind: 'text'
      x: number
      y: number
      text: string
      color: string
      fontSize: number
    }
  | {
      id: string
      kind: 'gradient'
      x1: number
      y1: number
      x2: number
      y2: number
      from: string
      to: string
    }
  | {
      id: string
      kind: 'frame'
      x: number
      y: number
      w: number
      h: number
      color: string
      thickness: number
    }
  | {
      id: string
      kind: 'sticker'
      x: number
      y: number
      size: number
      emoji: string
    }
  | {
      id: string
      kind: 'image'
      x: number
      y: number
      w: number
      h: number
      src: string
    }
  | {
      id: string
      kind: 'bitmap'
      data: ImageData
    }

export type ToolSettings = {
  brushSize: number
  brushOpacity: number
  brushHardness: number
  streamline: number
  eraserSize: number
  shape: ShapeKind
  shapeFilled: boolean
  strokeWidth: number
  fontSize: number
  frameThickness: number
  stickerEmoji: string
  smudgeStrength: number
}

export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  brushSize: 28,
  brushOpacity: 1,
  brushHardness: 0.82,
  streamline: 0.42,
  eraserSize: 36,
  shape: 'rect',
  shapeFilled: true,
  strokeWidth: 3,
  fontSize: 28,
  frameThickness: 8,
  stickerEmoji: '✨',
  smudgeStrength: 0.35,
}

export const DOCUMENT_BG = '#FFFFFF'

export const CANVAS_SIZE = 4096

export type CanvasPixelSize = {
  width: number
  height: number
}

export function resolveWorkingCanvasSize(
  documentWidth: number,
  documentHeight: number,
  maxEdge = CANVAS_SIZE,
): CanvasPixelSize {
  const docW = Math.round(Math.max(1, documentWidth))
  const docH = Math.round(Math.max(1, documentHeight))
  const longest = Math.max(docW, docH)

  if (longest <= maxEdge) {
    return { width: docW, height: docH }
  }

  const ratio = docW / docH
  if (ratio >= 1) {
    return { width: maxEdge, height: Math.max(1, Math.round(maxEdge / ratio)) }
  }

  return { width: Math.max(1, Math.round(maxEdge * ratio)), height: maxEdge }
}

export function formatDocumentAspectRatio(documentWidth: number, documentHeight: number) {
  const w = Math.max(1, Math.round(documentWidth))
  const h = Math.max(1, Math.round(documentHeight))
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}

function scalePoint(point: Point, scaleX: number, scaleY: number): Point {
  return { x: point.x * scaleX, y: point.y * scaleY }
}

export function scaleCanvasElements(
  elements: CanvasElement[],
  from: CanvasPixelSize,
  to: CanvasPixelSize,
): CanvasElement[] {
  if (from.width === to.width && from.height === to.height) return elements

  const scaleX = to.width / from.width
  const scaleY = to.height / from.height

  return elements.map((el) => {
    switch (el.kind) {
      case 'stroke':
        return {
          ...el,
          points: el.points.map((p) => scalePoint(p, scaleX, scaleY)),
          size: el.size * Math.max(scaleX, scaleY),
        }
      case 'shape':
      case 'frame':
      case 'image':
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          w: el.w * scaleX,
          h: el.h * scaleY,
        }
      case 'text':
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          fontSize: el.fontSize * Math.max(scaleX, scaleY),
        }
      case 'gradient':
        return {
          ...el,
          x1: el.x1 * scaleX,
          y1: el.y1 * scaleY,
          x2: el.x2 * scaleX,
          y2: el.y2 * scaleY,
        }
      case 'sticker':
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          size: el.size * Math.max(scaleX, scaleY),
        }
      case 'bitmap':
        return el
      default:
        return el
    }
  })
}

export function elementBounds(el: CanvasElement) {
  switch (el.kind) {
    case 'stroke': {
      const xs = el.points.map((p) => p.x)
      const ys = el.points.map((p) => p.y)
      if (!xs.length) return null
      const pad = el.size / 2
      return {
        x: Math.min(...xs) - pad,
        y: Math.min(...ys) - pad,
        w: Math.max(...xs) - Math.min(...xs) + pad * 2,
        h: Math.max(...ys) - Math.min(...ys) + pad * 2,
      }
    }
    case 'shape':
    case 'frame':
    case 'image':
      return { x: el.x, y: el.y, w: el.w, h: el.h }
    case 'text':
      return { x: el.x, y: el.y - el.fontSize, w: el.text.length * el.fontSize * 0.55, h: el.fontSize * 1.2 }
    case 'sticker':
      return { x: el.x - el.size / 2, y: el.y - el.size / 2, w: el.size, h: el.size }
    case 'gradient':
      return {
        x: Math.min(el.x1, el.x2),
        y: Math.min(el.y1, el.y2),
        w: Math.abs(el.x2 - el.x1) || 1,
        h: Math.abs(el.y2 - el.y1) || 1,
      }
    case 'bitmap':
      return { x: 0, y: 0, w: el.data.width, h: el.data.height }
    default:
      return null
  }
}

export function hitTestElement(el: CanvasElement, point: Point) {
  const bounds = elementBounds(el)
  if (!bounds) return false
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.w &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.h
  )
}
