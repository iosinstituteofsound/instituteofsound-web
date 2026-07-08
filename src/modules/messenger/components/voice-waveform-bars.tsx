import { useEffect, useMemo, useRef, useState } from 'react'
import {
  computeVisibleBarCount,
  resampleWaveformSamples,
  VOICE_WAVEFORM_BAR_GAP,
  VOICE_WAVEFORM_BAR_WIDTH,
  VOICE_WAVEFORM_MIN_BARS,
} from '@/modules/messenger/utils/voice-waveform-utils'
import { cn } from '@/shared/lib/cn'

type VoiceWaveformBarsProps = {
  samples?: number[]
  progress?: number
  isOutgoing?: boolean
  onSeek?: (progress: number) => void
}

export function VoiceWaveformBars({
  samples,
  progress = 0,
  isOutgoing = false,
  onSeek,
}: VoiceWaveformBarsProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  useEffect(() => {
    const element = trackRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setTrackWidth(width)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const visibleBarCount = computeVisibleBarCount(
    trackWidth,
    VOICE_WAVEFORM_BAR_WIDTH,
    VOICE_WAVEFORM_BAR_GAP,
  )

  const resolvedSamples = useMemo(() => {
    const source =
      samples && samples.length > 0
        ? samples
        : Array.from({ length: VOICE_WAVEFORM_MIN_BARS }, () => 0.22)
    return resampleWaveformSamples(source, visibleBarCount)
  }, [samples, visibleBarCount])

  const clampedProgress = Math.max(0, Math.min(1, progress))
  const playedBars = Math.floor(clampedProgress * resolvedSamples.length)

  const handleSeek = (clientX: number) => {
    if (!onSeek || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    if (rect.width <= 0) return
    onSeek(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)))
  }

  return (
    <div
      ref={trackRef}
      className={cn(
        'messenger-voice-bubble__waveform',
        onSeek && 'is-seekable',
      )}
      role={onSeek ? 'slider' : undefined}
      aria-label={onSeek ? 'Voice message progress' : undefined}
      onClick={(event) => handleSeek(event.clientX)}
    >
      {resolvedSamples.map((sample, index) => {
        const barHeight = Math.max(4, Math.round(30 * Math.max(0.12, Math.min(1, sample))))
        const isPlayed = index < playedBars
        return (
          <span
            key={`voice-bar-${index}`}
            className={cn(
              'messenger-voice-bubble__bar',
              isOutgoing ? 'is-outgoing' : 'is-incoming',
              isPlayed && 'is-played',
            )}
            style={{ height: `${barHeight}px` }}
          />
        )
      })}
    </div>
  )
}
