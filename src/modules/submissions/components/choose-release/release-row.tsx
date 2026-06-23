import { Disc3 } from 'lucide-react'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import { formatDuration } from '@/modules/submissions/lib/submission-mapper'
import { cn } from '@/shared/lib/cn'

interface ReleaseRowProps {
  release: ReleaseDetailDto
  selected: boolean
  onSelect: () => void
}

export function ReleaseRow({ release, selected, onSelect }: ReleaseRowProps) {
  const track = release.tracks[0]
  const duration = formatDuration(track?.durationSec)
  const uploadDate = track?.createdAt
    ? new Date(track.createdAt).toLocaleDateString()
    : release.releaseDate
      ? new Date(release.releaseDate).toLocaleDateString()
      : '—'

  return (
    <button
      type="button"
      className={cn('sub-release-row', selected && 'sub-release-row--selected')}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {release.coverUrl ? (
        <img src={release.coverUrl} alt="" className="sub-release-row__cover" />
      ) : (
        <span className="sub-release-row__cover-placeholder" aria-hidden>
          <Disc3 className="size-4" />
        </span>
      )}
      <div className="sub-release-row__meta">
        <p className="sub-release-row__title">{track?.title ?? release.title}</p>
        <p className="sub-release-row__sub">
          {release.genre ?? 'Genre'} · {release.type}
        </p>
      </div>
      <span className="sub-release-row__duration">{duration}</span>
      <span className="sub-release-row__radio" aria-hidden />
      <span className="sr-only">{uploadDate}</span>
    </button>
  )
}
