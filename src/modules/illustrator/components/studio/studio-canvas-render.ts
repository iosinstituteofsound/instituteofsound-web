import type { CanvasElement, Point, ShapeKind } from '@/modules/illustrator/components/studio/studio-canvas-model'
import { CANVAS_SIZE, DOCUMENT_BG, elementBounds } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { compositeLayers } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { paintSmoothStroke } from '@/modules/illustrator/components/studio/studio-brush-engine'
import type { BrushPoint } from '@/modules/illustrator/components/studio/studio-brush-engine'

const imageCache = new Map<string, HTMLImageElement>()

function getCachedImage(src: string, onLoad?: () => void) {
  const existing = imageCache.get(src)
  if (existing) return existing
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => onLoad?.()
  img.src = src
  imageCache.set(src, img)
  return img
}

export function drawElement(ctx: CanvasRenderingContext2D, el: CanvasElement, onImageLoad?: () => void) {
  switch (el.kind) {
    case 'stroke':
      drawStroke(
        ctx,
        el.points.map((p) => ({ ...p, pressure: (p as BrushPoint).pressure ?? 0.6 })),
        el.color,
        el.size,
        el.opacity,
        el.erase,
        el.smudge,
      )
      break
    case 'shape':
      drawShape(ctx, el.shape, el.x, el.y, el.w, el.h, el.color, el.strokeWidth, el.filled)
      break
    case 'text':
      ctx.save()
      ctx.fillStyle = el.color
      ctx.font = `600 ${el.fontSize}px ui-sans-serif, system-ui, sans-serif`
      ctx.fillText(el.text, el.x, el.y)
      ctx.restore()
      break
    case 'gradient': {
      const grad = ctx.createLinearGradient(el.x1, el.y1, el.x2, el.y2)
      grad.addColorStop(0, el.from)
      grad.addColorStop(1, el.to)
      ctx.save()
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.restore()
      break
    }
    case 'frame':
      drawFrame(ctx, el.x, el.y, el.w, el.h, el.color, el.thickness)
      break
    case 'sticker':
      ctx.save()
      ctx.font = `${el.size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(el.emoji, el.x, el.y)
      ctx.restore()
      break
    case 'image':
      if (el.src) {
        const img = getCachedImage(el.src, onImageLoad)
        if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, el.x, el.y, el.w, el.h)
      }
      break
    case 'bitmap':
      ctx.putImageData(el.data, 0, 0)
      break
    default:
      break
  }
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: BrushPoint[],
  color: string,
  size: number,
  opacity: number,
  erase?: boolean,
  smudge?: boolean,
) {
  paintSmoothStroke(ctx, points, color, size, opacity, 0.82, erase, smudge)
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  strokeWidth: number,
  filled: boolean,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = strokeWidth
  if (shape === 'rect') {
    if (filled) ctx.fillRect(x, y, w, h)
    else ctx.strokeRect(x, y, w, h)
  } else if (shape === 'ellipse') {
    ctx.beginPath()
    ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2)
    filled ? ctx.fill() : ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    filled ? ctx.fill() : ctx.stroke()
  }
  ctx.restore()
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  thickness: number,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save()
  ctx.strokeStyle = '#7B4DFF'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.strokeRect(x - 4, y - 4, w + 8, h + 8)
  ctx.restore()
}

export function floodFillCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: string,
  tolerance = 36,
) {
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const startX = Math.floor(x)
  const startY = Math.floor(y)
  if (startX < 0 || startY < 0 || startX >= width || startY >= height) return null

  const startIdx = (startY * width + startX) * 4
  const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]]
  const fill = hexToRgba(fillColor)

  if (colorsMatch(target, fill, 0)) return null

  const stack: Point[] = [{ x: startX, y: startY }]
  const visited = new Uint8Array(width * height)

  while (stack.length) {
    const { x: px, y: py } = stack.pop()!
    const key = py * width + px
    if (visited[key]) continue
    visited[key] = 1

    const idx = key * 4
    const current = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    if (!colorsMatch(current, target, tolerance)) continue

    data[idx] = fill[0]
    data[idx + 1] = fill[1]
    data[idx + 2] = fill[2]
    data[idx + 3] = 255

    if (px > 0) stack.push({ x: px - 1, y: py })
    if (px < width - 1) stack.push({ x: px + 1, y: py })
    if (py > 0) stack.push({ x: px, y: py - 1 })
    if (py < height - 1) stack.push({ x: px, y: py + 1 })
  }

  return imageData
}

function colorsMatch(a: number[], b: number[], tolerance: number) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  )
}

function hexToRgba(hex: string) {
  const raw = hex.replace('#', '')
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const num = Number.parseInt(value, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255]
}

export async function loadBaseImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export type PaintFrameCache = {
  underlay: HTMLCanvasElement
  overlay: HTMLCanvasElement
  activeLayerId: string
}

function createOffscreenCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function compositeLayerRange(
  ctx: CanvasRenderingContext2D,
  layers: PaintLayer[],
  start: number,
  end: number,
) {
  for (let i = start; i < end; i += 1) {
    const layer = layers[i]
    if (!layer.visible) continue
    ctx.save()
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(layer.canvas, 0, 0)
    ctx.restore()
  }
}

function drawSceneOverlay(
  ctx: CanvasRenderingContext2D,
  layers: PaintLayer[],
  elements: CanvasElement[],
  baseImage: HTMLImageElement | null,
  draft: CanvasElement | null,
  selectedIds: string[],
  startLayerIndex: number,
  onImageLoad?: () => void,
) {
  const { width, height } = ctx.canvas
  compositeLayerRange(ctx, layers, startLayerIndex, layers.length)

  if (baseImage) {
    ctx.save()
    ctx.globalAlpha = 1
    const scale = Math.min(width / baseImage.width, height / baseImage.height)
    const w = baseImage.width * scale
    const h = baseImage.height * scale
    ctx.drawImage(baseImage, (width - w) / 2, (height - h) / 2, w, h)
    ctx.restore()
  }

  for (const el of elements) drawElement(ctx, el, onImageLoad)
  if (draft) drawElement(ctx, draft, onImageLoad)

  for (const el of elements) {
    if (!selectedIds.includes(el.id)) continue
    const bounds = elementBounds(el)
    if (bounds) drawSelection(ctx, bounds.x, bounds.y, bounds.w, bounds.h)
  }
}

export function buildPaintFrameCache(
  layers: PaintLayer[],
  activeLayerId: string,
  elements: CanvasElement[],
  baseImage: HTMLImageElement | null,
  draft: CanvasElement | null,
  selectedIds: string[],
): PaintFrameCache | null {
  const activeIndex = layers.findIndex((layer) => layer.id === activeLayerId)
  if (activeIndex < 0) return null

  const width = layers[0]?.canvas.width ?? CANVAS_SIZE
  const height = layers[0]?.canvas.height ?? CANVAS_SIZE
  const underlay = createOffscreenCanvas(width, height)
  const overlay = createOffscreenCanvas(width, height)
  const underlayCtx = underlay.getContext('2d')
  const overlayCtx = overlay.getContext('2d')
  if (!underlayCtx || !overlayCtx) return null

  compositeLayerRange(underlayCtx, layers, 0, activeIndex)
  drawSceneOverlay(overlayCtx, layers, elements, baseImage, draft, selectedIds, activeIndex + 1)

  return { underlay, overlay, activeLayerId }
}

export function blitPaintFrame(
  ctx: CanvasRenderingContext2D,
  cache: PaintFrameCache,
  layers: PaintLayer[],
) {
  const activeLayer = layers.find((layer) => layer.id === cache.activeLayerId)
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(cache.underlay, 0, 0)
  if (activeLayer?.visible) {
    ctx.save()
    ctx.globalAlpha = activeLayer.opacity
    ctx.drawImage(activeLayer.canvas, 0, 0)
    ctx.restore()
  }
  ctx.drawImage(cache.overlay, 0, 0)
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  layers: PaintLayer[],
  elements: CanvasElement[],
  baseImage: HTMLImageElement | null,
  draft: CanvasElement | null,
  selectedIds: string[],
  activeLayerId: string | null,
  onImageLoad?: () => void,
) {
  compositeLayers(ctx, layers, activeLayerId)

  const { width, height } = ctx.canvas
  if (baseImage) {
    ctx.save()
    ctx.globalAlpha = 1
    const scale = Math.min(width / baseImage.width, height / baseImage.height)
    const w = baseImage.width * scale
    const h = baseImage.height * scale
    ctx.drawImage(baseImage, (width - w) / 2, (height - h) / 2, w, h)
    ctx.restore()
  }

  for (const el of elements) drawElement(ctx, el, onImageLoad)
  if (draft) drawElement(ctx, draft, onImageLoad)

  for (const el of elements) {
    if (!selectedIds.includes(el.id)) continue
    const bounds = elementBounds(el)
    if (bounds) drawSelection(ctx, bounds.x, bounds.y, bounds.w, bounds.h)
  }
}

export function renderDocumentBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = DOCUMENT_BG
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}
