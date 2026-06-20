import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleasePlayerWaveform } from '@/modules/explore/components/release-player-waveform'
import { releaseDurationSec } from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'

export type ReleasePlaybackMeta = {
  trackId?: string
  releaseId: string
  artistProfileId?: string
  audioUrl?: string
  durationSec?: number
}

interface ReleasePlayerBarProps {
  release: ReleaseDto
  playback?: ReleasePlaybackMeta
}

export function ReleasePlayerBar({ release, playback }: ReleasePlayerBarProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)

  const releaseId = playback?.releaseId ?? release.id
  const trackId = playback?.trackId
  const audioUrl = playback?.audioUrl ?? release.streamUrl
  const activeKey = trackId ?? releaseId

  const isActive =
    currentTrack?.releaseId === releaseId ||
    currentTrack?.trackId === trackId ||
    currentTrack?.id === activeKey
  const playing = isActive && isPlaying
  const fallbackDuration = playback?.durationSec ?? releaseDurationSec(release)
  const totalDuration =
    isActive && duration > 0
      ? duration
      : release.durationSec && release.durationSec > 0
        ? release.durationSec
        : fallbackDuration
  const disabled = !audioUrl

  const handleToggle = () => {
    if (disabled || !audioUrl) return
    if (isActive) {
      togglePlay()
      return
    }
    playTrack({
      id: trackId ?? releaseId,
      trackId,
      releaseId,
      artistProfileId: playback?.artistProfileId ?? release.artistProfileId,
      title: release.title,
      artist: release.artistName ?? 'Unknown',
      audioUrl,
      artworkUrl: release.coverUrl,
      durationSec: playback?.durationSec ?? release.durationSec,
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
      <button
        type="button"
        className="explore-release-player__play"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={playing ? `Pause ${release.title}` : `Play ${release.title}`}
      >
        {playing ? (
          <Pause size={17} fill="currentColor" aria-hidden />
        ) : (
          <Play size={17} fill="currentColor" aria-hidden />
        )}
      </button>

      <ReleasePlayerWaveform
        seed={release.id}
        currentTime={isActive ? currentTime : 0}
        duration={totalDuration}
        disabled={!isActive || disabled}
        onSeek={(time) => {
          if (!isActive) return
          seek(time)
        }}
      />

      <div className="explore-release-player__volume-wrap">
        <button
          type="button"
          className="explore-release-player__vol-btn"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
        >
          {muted || volume === 0 ? (
            <VolumeX size={14} strokeWidth={2} aria-hidden />
          ) : (
            <Volume2 size={14} strokeWidth={2} aria-hidden />
          )}
        </button>

        <div
          className="explore-release-player__volume"
          style={{ '--explore-release-volume': `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            aria-label="Volume"
            className="explore-release-player__volume-input"
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
