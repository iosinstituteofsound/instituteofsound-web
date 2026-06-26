import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  angleFromCenter,
  clamp,
  hsbToRgb,
  sbFromDiscClick,
} from '@/modules/illustrator/components/studio/studio-color-utils'

/** Hue ring sits between ~87% and 100% of wheel radius */
const RING_OUTER = 1
const RING_INNER = 0.87
/** Inner disc is inset 11% → radius ≈ 78% of wheel diameter */
const INNER_RADIUS_RATIO = 0.78

function hueMarkerPercent(hue: number) {
  const rad = ((hue - 90) * Math.PI) / 180
  const dist = ((RING_OUTER + RING_INNER) / 2) * 50
  return {
    left: `${50 + Math.cos(rad) * dist}%`,
    top: `${50 + Math.sin(rad) * dist}%`,
  }
}

function drawSbDisc(ctx: CanvasRenderingContext2D, size: number, hue: number) {
  const image = ctx.createImageData(size, size)
  const data = image.data
  const r = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5
      const dy = y - r + 0.5
      if (dx * dx + dy * dy > r * r) continue

      const s = clamp(((dx / r) * 0.5 + 0.5) * 100, 0, 100)
      const b = clamp((1 - (dy / r) * 0.5 - 0.5) * 100, 0, 100)
      const { r: red, g, b: blue } = hsbToRgb(hue, s, b)
      const i = (y * size + x) * 4
      data[i] = red
      data[i + 1] = g
      data[i + 2] = blue
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}

type StudioColorDiscProps = {
  hue: number
  saturation: number
  brightness: number
  onHueChange: (hue: number) => void
  onSbChange: (s: number, b: number) => void
}

export function StudioColorDisc({ hue, saturation, brightness, onHueChange, onSbChange }: StudioColorDiscProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const inner = innerRef.current
    if (!canvas || !inner) return

    const paint = () => {
      const size = Math.round(inner.clientWidth * window.devicePixelRatio)
      if (size < 1) return
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawSbDisc(ctx, size, hue)
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [hue])

  const pickWheel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const wheel = wheelRef.current
      const inner = innerRef.current
      if (!wheel || !inner) return

      const wheelRect = wheel.getBoundingClientRect()
      const x = e.clientX - wheelRect.left
      const y = e.clientY - wheelRect.top
      const cx = wheelRect.width / 2
      const cy = wheelRect.height / 2
      const dist = Math.hypot(x - cx, y - cy)
      const outerR = wheelRect.width / 2
      const norm = dist / outerR

      if (norm <= INNER_RADIUS_RATIO) {
        const innerRect = inner.getBoundingClientRect()
        const { s, b } = sbFromDiscClick(
          e.clientX - innerRect.left,
          e.clientY - innerRect.top,
          innerRect.width,
          innerRect.height,
        )
        onSbChange(s, b)
        return
      }

      if (norm >= RING_INNER && norm <= RING_OUTER) {
        onHueChange(angleFromCenter(x, y, cx, cy))
      }
    },
    [onHueChange, onSbChange],
  )

  const dragHandlers = useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        draggingRef.current = true
        pickWheel(e)
        e.currentTarget.setPointerCapture(e.pointerId)
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return
        e.preventDefault()
        pickWheel(e)
      },
      onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
        draggingRef.current = false
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      },
      onPointerCancel: () => {
        draggingRef.current = false
      },
      onLostPointerCapture: () => {
        draggingRef.current = false
      },
    }),
    [pickWheel],
  )

  const ringMarker = hueMarkerPercent(hue)
  const innerMarker = { left: `${saturation}%`, top: `${100 - brightness}%` }

  return (
    <div ref={wheelRef} className="mas-cp-disc__wheel" aria-label="Colour disc">
      <div className="mas-cp-disc__hue" aria-hidden />
      <div className="mas-cp-disc__gutter" aria-hidden />
      <div ref={innerRef} className="mas-cp-disc__inner" aria-hidden>
        <canvas ref={canvasRef} className="mas-cp-disc__canvas" aria-hidden />
        <div className="mas-cp-disc__marker mas-cp-disc__marker--inner" style={innerMarker} />
      </div>
      <div className="mas-cp-disc__marker mas-cp-disc__marker--ring" style={ringMarker} />
      <div className="mas-cp-disc__wheel-hit" aria-label="Saturation, brightness, and hue" {...dragHandlers} />
    </div>
  )
}

export { RING_INNER }
