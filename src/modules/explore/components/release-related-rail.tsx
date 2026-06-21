import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  releaseGenreLabel,
  releaseInitials,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { releaseCardPath } from '@/modules/explore/lib/track-paths'

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
      to={releaseCardPath(release)}
      className="explore-rel-page-rail__card"
      style={{ '--explore-rel-page-rail-delay': `${60 + index * 55}ms` } as React.CSSProperties}
      aria-label={`Open ${release.title}`}
    >
      <div className="explore-rel-page-rail__sleeve">
        <span className="explore-rel-page-rail__corner explore-rel-page-rail__corner--tl" aria-hidden />
        <span className="explore-rel-page-rail__corner explore-rel-page-rail__corner--tr" aria-hidden />
        <span className="explore-rel-page-rail__corner explore-rel-page-rail__corner--bl" aria-hidden />
        <span className="explore-rel-page-rail__corner explore-rel-page-rail__corner--br" aria-hidden />

        <div className="explore-rel-page-rail__art">
          <ReleaseRailCover release={release} />
          <span className="explore-rel-page-rail__badge ios-mh-badge">
            {releaseTypeLabel(release.type)}
          </span>
          <span className="explore-rel-page-rail__arrow" aria-hidden>
            <ArrowUpRight size={15} strokeWidth={2.25} />
          </span>
          <span className="explore-rel-page-rail__art-scan" aria-hidden />
        </div>
      </div>

      <div className="explore-rel-page-rail__meta">
        <span className="explore-rel-page-rail__genre ios-mh-tag">{releaseGenreLabel(release)}</span>
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
  moduleId?: string
}

export function ReleaseRelatedRail({
  id,
  title,
  viewAllHref,
  releases,
  moduleId,
}: ReleaseRelatedRailProps) {
  if (releases.length === 0) return null

  return (
    <section className="explore-rel-page-rail" aria-labelledby={id}>
      <div className="explore-rel-page-rail__chassis ios-mh-surface">
        <span className="explore-rel-page-rail__chassis-glow" aria-hidden />

        <header className="explore-rel-page-rail__head">
          <div className="explore-rel-page-rail__head-copy">
            <h2 id={id} className="explore-rel-page-rail__title">
              {title}
            </h2>
            {moduleId ? (
              <span className="explore-rel-page-rail__module-id">{moduleId}</span>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link to={viewAllHref} className="explore-rel-page-rail__all ios-mh-btn ios-mh-btn--line">
              View all
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </header>

        <div className="explore-rel-page-rail__track-shell">
          <div className="explore-rel-page-rail__track">
            {releases.map((release, index) => (
              <ReleaseRailCard key={release.id} release={release} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
