import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import {
  releaseDateLabel,
  releaseGenreLabel,
  releaseInitials,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { cn } from '@/shared/lib/cn'

interface ReleasesFeaturedHeroProps {
  featured: ReleaseDto
  rail: ReleaseDto[]
  onPlay: (release: ReleaseDto) => void
}

export function ReleasesFeaturedHero({ featured, rail, onPlay }: ReleasesFeaturedHeroProps) {
  const lineup = useMemo(() => {
    const rest = rail.filter((r) => r.id !== featured.id)
    return [featured, ...rest].slice(0, 5)
  }, [featured, rail])

  const [activeId, setActiveId] = useState(featured.id)

  useEffect(() => {
    setActiveId(featured.id)
  }, [featured.id])

  const active = lineup.find((r) => r.id === activeId) ?? featured

  return (
    <section className="rel-hero" aria-label="Featured release">
      <div className="rel-hero__main">
        <div className="rel-hero__art" key={active.id}>
          <ReleaseVinylArt release={active} variant="hero" className="rel-hero__vinyl" />
        </div>

        <div className="rel-hero__copy" key={`${active.id}-copy`}>
          <span className="rel-hero__kicker">Out now</span>
          <h2 className="rel-hero__title">{active.title}</h2>
          {active.artistName ? <p className="rel-hero__artist">{active.artistName}</p> : null}

          <div className="rel-hero__tags">
            <span>{releaseTypeLabel(active.type)}</span>
            <span>{releaseGenreLabel(active)}</span>
          </div>

          <p className="rel-hero__date">{releaseDateLabel(active)}</p>
          <p className="rel-hero__dek">
            Stream from the artist studio or open the full profile.
          </p>

          <div className="rel-hero__actions">
            {active.streamUrl ? (
              <button
                type="button"
                className="rel-hero__btn rel-hero__btn--fill"
                onClick={() => onPlay(active)}
              >
                <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
                Listen now
              </button>
            ) : null}
            <Link to={`/explore/releases/${active.id}`} className="rel-hero__btn rel-hero__btn--line">
              View release
            </Link>
          </div>
        </div>
      </div>

      {lineup.length > 1 ? (
        <aside className="rel-hero__rail" aria-label="More featured">
          {lineup.slice(0, 4).map((release) => (
            <button
              key={release.id}
              type="button"
              className={cn('rel-hero__rail-item', release.id === active.id && 'is-active')}
              aria-current={release.id === active.id ? 'true' : undefined}
              onClick={() => setActiveId(release.id)}
            >
              {release.coverUrl ? (
                <img src={release.coverUrl} alt="" className="rel-hero__rail-thumb" loading="lazy" />
              ) : (
                <span className="rel-hero__rail-thumb rel-hero__rail-thumb--fb">
                  {releaseInitials(release.title)}
                </span>
              )}
              <span className="rel-hero__rail-text">
                <span className="rel-hero__rail-title">{release.title}</span>
                {release.artistName ? (
                  <span className="rel-hero__rail-artist">{release.artistName}</span>
                ) : null}
              </span>
            </button>
          ))}
        </aside>
      ) : null}
    </section>
  )
}
