import type { Point } from '@/modules/illustrator/components/studio/studio-canvas-model'

export type BrushPoint = Point & { pressure: number }

export type BrushSegment = { from: BrushPoint; to: BrushPoint }

export function pressureFromEvent(e: PointerEvent | React.PointerEvent) {
  if (e.pressure > 0 && e.pressure < 1) return e.pressure
  return 0.5
}

export function stabilizePoint(prev: Point | null, next: Point, streamline: number): Point {
  if (!prev || streamline <= 0) return next
  const t = 1 - Math.min(0.95, streamline)
  return {
    x: prev.x + (next.x - prev.x) * t,
    y: prev.y + (next.y - prev.y) * t,
  }
}

function hexToRgba(hex: string, alpha: number) {
  const raw = hex.replace('#', '')
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const num = Number.parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r},${g},${b},${alpha})`
}

const stampCache = new Map<string, HTMLCanvasElement>()
const STAMP_CACHE_LIMIT = 192

function getBrushStamp(size: number, hardness: number, color: string, opacity: number, erase?: boolean): HTMLCanvasElement {
  const rounded = Math.max(1, Math.round(size))
  const key = erase ? `e:${rounded}` : `${rounded}|${hardness.toFixed(2)}|${color}|${opacity.toFixed(3)}`
  const cached = stampCache.get(key)
  if (cached) return cached

  if (stampCache.size >= STAMP_CACHE_LIMIT) {
    const first = stampCache.keys().next().value
    if (first) stampCache.delete(first)
  }

  const radius = Math.max(0.5, rounded / 2)
  const pad = 1
  const dim = Math.ceil(radius * 2) + pad * 2
  const stamp = document.createElement('canvas')
  stamp.width = dim
  stamp.height = dim
  const ctx = stamp.getContext('2d')!
  const cx = dim / 2
  const cy = dim / 2

  if (erase) {
    ctx.fillStyle = '#000'
  } else {
    const inner = Math.max(0.05, hardness)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    grad.addColorStop(0, hexToRgba(color, opacity))
    grad.addColorStop(inner, hexToRgba(color, opacity * 0.92))
    grad.addColorStop(1, hexToRgba(color, 0))
    ctx.fillStyle = grad
  }

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  stampCache.set(key, stamp)
  return stamp
}

function divisor(hardness: number) {
  return 0.12 + hardness * 0.1
}

function dabRadius(size: number) {
  return Math.max(1, size) / 2
}

function applyBrushComposite(
  ctx: CanvasRenderingContext2D,
  opacity: number,
  erase?: boolean,
) {
  if (erase) {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = opacity
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
}

function paintBrushSegmentCore(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  color: string,
  baseSize: number,
  opacity: number,
  hardness: number,
  erase?: boolean,
): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const avgPressure = (from.pressure + to.pressure) / 2
  const size = baseSize * (0.35 + avgPressure * 0.95)
  const spacing = Math.max(0.8, size * divisor(hardness))

  if (dist <= spacing) {
    const dabSize = baseSize * (0.35 + to.pressure * 0.95)
    const stamp = getBrushStamp(dabSize, hardness, color, opacity, erase)
    const half = stamp.width / 2
    ctx.drawImage(stamp, to.x - half, to.y - half)
    return dabRadius(dabSize)
  }

  const steps = Math.min(Math.ceil(dist / spacing), 64)
  let maxRadius = 0

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const pressure = from.pressure + (to.pressure - from.pressure) * t
    const dabSize = baseSize * (0.35 + pressure * 0.95)
    const stamp = getBrushStamp(dabSize, hardness, color, opacity, erase)
    const half = stamp.width / 2
    const x = from.x + dx * t
    const y = from.y + dy * t
    ctx.drawImage(stamp, x - half, y - half)
    maxRadius = Math.max(maxRadius, dabRadius(dabSize))
  }

  return maxRadius
}

export function paintDab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity: number,
  hardness: number,
  erase?: boolean,
) {
  const stamp = getBrushStamp(size, hardness, color, opacity, erase)
  const half = stamp.width / 2

  ctx.save()
  applyBrushComposite(ctx, opacity, erase)
  ctx.drawImage(stamp, x - half, y - half)
  ctx.restore()
  return dabRadius(size)
}

export function paintBrushSegment(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  color: string,
  baseSize: number,
  opacity: number,
  hardness: number,
  erase?: boolean,
) {
  ctx.save()
  applyBrushComposite(ctx, opacity, erase)
  const radius = paintBrushSegmentCore(ctx, from, to, color, baseSize, opacity, hardness, erase)
  ctx.restore()
  return radius
}

export function paintBrushSegmentsBatch(
  ctx: CanvasRenderingContext2D,
  segments: BrushSegment[],
  color: string,
  baseSize: number,
  opacity: number,
  hardness: number,
  erase?: boolean,
  smudge?: boolean,
): number {
  if (!segments.length) return 0
  let maxRadius = 0

  if (smudge) {
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = opacity
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = baseSize * 1.2
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(segments[0].from.x, segments[0].from.y)
    for (const segment of segments) {
      ctx.lineTo(segment.to.x, segment.to.y)
      maxRadius = Math.max(maxRadius, dabRadius(baseSize))
    }
    ctx.stroke()
    ctx.restore()
    return maxRadius
  }

  ctx.save()
  applyBrushComposite(ctx, opacity, erase)
  for (const segment of segments) {
    maxRadius = Math.max(
      maxRadius,
      paintBrushSegmentCore(ctx, segment.from, segment.to, color, baseSize, opacity, hardness, erase),
    )
  }
  ctx.restore()
  return maxRadius
}

export function paintSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: BrushPoint[],
  color: string,
  baseSize: number,
  opacity: number,
  hardness: number,
  erase?: boolean,
  smudge?: boolean,
) {
  if (points.length < 2) {
    if (points[0]) paintDab(ctx, points[0].x, points[0].y, baseSize * points[0].pressure, color, opacity, hardness, erase)
    return
  }

  if (smudge) {
    paintBrushSegmentsBatch(
      ctx,
      points.slice(1).map((point, index) => ({ from: points[index], to: point })),
      color,
      baseSize,
      opacity,
      hardness,
      erase,
      true,
    )
    return
  }

  for (let i = 1; i < points.length; i += 1) {
    paintBrushSegment(ctx, points[i - 1], points[i], color, baseSize, opacity, hardness, erase)
  }
}
