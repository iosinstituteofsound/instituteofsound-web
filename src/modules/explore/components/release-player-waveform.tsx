import { useMemo } from 'react'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { cn } from '@/shared/lib/cn'

interface ReleasePlayerWaveformProps {
  seed: string
  currentTime: number
  duration: number
  disabled?: boolean
  onSeek: (time: number) => void
}

const BAR_COUNT = 88

function buildBars(seed: string) {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const char = seed.charCodeAt(i % Math.max(seed.length, 1)) ?? 0
    return 0.18 + ((char + i * 17) % 82) / 100
  })
}

export function ReleasePlayerWaveform({
  seed,
  currentTime,
  duration,
  disabled = false,
  onSeek,
}: ReleasePlayerWaveformProps) {
  const bars = useMemo(() => buildBars(seed), [seed])
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleSeek = (clientX: number, rect: DOMRect) => {
    if (disabled || duration <= 0) return
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onSeek(pct * duration)
  }

  return (
    <div className="explore-release-player__wave">
      <span className="explore-release-player__wave-time explore-release-player__wave-time--current">
        {formatPlayerTime(currentTime)}
      </span>

      <div
        className={cn('explore-release-player__wave-track', disabled && 'is-disabled')}
        onClick={(event) => handleSeek(event.clientX, event.currentTarget.getBoundingClientRect())}
      >
        <div className="explore-release-player__wave-bars" aria-hidden>
          {bars.map((scale, index) => {
            const filled = ((index + 0.5) / BAR_COUNT) * 100 <= progress
            return (
              <span
                key={index}
                className={cn('explore-release-player__wave-bar', filled && 'is-filled')}
                style={{ '--wave-bar-scale': scale } as React.CSSProperties}
              />
            )
          })}
        </div>
        <span
          className="explore-release-player__wave-head"
          style={{ left: `${progress}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.25}
          value={currentTime}
          disabled={disabled || duration <= 0}
          className="explore-release-player__wave-input"
          aria-label="Seek track"
          onChange={(event) => onSeek(Number(event.target.value))}
        />
      </div>

      <span className="explore-release-player__wave-time">
        {formatPlayerTime(duration)}
      </span>
    </div>
  )
}
