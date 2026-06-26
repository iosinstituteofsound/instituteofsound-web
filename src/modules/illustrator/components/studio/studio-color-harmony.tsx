import { useCallback, useEffect, useRef } from 'react'
import {
  angleFromCenter,
  getHarmonyHues,
  hsbToRgb,
  type HarmonyMode,
} from '@/modules/illustrator/components/studio/studio-color-utils'

const MARKER_RADIUS = 44
const CENTER_DEAD_ZONE = 0.1

function hueMarkerPercent(hue: number) {
  const rad = ((hue - 90) * Math.PI) / 180
  return {
    left: `${50 + Math.cos(rad) * MARKER_RADIUS}%`,
    top: `${50 + Math.sin(rad) * MARKER_RADIUS}%`,
  }
}

function drawHueWheel(ctx: CanvasRenderingContext2D, size: number) {
  const image = ctx.createImageData(size, size)
  const data = image.data
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      const dist = Math.hypot(dx, dy)
      if (dist > radius) continue

      const hue = angleFromCenter(x + 0.5, y + 0.5, cx, cy)
      const { r, g, b } = hsbToRgb(hue, 100, 100)
      const i = (y * size + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}

function HarmonySlider({
  value,
  brightness,
  onChange,
}: {
  value: number
  brightness: number
  onChange: (v: number) => void
}) {
  const pct = value
  const thumbColor = `hsl(0 0% ${brightness}%)`

  return (
    <div className="mas-cp-harmony__slider">
      <div className="mas-cp-harmony__slider-track-wrap">
        <div className="mas-cp-harmony__slider-track" />
        <div className="mas-cp-harmony__slider-thumb" style={{ left: `${pct}%`, background: thumbColor }} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          aria-label="Brightness"
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

type StudioColorHarmonyProps = {
  hue: number
  brightness: number
  mode: HarmonyMode
  onHueChange: (hue: number) => void
  onBrightnessChange: (b: number) => void
}

export function StudioColorHarmony({
  hue,
  brightness,
  mode,
  onHueChange,
  onBrightnessChange,
}: StudioColorHarmonyProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draggingRef = useRef(false)
  const harmonyHues = getHarmonyHues(mode, hue)

  useEffect(() => {
    const canvas = canvasRef.current
    const wheel = wheelRef.current
    if (!canvas || !wheel) return

    const paint = () => {
      const size = Math.round(wheel.clientWidth * window.devicePixelRatio)
      if (size < 1) return
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawHueWheel(ctx, size)
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(wheel)
    return () => ro.disconnect()
  }, [])

  const pickHue = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = wheelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dist = Math.hypot(x - cx, y - cy)
      if (dist < rect.width * CENTER_DEAD_ZONE) return
      onHueChange(angleFromCenter(x, y, cx, cy))
    },
    [onHueChange],
  )

  const bindDrag = useCallback(
    (handler: (e: React.PointerEvent<HTMLDivElement>) => void) => ({
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        draggingRef.current = true
        handler(e)
        e.currentTarget.setPointerCapture(e.pointerId)
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return
        e.preventDefault()
        handler(e)
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
    [],
  )

  const dragHandlers = bindDrag(pickHue)

  return (
    <div className="mas-cp-harmony">
      <div ref={wheelRef} className="mas-cp-harmony__wheel" aria-label="Harmony wheel">
        <canvas ref={canvasRef} className="mas-cp-harmony__canvas" aria-hidden />
        <div className="mas-cp-harmony__hit" {...dragHandlers} />
        {harmonyHues.map((h, i) => (
          <div
            key={`${mode}-${i}-${Math.round(h)}`}
            className={`mas-cp-harmony__marker${i === 0 ? ' mas-cp-harmony__marker--primary' : ''}`}
            style={hueMarkerPercent(h)}
          />
        ))}
      </div>
      <HarmonySlider value={brightness} brightness={brightness} onChange={onBrightnessChange} />
    </div>
  )
}

export type { HarmonyMode }
