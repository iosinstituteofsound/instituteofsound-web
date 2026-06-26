import { useEffect, useRef } from 'react'
import { clamp, hsbToHex, hsbToRgb, sbFromSquareClick } from '@/modules/illustrator/components/studio/studio-color-utils'

function drawSbSquare(ctx: CanvasRenderingContext2D, width: number, height: number, hue: number) {
  const image = ctx.createImageData(width, height)
  const data = image.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = clamp((x / width) * 100, 0, 100)
      const b = clamp((1 - y / height) * 100, 0, 100)
      const { r, g, b: blue } = hsbToRgb(hue, s, b)
      const i = (y * width + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = blue
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}

function ClassicSlider({
  value,
  min,
  max,
  track,
  thumbColor,
  onChange,
}: {
  value: number
  min: number
  max: number
  track: string
  thumbColor: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="mas-cp-classic__slider">
      <div className="mas-cp-classic__slider-track-wrap">
        <div className="mas-cp-classic__slider-track" style={{ background: track }} />
        <div className="mas-cp-classic__slider-thumb" style={{ left: `${pct}%`, background: thumbColor }} />
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </div>
  )
}

type StudioColorClassicProps = {
  hue: number
  saturation: number
  brightness: number
  onChange: (h: number, s: number, b: number) => void
}

export function StudioColorClassic({ hue, saturation, brightness, onChange }: StudioColorClassicProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const field = fieldRef.current
    if (!canvas || !field) return

    const paint = () => {
      const w = Math.round(field.clientWidth * window.devicePixelRatio)
      const h = Math.round(field.clientHeight * window.devicePixelRatio)
      if (w < 1 || h < 1) return
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawSbSquare(ctx, w, h, hue)
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(field)
    return () => ro.disconnect()
  }, [hue])

  const pickField = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = fieldRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const { s, b } = sbFromSquareClick(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height)
    onChange(hue, s, b)
  }

  const bindDrag = (handler: (e: React.PointerEvent<HTMLDivElement>) => void) => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      handler(e)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return
      handler(e)
    },
  })

  const marker = { left: `${saturation}%`, top: `${100 - brightness}%` }
  const hueThumb = `hsl(${hue} 100% 50%)`
  const satThumb = hsbToHex(hue, saturation, 50)
  const briThumb = `hsl(0 0% ${brightness}%)`

  return (
    <div className="mas-cp-classic">
      <div ref={fieldRef} className="mas-cp-classic__field" aria-label="Colour field" {...bindDrag(pickField)}>
        <canvas ref={canvasRef} className="mas-cp-classic__canvas" />
        <div className="mas-cp-classic__marker" style={marker} />
      </div>
      <ClassicSlider
        value={hue}
        min={0}
        max={360}
        track="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
        thumbColor={hueThumb}
        onChange={(h) => onChange(h, saturation, brightness)}
      />
      <ClassicSlider
        value={saturation}
        min={0}
        max={100}
        track={`linear-gradient(to right, #8e8e93, hsl(${hue} 100% 50%))`}
        thumbColor={satThumb}
        onChange={(s) => onChange(hue, s, brightness)}
      />
      <ClassicSlider
        value={brightness}
        min={0}
        max={100}
        track="linear-gradient(to right, #000, #fff)"
        thumbColor={briThumb}
        onChange={(b) => onChange(hue, saturation, b)}
      />
    </div>
  )
}
