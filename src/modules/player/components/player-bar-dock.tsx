import { ChevronUp, Music2, Pause, Play } from 'lucide-react'
import { useEffect } from 'react'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-bar-dock.css'

export function PlayerBarDock() {
  const sessionReady = usePlayerStore((s) => s.sessionReady)
  const isMobile = useIsMobile()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isBarOpen = usePlayerStore((s) => s.isBarOpen)
  const mobileView = usePlayerStore((s) => s.mobileView)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const openBar = usePlayerStore((s) => s.openBar)
  const togglePlay = usePlayerStore((s) => s.togglePlay)

  const showDock = !isBarOpen && !(isMobile && mobileView === 'sheet')
  const hasTrack = Boolean(currentTrack)

  useEffect(() => {
    document.body.dataset.playerDock = showDock ? 'true' : 'false'
    return () => {
      delete document.body.dataset.playerDock
    }
  }, [showDock])

  if (!showDock) return null

  const effectiveDuration =
    duration > 0 ? duration : (currentTrack?.durationSec ?? 0)
  const progressPercent =
    hasTrack && effectiveDuration > 0
      ? Math.min(100, (currentTime / effectiveDuration) * 100)
      : 0

  const handleOpen = () => {
    if (!hasTrack) return
    openBar()
  }

  const handlePlayToggle = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!hasTrack) return
    togglePlay()
  }

  return (
    <div
      className={cn('ios-player-dock', !hasTrack && 'ios-player-dock--idle')}
      style={{ '--ios-player-dock-progress': `${progressPercent}%` } as React.CSSProperties}
      role="group"
      aria-label="Player dock"
    >
      <span className="ios-player-dock__glow" aria-hidden />
      {hasTrack ? <span className="ios-player-dock__progress" aria-hidden /> : null}

      <button
        type="button"
        className="ios-player-dock__body"
        onClick={handleOpen}
        disabled={!hasTrack}
        aria-label={hasTrack ? 'Open player' : 'No track loaded'}
      >
        <span className="ios-player-dock__art" aria-hidden>
          {currentTrack?.artworkUrl ? (
            <img src={currentTrack.artworkUrl} alt="" />
          ) : (
            <Music2 className="h-3 w-3" strokeWidth={2} />
          )}
        </span>

        <span className="ios-player-dock__copy">
          <span className="ios-player-dock__label">
            {hasTrack ? (isPlaying ? 'Now playing' : 'Paused') : 'Player'}
          </span>
          <span className="ios-player-dock__title">
            {!sessionReady
              ? 'Loading session…'
              : hasTrack
                ? currentTrack!.title
                : 'Play something to begin'}
          </span>
        </span>

        {hasTrack ? (
          <span
            className={cn('ios-player-dock__eq', isPlaying && 'ios-player-dock__eq--active')}
            aria-hidden
          >
            <span />
            <span />
            <span />
          </span>
        ) : null}

        {hasTrack ? (
          <span className="ios-player-dock__time">{formatPlayerTime(currentTime)}</span>
        ) : null}

        <span className="ios-player-dock__chevron" aria-hidden>
          <ChevronUp size={14} strokeWidth={2.25} />
        </span>
      </button>

      <button
        type="button"
        className="ios-player-dock__play"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={!hasTrack}
        onClick={handlePlayToggle}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" fill="currentColor" />
        ) : (
          <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
        )}
      </button>
    </div>
  )
}
