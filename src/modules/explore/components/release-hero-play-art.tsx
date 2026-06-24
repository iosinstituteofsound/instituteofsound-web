import { Pause, Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import type { ReleaseVinylPlaybackSpin } from '@/modules/explore/components/release-vinyl-art'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import '@/modules/explore/styles/release-hero-play-art.css'

interface ReleaseHeroPlayArtProps {
  release: ReleaseDto
  releaseId: string
  trackId?: string
  onPlay: () => void
  playLabel?: string
}

function resolvePlaybackSpin(isActive: boolean, isPlaying: boolean): ReleaseVinylPlaybackSpin {
  if (!isActive) return 'off'
  return isPlaying ? 'play' : 'pause'
}

export function ReleaseHeroPlayArt({
  release,
  releaseId,
  trackId,
  onPlay,
  playLabel = 'Play',
}: ReleaseHeroPlayArtProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const activeKey = trackId ?? releaseId
  const isActive =
    currentTrack?.releaseId === releaseId ||
    currentTrack?.trackId === trackId ||
    currentTrack?.id === activeKey
  const playing = isActive && isPlaying
  const playbackSpin = resolvePlaybackSpin(isActive, isPlaying)

  return (
    <div className="explore-release-hero-play">
      <ReleaseVinylArt release={release} variant="hero" metalHammer playbackSpin={playbackSpin} />
      <button
        type="button"
        className="explore-release-hero-play__btn"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onPlay()
        }}
        aria-label={playing ? 'Pause' : playLabel}
      >
        <span className="explore-release-hero-play__icon" aria-hidden>
          {playing ? (
            <Pause size={26} strokeWidth={2} fill="currentColor" />
          ) : (
            <Play size={26} strokeWidth={2} fill="currentColor" />
          )}
        </span>
      </button>
    </div>
  )
}
