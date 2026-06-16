import { Disc3, Pause, Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { releaseDurationSec } from '@/modules/explore/lib/release-meta'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'

interface ReleasePlayerBarProps {
  release: ReleaseDto
  platform: string
}

export function ReleasePlayerBar({ release, platform }: ReleasePlayerBarProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const seek = usePlayerStore((s) => s.seek)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)

  const isActive = currentTrack?.id === release.id
  const playing = isActive && isPlaying
  const fallbackDuration = releaseDurationSec(release)
  const totalDuration = isActive && duration > 0 ? duration : fallbackDuration
  const disabled = !release.streamUrl

  const handleToggle = () => {
    if (disabled) return
    if (isActive) {
      togglePlay()
      return
    }
    playTrack({
      id: release.id,
      title: release.title,
      artist: release.artistName ?? 'Unknown',
      audioUrl: release.streamUrl!,
      artworkUrl: release.coverUrl,
    })
  }

  return (
    <div
      className={cn(
        'explore-release-player',
        isActive && 'is-active',
        playing && 'is-playing',
        disabled && 'is-disabled',
      )}
    >
      <div className="explore-release-player__head">
        <Disc3 size={13} strokeWidth={2} aria-hidden className="explore-release-player__head-icon" />
        <span className="explore-release-player__head-live" aria-hidden />
        <span>{playing ? 'Now playing' : 'Ready to play'}</span>
        <span className="explore-release-player__head-dot" aria-hidden />
        <span>{platform}</span>
      </div>

      <div className="explore-release-player__body">
        <button
          type="button"
          className="explore-release-player__play"
          onClick={handleToggle}
          disabled={disabled}
          aria-label={playing ? `Pause ${release.title}` : `Play ${release.title}`}
        >
          {playing ? (
            <Pause size={16} fill="currentColor" aria-hidden />
          ) : (
            <Play size={16} fill="currentColor" aria-hidden />
          )}
        </button>

        <div className="explore-release-player__meta">
          <p className="explore-release-player__title">{release.title}</p>
          <p className="explore-release-player__artist">
            {release.artistName ?? 'Unknown artist'}
          </p>
        </div>

        {release.coverUrl ? (
          <img src={release.coverUrl} alt="" className="explore-release-player__thumb" />
        ) : (
          <span className="explore-release-player__thumb-fb" aria-hidden>
            {release.title.slice(0, 1)}
          </span>
        )}
      </div>

      <div className="explore-release-player__progress">
        <span className="explore-release-player__time">
          {formatPlayerTime(isActive ? currentTime : 0)}
        </span>
        <div
          className="explore-release-player__scrub"
          style={
            {
              '--explore-release-progress': `${totalDuration > 0 ? Math.min(100, ((isActive ? currentTime : 0) / totalDuration) * 100) : 0}%`,
            } as React.CSSProperties
          }
        >
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.25}
            value={isActive ? currentTime : 0}
            disabled={!isActive || totalDuration <= 0}
            className="explore-release-player__scrub-input"
            aria-label="Seek track"
            onChange={(event) => {
              if (!isActive) return
              seek(Number(event.target.value))
            }}
          />
        </div>
        <span className="explore-release-player__time">
          {formatPlayerTime(totalDuration)}
        </span>
      </div>
    </div>
  )
}
