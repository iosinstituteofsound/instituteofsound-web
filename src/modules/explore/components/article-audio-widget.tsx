import { AudioLines, ListMusic, Pause, Play } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { ArticleSessionTrack } from '@/modules/explore/lib/article-content'
import { cn } from '@/shared/lib/cn'

const WAVE_BARS = {
  hero: 40,
  compact: 28,
} as const

const IDLE_BAR_HEIGHTS = [34, 58, 42, 72, 48, 86, 38, 64, 52, 78, 44, 68] as const

function idleBarHeight(index: number): number {
  return IDLE_BAR_HEIGHTS[index % IDLE_BAR_HEIGHTS.length]!
}

function buildIdleHeights(count: number): number[] {
  return Array.from({ length: count }, (_, index) => idleBarHeight(index))
}

interface AudioGraph {
  context: AudioContext
  analyser: AnalyserNode
  source: MediaElementAudioSourceNode
}

function ensureAudioGraph(audio: HTMLAudioElement, graphRef: MutableRefObject<AudioGraph | null>) {
  if (graphRef.current) return graphRef.current

  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.72
  analyser.minDecibels = -82
  analyser.maxDecibels = -18

  const source = context.createMediaElementSource(audio)
  source.connect(analyser)
  analyser.connect(context.destination)

  graphRef.current = { context, analyser, source }
  return graphRef.current
}

async function prepareAudioPlayback(
  audio: HTMLAudioElement,
  graphRef: MutableRefObject<AudioGraph | null>,
): Promise<boolean> {
  try {
    const graph = ensureAudioGraph(audio, graphRef)
    if (graph.context.state === 'suspended') {
      await graph.context.resume()
    }
    return true
  } catch {
    return false
  }
}

interface ArticleAudioWidgetProps {
  title: string
  streamUrl?: string
  tracks?: ArticleSessionTrack[]
  sessionLabel?: string
  className?: string
  variant?: 'hero' | 'compact'
  isLoading?: boolean
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function buildTracks(
  tracks: ArticleSessionTrack[] | undefined,
  streamUrl: string | undefined,
  title: string,
): ArticleSessionTrack[] {
  if (tracks && tracks.length > 0) return tracks
  if (!streamUrl) return []

  return [
    {
      id: 'session-0',
      title,
      artistName: 'IOS',
      durationSec: 372,
      streamUrl,
    },
  ]
}

function readFrequencyHeights(analyser: AnalyserNode, barCount: number): number[] | null {
  const bins = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(bins)

  let peak = 0
  for (const value of bins) {
    if (value > peak) peak = value
  }
  if (peak < 8) return null

  return Array.from({ length: barCount }, (_, index) => {
    const start = Math.floor((index / barCount) * bins.length)
    const end = Math.max(start + 1, Math.floor(((index + 1) / barCount) * bins.length))
    let sum = 0
    for (let bin = start; bin < end; bin += 1) {
      sum += bins[bin] ?? 0
    }
    const average = sum / (end - start)
    const min = 0.22
    const max = 0.96
    return (min + (average / 255) * (max - min)) * 100
  })
}

function buildAnimatedHeights(barCount: number, elapsedSec: number): number[] {
  return Array.from({ length: barCount }, (_, index) => {
    const base = idleBarHeight(index) / 100
    const pulse =
      0.18 *
      Math.sin(elapsedSec * 4.6 + index * 0.58) *
      Math.abs(Math.sin(elapsedSec * 2.15 + index * 0.19))
    return Math.min(96, Math.max(26, (base + pulse + 0.1) * 100))
  })
}

export function ArticleAudioWidget({
  title,
  streamUrl,
  tracks,
  sessionLabel = 'Listen to the session',
  className,
  variant = 'hero',
  isLoading = false,
}: ArticleAudioWidgetProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const waveRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingPlayRef = useRef(false)
  const audioGraphRef = useRef<AudioGraph | null>(null)
  const waveFrameRef = useRef<number | null>(null)
  const analyserReadyRef = useRef(false)
  const scrubbingRef = useRef(false)
  const [scrubbing, setScrubbing] = useState(false)

  const sessionTracks = buildTracks(tracks, streamUrl, title)
  const [activeIndex, setActiveIndex] = useState(0)
  const [queueOpen, setQueueOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ready, setReady] = useState(false)
  const [barHeights, setBarHeights] = useState<number[]>(() => buildIdleHeights(WAVE_BARS[variant]))

  const activeTrack = sessionTracks[activeIndex] ?? sessionTracks[0]
  const activeStreamUrl = activeTrack?.streamUrl
  const barCount = WAVE_BARS[variant]
  const totalDuration = duration > 0 ? duration : activeTrack?.durationSec ?? 0
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, time / totalDuration)) : 0

  useEffect(() => {
    setBarHeights(buildIdleHeights(barCount))
  }, [barCount])

  useEffect(() => {
    return () => {
      if (waveFrameRef.current !== null) {
        cancelAnimationFrame(waveFrameRef.current)
      }
      void audioGraphRef.current?.context.close()
      audioGraphRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      if (waveFrameRef.current !== null) {
        cancelAnimationFrame(waveFrameRef.current)
        waveFrameRef.current = null
      }
      setBarHeights(buildIdleHeights(barCount))
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBarHeights(buildIdleHeights(barCount))
      return
    }

    let cancelled = false
    const startedAt = performance.now()

    const tick = () => {
      if (cancelled) return

      const elapsedSec = (performance.now() - startedAt) / 1000
      const animated = buildAnimatedHeights(barCount, elapsedSec)
      const graph = audioGraphRef.current
      const frequency =
        graph && analyserReadyRef.current ? readFrequencyHeights(graph.analyser, barCount) : null

      const nextHeights = animated.map((animatedHeight, index) => {
        const freqHeight = frequency?.[index]
        if (freqHeight === undefined) return animatedHeight
        return Math.max(animatedHeight, freqHeight)
      })

      setBarHeights(nextHeights)
      waveFrameRef.current = requestAnimationFrame(tick)
    }

    waveFrameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (waveFrameRef.current !== null) {
        cancelAnimationFrame(waveFrameRef.current)
        waveFrameRef.current = null
      }
    }
  }, [playing, barCount])

  useEffect(() => {
    setActiveIndex(0)
    setQueueOpen(false)
    setPlaying(false)
    setTime(0)
    setDuration(0)
    setReady(false)
  }, [sessionTracks.map((track) => track.id).join('|')])

  const startPlayback = useCallback(async (audio: HTMLAudioElement, options?: { setupAnalyser?: boolean }) => {
    if (options?.setupAnalyser ?? false) {
      analyserReadyRef.current = await prepareAudioPlayback(audio, audioGraphRef)
    } else if (audioGraphRef.current) {
      analyserReadyRef.current = true
      if (audioGraphRef.current.context.state === 'suspended') {
        await audioGraphRef.current.context.resume().catch(() => undefined)
      }
    }

    try {
      await audio.play()
      setPlaying(true)
      return true
    } catch {
      setPlaying(false)
      return false
    }
  }, [])

  useEffect(() => {
    if (!activeStreamUrl) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlaying(false)
      setTime(0)
      setDuration(0)
      setReady(false)
      return
    }

    const audio = audioRef.current ?? new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTime = () => setTime(audio.currentTime)
    const onMeta = () => {
      setDuration(audio.duration || activeTrack?.durationSec || 0)
      setReady(true)

      if (pendingPlayRef.current) {
        pendingPlayRef.current = false
        void startPlayback(audio)
      }
    }
    const onEnd = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)

    setPlaying(false)
    setTime(0)
    setDuration(activeTrack?.durationSec ?? 0)
    setReady(false)
    audio.pause()
    audio.src = activeStreamUrl
    audio.load()

    if (audio.readyState >= 1) {
      setDuration(audio.duration || activeTrack?.durationSec || 0)
      setReady(true)
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false
        void startPlayback(audio)
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [activeStreamUrl, activeTrack?.durationSec, startPlayback])

  useEffect(() => {
    if (!queueOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setQueueOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQueueOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [queueOpen])

  const seekToRatio = useCallback(
    (ratio: number) => {
      const audio = audioRef.current
      if (!audio || totalDuration <= 0) return

      const clamped = Math.min(1, Math.max(0, ratio))
      const nextTime = clamped * totalDuration
      audio.currentTime = nextTime
      setTime(nextTime)
    },
    [totalDuration],
  )

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const wave = waveRef.current
      if (!wave) return

      const rect = wave.getBoundingClientRect()
      if (rect.width <= 0) return

      seekToRatio((clientX - rect.left) / rect.width)
    },
    [seekToRatio],
  )

  const onWavePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (totalDuration <= 0) return

      scrubbingRef.current = true
      setScrubbing(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      seekFromClientX(event.clientX)
    },
    [seekFromClientX, totalDuration],
  )

  const onWavePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!scrubbingRef.current) return
      seekFromClientX(event.clientX)
    },
    [seekFromClientX],
  )

  const onWavePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    scrubbingRef.current = false
    setScrubbing(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const onWaveKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (totalDuration <= 0) return

      const step = event.shiftKey ? 10 : 5
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        seekToRatio(progress + step / totalDuration)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        seekToRatio(progress - step / totalDuration)
      } else if (event.key === 'Home') {
        event.preventDefault()
        seekToRatio(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        seekToRatio(1)
      }
    },
    [progress, seekToRatio, totalDuration],
  )

  const playTrack = useCallback(
    async (index: number) => {
      const track = sessionTracks[index]
      if (!track?.streamUrl) return

      if (index === activeIndex) {
        const audio = audioRef.current
        if (!audio) return

        if (playing) {
          audio.pause()
          setPlaying(false)
          return
        }

        await startPlayback(audio, { setupAnalyser: true })
        return
      }

      const audio = audioRef.current
      if (audio) {
        analyserReadyRef.current = await prepareAudioPlayback(audio, audioGraphRef)
      }

      setActiveIndex(index)
      setQueueOpen(false)
      pendingPlayRef.current = true
    },
    [activeIndex, playing, sessionTracks, startPlayback],
  )

  const toggle = useCallback(async () => {
    if (sessionTracks.length === 0) return
    await playTrack(activeIndex)
  }, [activeIndex, playTrack, sessionTracks.length])

  const timeLabel =
    isLoading && sessionTracks.length === 0
      ? `${formatTime(0)} / --:--`
      : ready && totalDuration > 0
        ? `${formatTime(time)} / ${formatTime(totalDuration)}`
        : `${formatTime(time)} / ${totalDuration > 0 ? formatTime(totalDuration) : '--:--'}`

  const hasQueue = sessionTracks.length > 0

  return (
    <div
      ref={rootRef}
      className={cn(
        'explore-article-audio',
        variant === 'compact' && 'explore-article-audio--compact',
        isLoading && sessionTracks.length === 0 && 'explore-article-audio--loading',
        queueOpen && 'explore-article-audio--queue-open',
        className,
      )}
    >
      <div className="explore-article-audio__head">
        <AudioLines size={14} strokeWidth={2} aria-hidden className="explore-article-audio__head-icon" />
        <span>{sessionLabel}</span>
      </div>

      <div className="explore-article-audio__controls">
        <button
          type="button"
          className="explore-article-audio__play"
          onClick={() => void toggle()}
          disabled={!hasQueue}
          aria-label={
            playing
              ? `Pause ${activeTrack?.title ?? title}`
              : `Play ${activeTrack?.title ?? title}`
          }
        >
          {playing ? (
            <Pause size={variant === 'compact' ? 14 : 18} fill="currentColor" className="explore-article-audio__icon" />
          ) : (
            <Play size={variant === 'compact' ? 14 : 18} fill="currentColor" className="explore-article-audio__icon" />
          )}
        </button>

        <div className="explore-article-audio__track">
          <p className="explore-article-audio__title">{activeTrack?.title ?? title}</p>
          <p className="explore-article-audio__time">{timeLabel}</p>
        </div>

        <button
          type="button"
          className={cn('explore-article-audio__queue', queueOpen && 'is-open')}
          aria-label="Session track list"
          aria-expanded={queueOpen ? 'true' : 'false'}
          aria-controls={panelId}
          disabled={sessionTracks.length === 0}
          onClick={() => setQueueOpen((open) => !open)}
        >
          <ListMusic size={16} strokeWidth={1.75} aria-hidden className="explore-article-audio__icon" />
        </button>
      </div>

      {queueOpen && sessionTracks.length > 0 ? (
        <div id={panelId} className="explore-article-audio__panel" role="region" aria-label="Session tracks">
          <p className="explore-article-audio__panel-head">
            {sessionTracks.length} track{sessionTracks.length === 1 ? '' : 's'}
          </p>
          <ul className="explore-article-audio__panel-list">
            {sessionTracks.map((track, index) => (
              <li key={track.id}>
                <button
                  type="button"
                  className={cn(
                    'explore-article-audio__panel-item',
                    index === activeIndex && 'is-active',
                    index === activeIndex && playing && 'is-playing',
                  )}
                  onClick={() => void playTrack(index)}
                >
                  <span className="explore-article-audio__panel-copy">
                    <span className="explore-article-audio__panel-title">{track.title}</span>
                    <span className="explore-article-audio__panel-artist">{track.artistName}</span>
                  </span>
                  <span className="explore-article-audio__panel-duration">
                    {formatTime(track.durationSec)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        ref={waveRef}
        className={cn(
          'explore-article-audio__wave',
          totalDuration > 0 && 'explore-article-audio__wave--seekable',
          scrubbing && 'is-scrubbing',
        )}
        style={{ '--explore-audio-progress': `${progress * 100}%` } as React.CSSProperties}
        role="slider"
        aria-label="Seek session"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalDuration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={timeLabel}
        tabIndex={totalDuration > 0 ? 0 : -1}
        onPointerDown={onWavePointerDown}
        onPointerMove={onWavePointerMove}
        onPointerUp={onWavePointerUp}
        onPointerCancel={onWavePointerUp}
        onKeyDown={onWaveKeyDown}
      >
        <span className="explore-article-audio__wave-fill" aria-hidden />
        <div className="explore-article-audio__wave-bars">
          {Array.from({ length: barCount }).map((_, index) => {
            const barProgress = (index + 1) / barCount
            const isPlayed = barProgress <= progress

            return (
              <span
                key={index}
                className={cn(
                  'explore-article-audio__bar',
                  isPlayed && 'is-played',
                  playing && 'is-reactive',
                )}
                style={{ height: `${barHeights[index] ?? idleBarHeight(index)}%` }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
