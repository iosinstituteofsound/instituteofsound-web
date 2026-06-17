import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  releaseGenreLabel,
  releaseInitials,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'

function ReleaseRailCover({ release }: { release: ReleaseDto }) {
  if (release.coverUrl) {
    return (
      <img
        src={release.coverUrl}
        alt=""
        loading="lazy"
        className="explore-rel-page-rail__cover-img"
      />
    )
  }

  return (
    <div className="explore-rel-page-rail__cover-fallback" aria-hidden>
      <span>{releaseInitials(release.title)}</span>
    </div>
  )
}

function ReleaseRailCard({ release, index }: { release: ReleaseDto; index: number }) {
  return (
    <Link
      to={`/releases/${release.id}`}
      className="explore-rel-page-rail__card"
      style={{ '--explore-rel-page-rail-delay': `${60 + index * 55}ms` } as React.CSSProperties}
      aria-label={`Open ${release.title}`}
    >
      <div className="explore-rel-page-rail__art">
        <ReleaseRailCover release={release} />
        <span className="explore-rel-page-rail__badge">{releaseTypeLabel(release.type)}</span>
        <span className="explore-rel-page-rail__arrow" aria-hidden>
          <ArrowUpRight size={15} strokeWidth={2.25} />
        </span>
      </div>

      <div className="explore-rel-page-rail__meta">
        <span className="explore-rel-page-rail__genre">{releaseGenreLabel(release)}</span>
        <p className="explore-rel-page-rail__name">{release.title}</p>
        {release.artistName ? (
          <p className="explore-rel-page-rail__artist">{release.artistName}</p>
        ) : null}
      </div>
    </Link>
  )
}

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
        {releases.map((release, index) => (
          <ReleaseRailCard key={release.id} release={release} index={index} />
        ))}
      </div>
    </section>
  )
}
