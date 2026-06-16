import { useCallback, useEffect, useRef } from 'react'
import {
  ListMusic,
  Maximize2,
  Mic2,
  MonitorSpeaker,
  Music2,
  Pause,
  PictureInPicture2,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { PlayerSlider } from '@/modules/player/components/player-slider'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/universal-player.css'

function PlayerControlButton({
  label,
  active = false,
  primary = false,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  active?: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'ios-universal-player__control',
        active && 'ios-universal-player__control--active',
        primary && 'ios-universal-player__control--primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function UniversalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const queue = usePlayerStore((s) => s.queue)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const isExpanded = usePlayerStore((s) => s.isExpanded)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const close = usePlayerStore((s) => s.close)
  const setExpanded = usePlayerStore((s) => s.setExpanded)
  const setPlaybackState = usePlayerStore((s) => s.setPlaybackState)

  const visible = Boolean(currentTrack)
  const progressPercent = duration > 0 ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%'

  useEffect(() => {
    document.body.dataset.playerActive = visible ? 'true' : 'false'
    return () => {
      delete document.body.dataset.playerActive
    }
  }, [visible])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.audioUrl
    audio.load()
    setPlaybackState({ currentTime: 0, duration: 0 })

    if (isPlaying) {
      void audio.play().catch(() => setPlaybackState({ isPlaying: false }))
    }
  }, [currentTrack?.id, currentTrack?.audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = muted ? 0 : volume
  }, [volume, muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      void audio.play().catch(() => setPlaybackState({ isPlaying: false }))
      return
    }

    audio.pause()
  }, [isPlaying, currentTrack?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setPlaybackState({ currentTime: audio.currentTime })
    const handleLoadedMetadata = () => setPlaybackState({ duration: audio.duration || 0 })
    const handleDurationChange = () => setPlaybackState({ duration: audio.duration || 0 })
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        void audio.play()
        return
      }

      if (repeat === 'all' || queue.length > 1) {
        next()
        return
      }

      setPlaybackState({ isPlaying: false, currentTime: 0 })
    }
    const handlePlay = () => setPlaybackState({ isPlaying: true })
    const handlePause = () => setPlaybackState({ isPlaying: false })

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [next, queue.length, repeat, setPlaybackState])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (Math.abs(audio.currentTime - currentTime) > 0.35) {
      audio.currentTime = currentTime
    }
  }, [currentTime])

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist ?? 'Institute of Sound',
      artwork: currentTrack.artworkUrl
        ? [{ src: currentTrack.artworkUrl, sizes: '512x512', type: 'image/png' }]
        : [],
    })

    navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().play())
    navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().previous())
    navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().next())
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) usePlayerStore.getState().seek(details.seekTime)
    })

    return () => {
      navigator.mediaSession.metadata = null
      ;(['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'] as const).forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          /* unsupported action */
        }
      })
    }
  }, [currentTrack?.id, currentTrack?.artist, currentTrack?.artworkUrl, currentTrack?.title])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!currentTrack) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return

      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }

      if (event.key === 'ArrowRight' && event.shiftKey) {
        event.preventDefault()
        next()
      }

      if (event.key === 'ArrowLeft' && event.shiftKey) {
        event.preventDefault()
        previous()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentTrack, next, previous, togglePlay])

  const handleSeek = useCallback(
    (value: number) => {
      seek(value)
      const audio = audioRef.current
      if (audio) audio.currentTime = value
    },
    [seek],
  )

  if (!visible || !currentTrack) return <audio ref={audioRef} className="sr-only" preload="metadata" />

  return (
    <>
      <audio ref={audioRef} className="sr-only" preload="metadata" />
      <section
        className={cn('ios-universal-player', isExpanded && 'ios-universal-player--expanded')}
        data-playing={isPlaying ? 'true' : 'false'}
        aria-label="Now playing"
        style={{ '--ios-player-fill': progressPercent } as React.CSSProperties}
      >
        <div className="ios-universal-player__wave" aria-hidden>
          <span />
        </div>

        <div className="ios-universal-player__inner">
          <div className="ios-universal-player__track">
            <div className="ios-universal-player__artwork">
              {currentTrack.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt="" />
              ) : (
                <div className="ios-universal-player__artwork-fallback">
                  <Music2 className="h-5 w-5" aria-hidden />
                </div>
              )}
            </div>

            <div className="ios-universal-player__meta">
              <p className="ios-universal-player__title">{currentTrack.title}</p>
              {currentTrack.artist ? (
                <p className="ios-universal-player__artist">{currentTrack.artist}</p>
              ) : null}
            </div>

            <div className="ios-universal-player__track-actions">
              <PlayerControlButton label="Close player" onClick={close}>
                <X className="h-4 w-4" />
              </PlayerControlButton>
            </div>
          </div>

          <div className="ios-universal-player__center">
            <div className="ios-universal-player__controls">
              <PlayerControlButton
                label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                active={shuffle}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
              </PlayerControlButton>

              <PlayerControlButton label="Previous track" onClick={previous}>
                <SkipBack className="h-4 w-4" />
              </PlayerControlButton>

              <PlayerControlButton
                label={isPlaying ? 'Pause' : 'Play'}
                primary
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </PlayerControlButton>

              <PlayerControlButton label="Next track" onClick={next}>
                <SkipForward className="h-4 w-4" />
              </PlayerControlButton>

              <PlayerControlButton
                label={
                  repeat === 'one'
                    ? 'Repeat one'
                    : repeat === 'all'
                      ? 'Repeat all'
                      : 'Repeat off'
                }
                active={repeat !== 'off'}
                onClick={cycleRepeat}
              >
                {repeat === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </PlayerControlButton>
            </div>

            <div className="ios-universal-player__progress-row">
              <span className="ios-universal-player__time">{formatPlayerTime(currentTime)}</span>
              <PlayerSlider
                aria-label="Seek"
                value={currentTime}
                max={duration > 0 ? duration : 100}
                onValueChange={handleSeek}
              />
              <span className="ios-universal-player__time">{formatPlayerTime(duration)}</span>
            </div>
          </div>

          <div className="ios-universal-player__extras">
            <PlayerControlButton label="Lyrics" disabled>
              <Mic2 className="h-4 w-4" />
            </PlayerControlButton>
            <PlayerControlButton label="Queue" disabled={queue.length <= 1}>
              <ListMusic className="h-4 w-4" />
            </PlayerControlButton>
            <PlayerControlButton label="Connect to device" disabled>
              <MonitorSpeaker className="h-4 w-4" />
            </PlayerControlButton>

            <div className="ios-universal-player__volume">
              <PlayerControlButton
                label={muted || volume === 0 ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </PlayerControlButton>
              <PlayerSlider
                aria-label="Volume"
                variant="volume"
                value={muted ? 0 : volume}
                max={1}
                onValueChange={(value) => setVolume(value)}
              />
            </div>

            <PlayerControlButton label="Picture in picture" disabled>
              <PictureInPicture2 className="h-4 w-4" />
            </PlayerControlButton>
            <PlayerControlButton
              label={isExpanded ? 'Collapse player' : 'Expand player'}
              onClick={() => setExpanded(!isExpanded)}
            >
              <Maximize2 className="h-4 w-4" />
            </PlayerControlButton>
          </div>
        </div>
      </section>
    </>
  )
}
