import { getPerformanceProfile } from '@/lib/performance'

interface WaveformBackgroundProps {
  className?: string
  bars?: number
}

/** Pure CSS equalizer — no canvas, no RAF */
export function WaveformBackground({
  className = '',
  bars: barsProp,
}: WaveformBackgroundProps) {
  const bars = barsProp ?? (getPerformanceProfile() === 'lite' ? 24 : 36)
  return (
    <div
      className={`absolute inset-0 flex items-end justify-center gap-px md:gap-0.5 px-1 pointer-events-none css-waveform ${className}`}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="css-waveform-bar flex-1 max-w-[5px] min-w-[2px] rounded-t-sm bg-gradient-to-t from-transparent via-mh-red/25 to-mh-red/50"
          style={{ animationDelay: `${(i % 16) * 0.07}s`, animationDuration: `${0.55 + (i % 5) * 0.12}s` }}
        />
      ))}
    </div>
  )
}
