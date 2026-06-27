import { ArrowUpRight, BarChart2, Calendar, Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  isHotReleaseOnPage,
  isNewReleaseOnPage,
} from '@/modules/explore/lib/releases-page-filters'
import {
  releaseDateLabel,
  releaseGenreLabel,
  releaseInitials,
  releasePlaysFormatted,
} from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDtoToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import { releaseCardPath } from '@/modules/explore/lib/track-paths'
import { ReleaseGridCard } from '@/shared/components/media'

interface ReleasesGridCardProps {
  release: ReleaseDto
  className?: string
}

export function ReleasesGridCard({ release, className }: ReleasesGridCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const plays = releasePlaysFormatted(release)
  const badge = isNewReleaseOnPage(release) ? 'New' : isHotReleaseOnPage(release) ? 'Hot' : null

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const track = releaseDtoToPlayerTrack(release)
    if (!track) return
    playTrack(track)
  }

  return (
    <ReleaseGridCard
      to={releaseCardPath(release)}
      className={className}
      ariaLabel={`Open ${release.title}`}
      artwork={
        release.coverUrl ? (
          <img src={release.coverUrl} alt="" loading="lazy" className="rel-grid-card__img" />
        ) : (
          <div className="rel-grid-card__fallback" aria-hidden>
            {releaseInitials(release.title)}
          </div>
        )
      }
      badges={badge ? <span className="rel-grid-card__badge">{badge}</span> : null}
      actions={
        release.streamUrl ? (
          <button
            type="button"
            className="rel-grid-card__play"
            aria-label={`Play ${release.title}`}
            onClick={handlePlay}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
          </button>
        ) : null
      }
      title={
        <>
          <p className="rel-grid-card__genre">{releaseGenreLabel(release)}</p>
          <h3 className="rel-grid-card__title">{release.title}</h3>
          {release.artistName ? (
            <p className="rel-grid-card__artist">{release.artistName}</p>
          ) : null}
        </>
      }
      meta={
        <>
          <span className="rel-grid-card__date">
            <Calendar size={11} strokeWidth={1.75} aria-hidden />
            {releaseDateLabel(release)}
          </span>
          {plays ? (
            <span className="rel-grid-card__plays">
              <BarChart2 size={11} strokeWidth={1.75} aria-hidden />
              {plays}
            </span>
          ) : null}
          <span className="rel-grid-card__ext" aria-hidden>
            <ArrowUpRight size={14} strokeWidth={2} />
          </span>
        </>
      }
    />
  )
}
