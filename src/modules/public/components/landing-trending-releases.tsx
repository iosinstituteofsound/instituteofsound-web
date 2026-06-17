import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  isHotRelease,
  releaseInitials,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'

function pickTrendingReleases(releases: ReleaseDto[], limit = 6): ReleaseDto[] {
  const sorted = [...releases].sort((a, b) => {
    const aHot = isHotRelease(a) ? 1 : 0
    const bHot = isHotRelease(b) ? 1 : 0
    if (bHot !== aHot) return bHot - aHot
    return (b.playCount ?? 0) - (a.playCount ?? 0)
  })
  return sorted.slice(0, limit)
}

interface LandingTrendingReleasesProps {
  releases: ReleaseDto[]
}

export function LandingTrendingReleases({ releases }: LandingTrendingReleasesProps) {
  const items = pickTrendingReleases(releases)
  if (items.length === 0) return null

  return (
    <section className="landing-section" aria-labelledby="landing-trending-title">
      <header className="landing-section-head">
        <div>
          <p className="landing-section-head__num">01</p>
          <p className="landing-section-head__kicker">Signal</p>
          <h2 id="landing-trending-title" className="landing-section-head__title">
            Trending releases
          </h2>
          <p className="landing-section-head__sub">
            Featured drops and high-velocity releases from across the network.
          </p>
        </div>
        <Link to="/releases" className="landing-section-head__link">
          View catalog
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>

      <div className="landing-releases__track">
        {items.map((release) => (
          <Link
            key={release.id}
            to={`/releases/${release.id}`}
            className="landing-releases__card"
          >
            <div className="landing-releases__cover">
              {release.coverUrl ? (
                <img src={release.coverUrl} alt="" loading="lazy" />
              ) : (
                <span className="landing-releases__cover-fallback">
                  {releaseInitials(release.title)}
                </span>
              )}
              {isHotRelease(release) ? (
                <span className="landing-releases__badge">Hot</span>
              ) : null}
            </div>
            <div className="landing-releases__meta">
              <p className="landing-releases__title">{release.title}</p>
              <p className="landing-releases__artist">
                {release.artistName ?? 'Unknown artist'} � {releaseTypeLabel(release.type)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
