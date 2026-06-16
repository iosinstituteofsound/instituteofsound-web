import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import { releaseTypeLabel } from '@/modules/explore/lib/release-meta'

interface ReleaseRelatedRailProps {
  id: string
  title: string
  viewAllHref?: string
  releases: ReleaseDto[]
}

export function ReleaseRelatedRail({ id, title, viewAllHref, releases }: ReleaseRelatedRailProps) {
  if (releases.length === 0) return null

  return (
    <section className="explore-rel-page-rail" aria-labelledby={id}>
      <div className="explore-rel-page-rail__head">
        <h2 id={id} className="explore-rel-page-rail__title">
          {title}
        </h2>
        {viewAllHref ? (
          <Link to={viewAllHref} className="explore-rel-page-rail__all">
            View all
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
          </Link>
        ) : null}
      </div>
      <div className="explore-rel-page-rail__track">
        {releases.map((release) => (
          <Link
            key={release.id}
            to={`/explore/releases/${release.id}`}
            className="explore-rel-page-rail__card explore-ed-glass"
          >
            <ReleaseVinylArt release={release} variant="card" />
            <div className="explore-rel-page-rail__copy">
              <span className="explore-rel-page-rail__type">{releaseTypeLabel(release.type)}</span>
              <p className="explore-rel-page-rail__name">{release.title}</p>
              {release.artistName ? (
                <p className="explore-rel-page-rail__artist">{release.artistName}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
