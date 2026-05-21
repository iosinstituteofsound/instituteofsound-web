import { useEffect, useRef } from 'react'

interface WaveformBackgroundProps {
  className?: string
  bars?: number
}

export function WaveformBackground({
  className = '',
  bars = 64,
}: WaveformBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const barW = w / bars
      for (let i = 0; i < bars; i++) {
        const height =
          (Math.sin(t * 0.02 + i * 0.3) * 0.5 + 0.5) * h * 0.35 +
          (Math.sin(t * 0.01 + i * 0.1) * 0.3) * h * 0.15
        const x = i * barW
        const gradient = ctx.createLinearGradient(0, h, 0, h - height)
        gradient.addColorStop(0, 'rgba(61, 124, 255, 0.05)')
        gradient.addColorStop(1, 'rgba(61, 124, 255, 0.25)')
        ctx.fillStyle = gradient
        ctx.fillRect(x + 1, h - height, barW - 2, height)
      }
      t++
      frame = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [bars])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full opacity-40 ${className}`}
      aria-hidden
    />
  )
}
