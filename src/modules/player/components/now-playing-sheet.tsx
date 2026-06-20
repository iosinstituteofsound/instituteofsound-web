import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  Heart,
  ListMusic,
  ListEnd,
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
import { AddToPlaylistButton } from '@/modules/music/components/add-to-playlist-button'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { getReleaseAnalytics, toggleTrackLike } from '@/modules/music/api/music.api'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { Drawer, DrawerContent } from '@/shared/components/ui/drawer'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/now-playing-sheet.css'

function SheetControlButton({
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
        'now-playing-sheet__control',
        active && 'now-playing-sheet__control--active',
        primary && 'now-playing-sheet__control--primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function NowPlayingSheet() {
  const queryClient = useQueryClient()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const queue = usePlayerStore((s) => s.queue)
  const queueSource = usePlayerStore((s) => s.queueSource)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const mobileView = usePlayerStore((s) => s.mobileView)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const close = usePlayerStore((s) => s.close)
  const closeNowPlaying = usePlayerStore((s) => s.closeNowPlaying)
  const openQueue = usePlayerStore((s) => s.openQueue)
  const openPlaylistModal = usePlayerStore((s) => s.openPlaylistModal)

  const canOpenSourceModal =
    queueSource?.kind === 'playlist' || queueSource?.kind === 'release'

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

  const effectiveDuration = duration > 0 ? duration : (currentTrack?.durationSec ?? 0)
  const open = mobileView === 'sheet' && Boolean(currentTrack)

  const handleSeek = useCallback(
    (value: number) => {
      seek(value)
    },
    [seek],
  )

  if (!currentTrack) return null

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && closeNowPlaying()}>
      <DrawerContent className="now-playing-sheet">
        <div className="now-playing-sheet__header">
          <button
            type="button"
            className="now-playing-sheet__dismiss"
            onClick={closeNowPlaying}
            aria-label="Close now playing"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <p className="now-playing-sheet__kicker">Now Playing</p>
          <button
            type="button"
            className="now-playing-sheet__dismiss"
            onClick={close}
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="now-playing-sheet__body">
          <div
            className={cn('now-playing-sheet__artwork', canOpenSourceModal && 'cursor-pointer')}
            onClick={() => canOpenSourceModal && openPlaylistModal()}
          >
            {currentTrack.artworkUrl ? (
              <img src={currentTrack.artworkUrl} alt="" />
            ) : (
              <div className="now-playing-sheet__artwork-fallback">
                <Music2 className="h-12 w-12" aria-hidden />
              </div>
            )}
          </div>

          <div className="now-playing-sheet__meta">
            <h2 className="now-playing-sheet__title">{currentTrack.title}</h2>
            {currentTrack.artist ? (
              <p className="now-playing-sheet__artist">{currentTrack.artist}</p>
            ) : null}
            {queueSource?.title ? (
              <button
                type="button"
                className="now-playing-sheet__source-link"
                onClick={() => openPlaylistModal()}
              >
                {queueSource.title}
              </button>
            ) : null}
          </div>

          <div className="now-playing-sheet__progress">
            <span className="now-playing-sheet__time">{formatPlayerTime(currentTime)}</span>
            <PlayerSlider
              aria-label="Seek"
              variant="progress"
              className="now-playing-sheet__slider"
              value={currentTime}
              max={effectiveDuration > 0 ? effectiveDuration : 100}
              onValueChange={handleSeek}
            />
            <span className="now-playing-sheet__time">{formatPlayerTime(effectiveDuration)}</span>
          </div>

          <div className="now-playing-sheet__controls">
            <SheetControlButton
              label={shuffle ? 'Shuffle on' : 'Shuffle off'}
              active={shuffle}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-5 w-5" strokeWidth={2.25} />
            </SheetControlButton>

            <SheetControlButton label="Previous track" onClick={previous}>
              <SkipBack className="h-7 w-7" fill="currentColor" />
            </SheetControlButton>

            <SheetControlButton
              label={isPlaying ? 'Pause' : 'Play'}
              primary
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
              )}
            </SheetControlButton>

            <SheetControlButton label="Next track" onClick={next}>
              <SkipForward className="h-7 w-7" fill="currentColor" />
            </SheetControlButton>

            <SheetControlButton
              label={
                repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat off'
              }
              active={repeat !== 'off'}
              onClick={cycleRepeat}
            >
              {repeat === 'one' ? (
                <Repeat1 className="h-5 w-5" strokeWidth={2.25} />
              ) : (
                <Repeat className="h-5 w-5" strokeWidth={2.25} />
              )}
            </SheetControlButton>
          </div>

          <div className="now-playing-sheet__footer">
            <SheetControlButton
              label={
                !canLike
                  ? 'Like (sign in to a release track)'
                  : releaseAnalytics?.userLiked
                    ? 'Unlike track'
                    : 'Like track'
              }
              active={Boolean(releaseAnalytics?.userLiked)}
              disabled={!canLike || likeMutation.isPending}
              onClick={() => {
                if (!canLike) return
                likeMutation.mutate()
              }}
            >
              <Heart
                className={cn('h-5 w-5', releaseAnalytics?.userLiked && 'fill-current text-red-400')}
              />
            </SheetControlButton>

            <AddToPlaylistButton
              trackId={trackId}
              id={currentTrack.id}
              title={currentTrack.title}
              artist={currentTrack.artist}
              artworkUrl={currentTrack.artworkUrl}
              className="now-playing-sheet__add-playlist"
              size="md"
            />

            <div className="now-playing-sheet__volume">
              <SheetControlButton
                label={muted || volume === 0 ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" strokeWidth={2.25} />
                ) : (
                  <Volume2 className="h-5 w-5" strokeWidth={2.25} />
                )}
              </SheetControlButton>
              <PlayerSlider
                aria-label="Volume"
                variant="volume"
                value={muted ? 0 : volume}
                max={1}
                onValueChange={(value) => setVolume(value)}
              />
            </div>

            {canOpenSourceModal ? (
              <SheetControlButton label="View playlist" onClick={openPlaylistModal}>
                <ListMusic className="h-5 w-5" strokeWidth={2.25} />
              </SheetControlButton>
            ) : null}

            <SheetControlButton label="Open queue" onClick={openQueue} disabled={queue.length === 0}>
              <ListEnd className="h-5 w-5" strokeWidth={2.25} />
            </SheetControlButton>

            {queue.length > 0 ? (
              <button
                type="button"
                className="now-playing-sheet__queue-hint"
                onClick={openQueue}
              >
                {queue.length} tracks in queue
              </button>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
