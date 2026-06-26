import type { Point } from '@/modules/illustrator/components/studio/studio-canvas-model'

type ViewportTransform = {
  pan: Point
  scale: number
  rotation: number
}

/** Map screen coordinates to canvas pixel space, accounting for pan/zoom/rotate. */
export function clientToCanvasPoint(
  canvas: HTMLCanvasElement,
  viewport: HTMLElement,
  clientX: number,
  clientY: number,
  transform: ViewportTransform,
): Point {
  const { pan, scale, rotation } = transform

  if (Math.abs(rotation) < 0.001 && Math.abs(scale - 1) < 0.001 && pan.x === 0 && pan.y === 0) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const vp = viewport.getBoundingClientRect()
  const cx = vp.left + vp.width / 2
  const cy = vp.top + vp.height / 2

  const dx = clientX - cx - pan.x
  const dy = clientY - cy - pan.y

  const rad = (-rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const lx = (dx * cos - dy * sin) / scale
  const ly = (dx * sin + dy * cos) / scale

  const fw = canvas.clientWidth || 1
  const fh = canvas.clientHeight || 1

  return {
    x: (lx / fw + 0.5) * canvas.width,
    y: (ly / fh + 0.5) * canvas.height,
  }
}

/** Map canvas pixel to local % position inside the frame (for overlays). */
export function canvasPointToPercent(point: Point, canvasWidth: number, canvasHeight: number) {
  return {
    left: `${(point.x / canvasWidth) * 100}%`,
    top: `${(point.y / canvasHeight) * 100}%`,
  }
}
