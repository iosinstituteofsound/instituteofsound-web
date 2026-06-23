import { Link } from 'react-router-dom'
import { BarChart2, Calendar, Pencil, Play, Trash2 } from 'lucide-react'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import { isReleaseLive, isReleaseScheduled, toReleaseDto } from '@/modules/music/lib/release-map'
import {
  releaseDateLabel,
  releaseGenreLabel,
  releaseInitials,
  releasePlaysFormatted,
} from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDetailToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import { releaseCardPath } from '@/modules/explore/lib/track-paths'
import { cn } from '@/shared/lib/cn'

type ArtistReleaseGridCardProps = {
  release: ReleaseDetailDto
  onDelete?: (id: string) => void
  isDeleting?: boolean
  className?: string
}

export function ArtistReleaseGridCard({
  release,
  onDelete,
  isDeleting,
  className,
}: ArtistReleaseGridCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const dto = toReleaseDto(release)
  const plays = releasePlaysFormatted(dto)
  const live = isReleaseLive(release)
  const scheduled = isReleaseScheduled(release)
  const badge = live ? 'Published' : scheduled ? 'Scheduled' : null
  const publicHref = live ? releaseCardPath(dto) : `/artist/releases/${release.id}/edit`

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const track = releaseDetailToPlayerTrack(release)
    if (!track) return
    playTrack(track)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onDelete || isDeleting) return
    if (window.confirm(`Delete "${release.title}"? This cannot be undone.`)) {
      onDelete(release.id)
    }
  }

  return (
    <Link to={publicHref} className={cn('rel-grid-card artist-release-card', className)}>
      <div className="rel-grid-card__inner">
        <div className="rel-grid-card__art">
          {release.coverUrl ? (
            <img src={release.coverUrl} alt="" loading="lazy" className="rel-grid-card__img" />
          ) : (
            <div className="rel-grid-card__fallback" aria-hidden>
              {releaseInitials(release.title)}
            </div>
          )}
          {badge ? (
            <span
              className={cn(
                'rel-grid-card__badge artist-release-card__badge',
                live && 'artist-release-card__badge--live',
                scheduled && 'artist-release-card__badge--scheduled',
              )}
            >
              {badge}
            </span>
          ) : null}
          <Link
            to={`/artist/releases/${release.id}/edit`}
            className="artist-release-card__edit"
            aria-label={`Edit ${release.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil size={14} aria-hidden />
          </Link>
          {onDelete ? (
            <button
              type="button"
              className="artist-release-card__delete"
              aria-label={`Delete ${release.title}`}
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 size={14} aria-hidden />
            </button>
          ) : null}
          {release.streamUrl ? (
            <button
              type="button"
              className="rel-grid-card__play"
              aria-label={`Play ${release.title}`}
              onClick={handlePlay}
            >
              <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="rel-grid-card__body">
          <p className="rel-grid-card__genre">{releaseGenreLabel(dto)}</p>
          <h3 className="rel-grid-card__title">{release.title}</h3>
          {release.artistName ? (
            <p className="rel-grid-card__artist">{release.artistName}</p>
          ) : null}
        </div>

        <div className="rel-grid-card__foot">
          <span className="rel-grid-card__date">
            <Calendar size={11} strokeWidth={1.75} aria-hidden />
            {releaseDateLabel(dto)}
          </span>
          {plays ? (
            <span className="rel-grid-card__plays">
              <BarChart2 size={11} strokeWidth={1.75} aria-hidden />
              {plays}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
