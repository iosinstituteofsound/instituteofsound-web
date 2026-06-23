import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ArtistWaveform } from '@/modules/explore/components/artist-waveform'
import {
  isHotRelease,
  isNewRelease,
  releaseDateLabel,
  releaseGenreLabel,
  releaseInitials,
  releasePlays,
  releaseTrackCount,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDtoToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import { releaseCardPath } from '@/modules/explore/lib/track-paths'

function releaseHref(release: ReleaseDto): string {
  if (release.id.startsWith('demo-')) return '/explore/releases'
  return releaseCardPath(release)
}

function ReleaseCover({ release }: { release: ReleaseDto }) {
  if (release.coverUrl) {
    return <img src={release.coverUrl} alt="" loading="lazy" className="explore-rel-card__cover-img" />
  }

  return (
    <div className="explore-rel-card__cover-mono" aria-hidden>
      <span>{releaseInitials(release.title)}</span>
    </div>
  )
}

type ExploreReleaseCardProps = {
  release: ReleaseDto
  index: number
}

export function ExploreReleaseCard({ release, index }: ExploreReleaseCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const tracks = releaseTrackCount(release)
  const showPlays = index % 2 === 1

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const track = releaseDtoToPlayerTrack(release)
    if (!track) return
    playTrack(track)
  }

  return (
    <Link
      to={releaseHref(release)}
      className="explore-rel-card explore-rel-glass"
      style={{ '--explore-rel-card-delay': `${70 + index * 50}ms` } as React.CSSProperties}
      aria-label={`Open ${release.title}`}
    >
      <div className="explore-rel-card__cover">
        <ReleaseCover release={release} />
        <div className="explore-rel-card__badges">
          <span className="explore-rel-card__badge">{releaseTypeLabel(release.type)}</span>
          {isHotRelease(release) ? <span className="explore-rel-card__badge">Hot</span> : null}
          {isNewRelease(release) ? (
            <span className="explore-rel-card__badge explore-rel-card__badge--accent">New</span>
          ) : null}
        </div>
        {release.streamUrl ? (
          <button
            type="button"
            className="explore-rel-card__play"
            aria-label={`Play ${release.title}`}
            onClick={handlePlay}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="explore-rel-card__body">
        <p className="explore-rel-card__genre">{releaseGenreLabel(release)}</p>
        <h3 className="explore-rel-card__title">{release.title}</h3>
        {release.artistName ? <p className="explore-rel-card__artist">{release.artistName}</p> : null}
        <p className="explore-rel-card__meta">
          {showPlays ? `${releasePlays(release)} plays` : `${tracks} tracks`}
        </p>
        <div className="explore-rel-card__foot">
          <span className="explore-rel-card__date">
            <Calendar size={12} strokeWidth={1.75} aria-hidden />
            {releaseDateLabel(release)}
          </span>
          <ArtistWaveform slug={release.id} className="explore-rel-card__wave" />
          <span className="explore-rel-card__arrow" aria-hidden>
            <ArrowUpRight size={15} strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  )
}
