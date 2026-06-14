import { useEffect, useRef, useState } from 'react'
import { getPerformanceProfile } from '@/lib/performance'

interface WaveformBackgroundProps {
  className?: string
  /** Minimum bars when container width is unknown */
  bars?: number
}

/** Deterministic bar height % (12–72) for a natural waveform silhouette */
function barHeightPercent(index: number, total: number): number {
  const t = index / Math.max(total - 1, 1)
  const a = Math.sin(index * 0.31 + t * 4.2) * 0.45
  const b = Math.cos(index * 0.17 + t * 2.8) * 0.35
  const c = Math.sin(index * 0.08) * Math.cos(index * 0.05) * 0.25
  const mix = (a + b + c + 1) / 2
  return 12 + mix * 60
}

/** Pure CSS equalizer — fills container width via ResizeObserver */
export function WaveformBackground({
  className = '',
  bars: barsFallback,
}: WaveformBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lite = getPerformanceProfile() === 'lite'
  const [barCount, setBarCount] = useState(barsFallback ?? (lite ? 64 : 96))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const width = el.offsetWidth
      if (width < 1) return
      const targetBarPx = lite ? 5 : 3
      const gapPx = 1
      const count = Math.floor(width / (targetBarPx + gapPx))
      const min = barsFallback ?? (lite ? 48 : 72)
      const max = lite ? 140 : 220
      setBarCount(Math.min(max, Math.max(min, count)))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [lite, barsFallback])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full flex items-end justify-stretch gap-px pointer-events-none css-waveform ${className}`}
      aria-hidden
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="css-waveform-bar flex-1 min-w-0 rounded-t-sm bg-gradient-to-t from-transparent via-mh-red/20 to-mh-red/55"
          style={{
            height: `${barHeightPercent(i, barCount)}%`,
            animationDelay: `${(i % 20) * 0.06}s`,
            animationDuration: `${0.5 + (i % 7) * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
