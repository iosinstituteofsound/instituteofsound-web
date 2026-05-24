import { useEffect, useRef } from 'react'
import type { SpectrumBand } from '@/lib/tools/audio/spectrum'

interface SpectrumCanvasProps {
  analyser?: AnalyserNode | null
  bands?: SpectrumBand[]
  active?: boolean
}

export function SpectrumCanvas({ analyser, bands, active = true }: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bandsRef = useRef(bands)
  bandsRef.current = bands

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null
    let frame = 0

    const draw = () => {
      frame = requestAnimationFrame(draw)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h

      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, w, h)

      const staticBands = bandsRef.current
      if (staticBands?.length) {
        const barW = w / staticBands.length - 4
        staticBands.forEach((band, i) => {
          const barH = band.energy * h * 0.92
          const x = i * (barW + 4) + 2
          const grad = ctx.createLinearGradient(0, h, 0, h - barH)
          grad.addColorStop(0, '#d40000')
          grad.addColorStop(1, '#f5f5f5')
          ctx.fillStyle = grad
          ctx.fillRect(x, h - barH, barW, barH)
          ctx.fillStyle = '#666'
          ctx.font = '9px monospace'
          ctx.fillText(band.label, x, h - 4)
        })
        return
      }

      if (!analyser || !data) return
      analyser.getByteFrequencyData(data)
      const barCount = 48
      const step = Math.floor(data.length / barCount)

      for (let i = 0; i < barCount; i++) {
        const v = data[i * step]! / 255
        const barW = w / barCount - 2
        const barH = v * h * 0.95
        const x = i * (w / barCount)
        const grad = ctx.createLinearGradient(0, h, 0, h - barH)
        grad.addColorStop(0, '#8b1538')
        grad.addColorStop(1, '#d40000')
        ctx.fillStyle = grad
        ctx.fillRect(x + 1, h - barH, barW, barH)
      }
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [analyser, active])

  return <canvas ref={canvasRef} className="ios-tools-spectrum-canvas" aria-hidden />
}
