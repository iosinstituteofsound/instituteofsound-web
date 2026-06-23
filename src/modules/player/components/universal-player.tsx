import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTrackListenReporter } from '@/modules/player/hooks/use-track-listen-reporter'
import { NowPlayingSheet } from '@/modules/player/components/now-playing-sheet'
import { getReleaseAnalytics, toggleTrackLike } from '@/modules/music/api/music.api'
import { tokenStorage } from '@/shared/services/api/token-storage'
import {
  Heart,
  ListMusic,
  ListEnd,
  Maximize2,
  Mic2,
  MonitorSpeaker,
  Music2,
  Pause,
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
import {
  cancelAudioFade,
  createFadeHandle,
  fadeAudioVolume,
  PLAYER_FADE_MS,
} from '@/modules/player/lib/audio-fade'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { TrackActionsMenu } from '@/modules/music/components/track-actions-menu'
import { AddToPlaylistButton } from '@/modules/music/components/add-to-playlist-button'
import { useActiveSyncedLyricLine, useTrackLyrics } from '@/modules/player/hooks/use-track-lyrics'
import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/universal-player.css'

function resolveAudioDuration(audioDuration: number, fallbackSec?: number): number {
  if (Number.isFinite(audioDuration) && audioDuration > 0) return audioDuration
  if (fallbackSec != null && fallbackSec > 0) return fallbackSec
  return 0
}

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
  const fadeHandleRef = useRef(createFadeHandle())
  const targetVolumeRef = useRef(0.85)
  const isMobile = useIsMobile()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const queue = usePlayerStore((s) => s.queue)
  const queueSource = usePlayerStore((s) => s.queueSource)
  const isShuffling = usePlayerStore((s) => s.isShuffling)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const isExpanded = usePlayerStore((s) => s.isExpanded)
  const isBarOpen = usePlayerStore((s) => s.isBarOpen)
  const mobileView = usePlayerStore((s) => s.mobileView)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const closeBar = usePlayerStore((s) => s.closeBar)
  const setExpanded = usePlayerStore((s) => s.setExpanded)
  const openNowPlaying = usePlayerStore((s) => s.openNowPlaying)
  const setPlaybackState = usePlayerStore((s) => s.setPlaybackState)
  const openQueue = usePlayerStore((s) => s.openQueue)
  const openPlaylistModal = usePlayerStore((s) => s.openPlaylistModal)
  const isLyricsOpen = usePlayerStore((s) => s.isLyricsOpen)
  const toggleLyrics = usePlayerStore((s) => s.toggleLyrics)

  const { hasLyrics, isLoading: lyricsLoading } = useTrackLyrics(currentTrack)
  const activeLyricLine = useActiveSyncedLyricLine(currentTrack, currentTime)

  const canOpenSourceModal =
    queueSource?.kind === 'playlist' || queueSource?.kind === 'release'

  const handleSourceClick = () => {
    if (canOpenSourceModal) openPlaylistModal()
  }

  const getCurrentTime = useCallback(
    () => audioRef.current?.currentTime ?? usePlayerStore.getState().currentTime,
    [],
  )

  const { reportCompleted, reportPause } = useTrackListenReporter(
    currentTrack,
    isPlaying,
    getCurrentTime,
  )

  const queryClient = useQueryClient()
  const releaseId = currentTrack?.releaseId
  const trackId =
    currentTrack?.trackId ??
    (currentTrack?.id && /^[a-f0-9]{24}$/i.test(currentTrack.id) ? currentTrack.id : undefined)
  const canLike = Boolean(releaseId && trackId && tokenStorage.getAccessToken())

  const { data: releaseAnalytics } = useQuery({
    queryKey: ['release-analytics', releaseId],
    queryFn: () => getReleaseAnalytics(releaseId!),
    enabled: Boolean(releaseId && trackId && canLike),
    staleTime: 20_000,
  })

  const likeMutation = useMutation({
    mutationFn: () => toggleTrackLike(trackId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['release-analytics', releaseId] })
    },
  })

  const visible = Boolean(currentTrack)
  const showPlayerBar = visible && isBarOpen
  const effectiveDuration =
    duration > 0 ? duration : (currentTrack?.durationSec ?? 0)
  const progressPercent =
    effectiveDuration > 0
      ? `${Math.min(100, (currentTime / effectiveDuration) * 100)}%`
      : '0%'

  const getTargetVolume = useCallback(() => {
    const { volume: storeVolume, muted: storeMuted } = usePlayerStore.getState()
    return storeMuted ? 0 : storeVolume
  }, [])

  const fadeInPlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    const target = getTargetVolume()
    targetVolumeRef.current = target
    cancelAudioFade(fadeHandleRef.current)
    audio.volume = 0

    try {
      await audio.play()
    } catch {
      setPlaybackState({ isPlaying: false })
      return
    }

    await fadeAudioVolume(audio, target, PLAYER_FADE_MS, fadeHandleRef.current)
  }, [getTargetVolume, setPlaybackState])

  const fadeOutPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || audio.paused) return

    const target = getTargetVolume()
    targetVolumeRef.current = target
    await fadeAudioVolume(audio, 0, PLAYER_FADE_MS, fadeHandleRef.current)
    audio.pause()
    audio.volume = target
  }, [getTargetVolume])

  useEffect(() => {
    return () => cancelAudioFade(fadeHandleRef.current)
  }, [])

  useEffect(() => {
    document.body.dataset.playerActive = visible ? 'true' : 'false'
    document.body.dataset.playerBarOpen = showPlayerBar ? 'true' : 'false'
    return () => {
      delete document.body.dataset.playerActive
      delete document.body.dataset.playerBarOpen
    }
  }, [visible, showPlayerBar])

  useEffect(() => {
    const isMobileMini = isMobile && mobileView === 'mini'
    document.body.dataset.playerMobileMini = visible && isMobileMini ? 'true' : 'false'
    return () => {
      delete document.body.dataset.playerMobileMini
    }
  }, [visible, isMobile, mobileView])

  useEffect(() => {
    document.body.dataset.playerSheet = showPlayerBar && isMobile && mobileView === 'sheet' ? 'true' : 'false'
    return () => {
      delete document.body.dataset.playerSheet
    }
  }, [showPlayerBar, isMobile, mobileView])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    cancelAudioFade(fadeHandleRef.current)
    audio.src = currentTrack.audioUrl
    audio.load()
    audio.volume = 0
    const resumeTime = usePlayerStore.getState().currentTime
    setPlaybackState({
      currentTime: resumeTime,
      duration: currentTrack.durationSec ?? 0,
    })

    if (usePlayerStore.getState().isPlaying) {
      void fadeInPlay()
    }
  }, [currentTrack?.id, currentTrack?.audioUrl, currentTrack?.durationSec, fadeInPlay, setPlaybackState])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    targetVolumeRef.current = getTargetVolume()
    if (fadeHandleRef.current.frameId != null) return
    if (!audio.paused) {
      audio.volume = targetVolumeRef.current
    }
  }, [volume, muted, getTargetVolume])

  useEffect(() => {
    const audio = audioRef.current
    const track = usePlayerStore.getState().currentTrack
    if (!audio || !track) return

    if (isPlaying) {
      if (audio.paused) {
        void fadeInPlay()
      }
      return
    }

    if (!audio.paused) {
      void fadeOutPause()
    }
  }, [isPlaying, fadeInPlay, fadeOutPause])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncDuration = () => {
      const fallbackSec = usePlayerStore.getState().currentTrack?.durationSec
      setPlaybackState({ duration: resolveAudioDuration(audio.duration, fallbackSec) })
    }
    const handleTimeUpdate = () => setPlaybackState({ currentTime: audio.currentTime })
    const handleLoadedMetadata = () => syncDuration()
    const handleDurationChange = () => syncDuration()
    const handleLoadedData = () => syncDuration()
    const handleEnded = () => {
      reportCompleted()
      if (repeat === 'one') {
        audio.currentTime = 0
        void fadeInPlay()
        return
      }

      if (repeat === 'all' || queue.length > 1) {
        next()
        return
      }

      setPlaybackState({ isPlaying: false, currentTime: 0 })
    }
    const handlePlay = () => setPlaybackState({ isPlaying: true })
    const handlePause = () => {
      setPlaybackState({ isPlaying: false })
      reportPause(audio.currentTime)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [fadeInPlay, next, queue.length, repeat, reportCompleted, reportPause, setPlaybackState])

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
      if (
        target?.isContentEditable ||
        target?.closest(
          'input, textarea, select, [contenteditable], .ProseMirror, .article-inline-rich-text, .article-editor, .article-text-tool__textarea',
        )
      ) {
        return
      }

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

  const showMobileMini = isMobile && mobileView === 'mini'
  const showDesktopBar = !isMobile

  if (!showPlayerBar) {
    return <audio ref={audioRef} className="sr-only" preload="metadata" />
  }

  if (isMobile && mobileView === 'sheet') {
    return (
      <>
        <audio ref={audioRef} className="sr-only" preload="metadata" />
        <NowPlayingSheet />
      </>
    )
  }

  return (
    <>
      <audio ref={audioRef} className="sr-only" preload="metadata" />
      <NowPlayingSheet />
      <section
        className={cn(
          'ios-universal-player',
          isExpanded && showDesktopBar && 'ios-universal-player--expanded',
          showMobileMini && 'ios-universal-player--mobile-mini',
          'ios-universal-player--visible',
        )}
        data-playing={isPlaying ? 'true' : 'false'}
        aria-label="Now playing"
        style={{ '--ios-player-progress': progressPercent } as React.CSSProperties}
      >
        <div className="ios-universal-player__ambient" aria-hidden />

        {showMobileMini ? (
          <div className="ios-universal-player__mobile-progress ios-universal-player__mobile-progress--interactive">
            <PlayerSlider
              aria-label="Seek"
              variant="progress"
              value={currentTime}
              max={effectiveDuration > 0 ? effectiveDuration : 100}
              onValueChange={handleSeek}
            />
          </div>
        ) : (
          <div className="ios-universal-player__mobile-progress" aria-hidden />
        )}

        <div className="ios-universal-player__inner">
          <div
            className={cn(
              'ios-universal-player__track',
              showMobileMini && 'ios-universal-player__track--tap',
            )}
            role={showMobileMini ? 'button' : undefined}
            tabIndex={showMobileMini ? 0 : undefined}
            onClick={showMobileMini ? openNowPlaying : undefined}
            onKeyDown={
              showMobileMini
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openNowPlaying()
                    }
                  }
                : undefined
            }
          >
            <div
              className={cn(
                'ios-universal-player__artwork',
                canOpenSourceModal && 'cursor-pointer',
              )}
              onClick={
                canOpenSourceModal
                  ? (event) => {
                      event.stopPropagation()
                      handleSourceClick()
                    }
                  : undefined
              }
            >
              {currentTrack.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt="" />
              ) : (
                <div className="ios-universal-player__artwork-fallback">
                  <Music2 className="h-5 w-5" aria-hidden />
                </div>
              )}
            </div>

            <div
              className={cn('ios-universal-player__meta', canOpenSourceModal && 'cursor-pointer')}
              onClick={
                canOpenSourceModal
                  ? (event) => {
                      event.stopPropagation()
                      handleSourceClick()
                    }
                  : undefined
              }
            >
              <p
                key={showMobileMini && activeLyricLine ? activeLyricLine : currentTrack.title}
                className={cn(
                  'ios-universal-player__title',
                  showMobileMini && activeLyricLine && 'ios-universal-player__title--lyric',
                )}
              >
                {showMobileMini && activeLyricLine ? activeLyricLine : currentTrack.title}
              </p>
              {currentTrack.artist ? (
                <p className="ios-universal-player__artist">{currentTrack.artist}</p>
              ) : null}
              {queueSource?.title ? (
                <p className="ios-universal-player__source text-xs text-muted-foreground">
                  {queueSource.title}
                </p>
              ) : null}
            </div>

            <PlayerControlButton
              label={
                !canLike
                  ? 'Like (sign in to a release track)'
                  : releaseAnalytics?.userLiked
                    ? 'Unlike track'
                    : 'Like track'
              }
              active={Boolean(releaseAnalytics?.userLiked)}
              disabled={!canLike || likeMutation.isPending}
              className={cn(
                'ios-universal-player__control--like',
                releaseAnalytics?.userLiked && 'ios-universal-player__control--active',
                showMobileMini && 'ios-universal-player__control--mobile-hidden',
              )}
              onClick={(event) => {
                event.stopPropagation()
                if (!canLike) return
                likeMutation.mutate()
              }}
            >
              <Heart
                className={cn('h-4 w-4', releaseAnalytics?.userLiked && 'fill-current text-red-400')}
              />
            </PlayerControlButton>

            {currentTrack ? (
              <AddToPlaylistButton
                trackId={trackId}
                id={currentTrack.id}
                title={currentTrack.title}
                artist={currentTrack.artist}
                artworkUrl={currentTrack.artworkUrl}
                className="ios-universal-player__control ios-universal-player__control--add-playlist"
                size="md"
              />
            ) : null}
          </div>

          <div className={cn('ios-universal-player__center', showMobileMini && 'ios-universal-player__center--mobile')}>
            <div className="ios-universal-player__controls">
              <PlayerControlButton
                label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                active={shuffle}
                disabled={isShuffling || queue.length <= 1}
                onClick={toggleShuffle}
                className={showMobileMini ? 'ios-universal-player__control--mobile-hidden' : undefined}
              >
                <Shuffle className="h-4 w-4" strokeWidth={2.25} />
              </PlayerControlButton>

              <PlayerControlButton
                label="Previous track"
                className="ios-universal-player__control--nav"
                onClick={(event) => {
                  event.stopPropagation()
                  previous()
                }}
              >
                <SkipBack className="h-5 w-5" fill="currentColor" />
              </PlayerControlButton>

              <PlayerControlButton
                label={isPlaying ? 'Pause' : 'Play'}
                primary
                onClick={(event) => {
                  event.stopPropagation()
                  togglePlay()
                }}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" fill="currentColor" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                )}
              </PlayerControlButton>

              <PlayerControlButton
                label="Next track"
                className="ios-universal-player__control--nav"
                onClick={(event) => {
                  event.stopPropagation()
                  next()
                }}
              >
                <SkipForward className="h-5 w-5" fill="currentColor" />
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
                className={showMobileMini ? 'ios-universal-player__control--mobile-hidden' : undefined}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <Repeat className="h-4 w-4" strokeWidth={2.25} />
                )}
              </PlayerControlButton>
            </div>

            <div className="ios-universal-player__progress">
              <span className="ios-universal-player__time">{formatPlayerTime(currentTime)}</span>
              <PlayerSlider
                aria-label="Seek"
                variant="progress"
                value={currentTime}
                max={effectiveDuration > 0 ? effectiveDuration : 100}
                onValueChange={handleSeek}
              />
              <span className="ios-universal-player__time">{formatPlayerTime(effectiveDuration)}</span>
            </div>
          </div>

          <div className={cn('ios-universal-player__extras', showMobileMini && 'ios-universal-player__extras--mobile')}>
            <PlayerControlButton
              label={hasLyrics ? (isLyricsOpen ? 'Close lyrics' : 'Show lyrics') : 'Lyrics unavailable'}
              active={isLyricsOpen}
              disabled={!hasLyrics && !lyricsLoading}
              className={showMobileMini ? 'ios-universal-player__control--mobile-hidden' : undefined}
              onClick={(event) => {
                event.stopPropagation()
                toggleLyrics()
              }}
            >
              <Mic2 className="h-4 w-4" strokeWidth={2.25} />
            </PlayerControlButton>
            {canOpenSourceModal ? (
              <PlayerControlButton
                label="View playlist"
                onClick={(event) => {
                  event.stopPropagation()
                  openPlaylistModal()
                }}
              >
                <ListMusic className="h-4 w-4" strokeWidth={2.25} />
              </PlayerControlButton>
            ) : null}
            <PlayerControlButton
              label="Queue"
              disabled={queue.length === 0}
              onClick={(event) => {
                event.stopPropagation()
                openQueue()
              }}
            >
              <ListEnd className="h-4 w-4" strokeWidth={2.25} />
            </PlayerControlButton>
            {currentTrack ? (
              <TrackActionsMenu
                trackId={trackId}
                title={currentTrack.title}
                artist={currentTrack.artist}
                audioUrl={currentTrack.audioUrl}
                artworkUrl={currentTrack.artworkUrl}
                durationSec={currentTrack.durationSec}
                releaseId={currentTrack.releaseId}
                artistProfileId={currentTrack.artistProfileId}
                triggerClassName="ios-universal-player__control"
              />
            ) : null}
            <PlayerControlButton label="Connect to a device" disabled>
              <MonitorSpeaker className="h-4 w-4" strokeWidth={2.25} />
            </PlayerControlButton>

            <div className="ios-universal-player__volume">
              <PlayerControlButton
                label={muted || volume === 0 ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <Volume2 className="h-4 w-4" strokeWidth={2.25} />
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

            <PlayerControlButton
              label={showMobileMini ? 'Open now playing' : isExpanded ? 'Collapse player' : 'Full screen'}
              onClick={() => (showMobileMini ? openNowPlaying() : setExpanded(!isExpanded))}
              className={showMobileMini ? 'ios-universal-player__control--mobile-hidden' : undefined}
            >
              <Maximize2 className="h-4 w-4" strokeWidth={2.25} />
            </PlayerControlButton>

            <PlayerControlButton
              label="Minimize player"
              onClick={closeBar}
              className="ios-universal-player__control--close"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </PlayerControlButton>
          </div>
        </div>
      </section>
    </>
  )
}
