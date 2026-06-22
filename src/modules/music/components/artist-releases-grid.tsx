import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import { ArtistReleaseGridCard } from '@/modules/music/components/artist-release-grid-card'
import { cn } from '@/shared/lib/cn'

type ArtistReleasesGridProps = {
  releases: ReleaseDetailDto[]
  onDelete?: (id: string) => void
  isDeleting?: boolean
  className?: string
  emptyMessage?: ReactNode
}

export function ArtistReleasesGrid({
  releases,
  onDelete,
  isDeleting,
  className,
  emptyMessage,
}: ArtistReleasesGridProps) {
  if (releases.length === 0) {
    return (
      <div className="artist-releases-page__empty">
        {emptyMessage ?? (
          <>
            <p>No releases yet.</p>
            <Link to="/artist/releases/new" className="ios-artist-dashboard__upload-btn">
              New Release
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={cn('releases-page__grid artist-releases-page__grid', className)}>
      {releases.map((release) => (
        <ArtistReleaseGridCard
          key={release.id}
          release={release}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}
