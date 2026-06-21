import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'
import type { CuratorDiscoveryArtistDto } from '@/modules/explore/types/explore.types'
import { curatorCompactCount, curatorGrowthLabel, curatorMonthYear } from '@/modules/profile/lib/curator-format'

const DISCOVERY_LIMIT = 8
const FALLBACK_COVER = 'https://picsum.photos/seed/discovery-fallback/480/640'

type CuratorDiscoveryWallProps = {
  artists: CuratorDiscoveryArtistDto[]
  viewAllHref?: string
  limit?: number
}

export function CuratorDiscoveryWall({
  artists,
  viewAllHref = '/discover#explore-artists',
  limit = DISCOVERY_LIMIT,
}: CuratorDiscoveryWallProps) {
  const items = artists.slice(0, limit)
  if (items.length === 0) return null

  return (
    <section className="curator-disc-dev" aria-labelledby="curator-discovery-wall-heading">
      <div className="curator-disc-dev__chassis">
        <span className="curator-disc-dev__notch curator-disc-dev__notch--tl" aria-hidden />
        <span className="curator-disc-dev__notch curator-disc-dev__notch--tr" aria-hidden />
        <span className="curator-disc-dev__notch curator-disc-dev__notch--bl" aria-hidden />
        <span className="curator-disc-dev__notch curator-disc-dev__notch--br" aria-hidden />
        <span className="curator-disc-dev__screw curator-disc-dev__screw--tl" aria-hidden />
        <span className="curator-disc-dev__screw curator-disc-dev__screw--tr" aria-hidden />
        <span className="curator-disc-dev__screw curator-disc-dev__screw--bl" aria-hidden />
        <span className="curator-disc-dev__screw curator-disc-dev__screw--br" aria-hidden />

        <header className="curator-disc-dev__header">
          <div className="curator-disc-dev__header-left">
            <div className="curator-disc-dev__led-cluster" aria-hidden>
              <span className="curator-disc-dev__led" />
              <span className="curator-disc-dev__led curator-disc-dev__led--amber" />
              <span className="curator-disc-dev__led curator-disc-dev__led--dim" />
            </div>
            <span className="curator-disc-dev__module-id">DW-08</span>
          </div>

          <div className="curator-disc-dev__title-wrap">
            <p className="curator-disc-dev__kicker">Scout Array</p>
            <h2 id="curator-discovery-wall-heading" className="curator-disc-dev__title">
              Discovery Wall
            </h2>
          </div>

          <Link to={viewAllHref} className="curator-disc-dev__action">
            View all
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </Link>

          <span className="curator-disc-dev__vents" aria-hidden />
          <span className="curator-disc-dev__readout" aria-hidden>
            {items.length}/{DISCOVERY_LIMIT} LIVE
          </span>
        </header>

        <div className="curator-disc-dev__screen">
          <span className="curator-disc-dev__screen-scan" aria-hidden />
          <span className="curator-disc-dev__screen-rail curator-disc-dev__screen-rail--left" aria-hidden />
          <span className="curator-disc-dev__screen-rail curator-disc-dev__screen-rail--right" aria-hidden />
          <div className="curator-disc-dev__screen-glow" aria-hidden />
          <div className="curator-disc-dev__screen-grid" aria-hidden />

          <div className="curator-disc-dev__grid">
            {items.map((artist, index) => {
              const href = artist.slug ? '/discover#explore-artists' : '/discover#explore-artists'
              const cover = artist.coverUrl ?? FALLBACK_COVER
              const slot = String(index + 1).padStart(2, '0')

              return (
                <article key={artist.id} className="curator-disc-dev__card">
                  <Link to={href} className="curator-disc-dev__link">
                    <div className="curator-disc-dev__media">
                      <img
                        src={cover}
                        alt=""
                        loading="lazy"
                        className="curator-disc-dev__img"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_COVER
                        }}
                      />
                    </div>

                    <div className="curator-disc-dev__body">
                      <div className="curator-disc-dev__copy">
                        <span className="curator-disc-dev__slot">{slot}</span>

                        {artist.subGenre ? (
                          <p className="curator-disc-dev__genre">{artist.subGenre}</p>
                        ) : (
                          <p className="curator-disc-dev__genre curator-disc-dev__genre--empty" aria-hidden>
                            &nbsp;
                          </p>
                        )}

                        <h3 className="curator-disc-dev__name">{artist.artistName}</h3>

                        <p className="curator-disc-dev__growth">
                          <TrendingUp size={11} strokeWidth={2.5} aria-hidden />
                          {curatorGrowthLabel(artist.growthPercent)}
                        </p>

                        <div className="curator-disc-dev__stats">
                          <div className="curator-disc-dev__stat">
                            <span className="curator-disc-dev__stat-label">Featured</span>
                            <span className="curator-disc-dev__stat-value">
                              {curatorMonthYear(artist.firstFeaturedAt)}
                            </span>
                          </div>
                          <div className="curator-disc-dev__stat">
                            <span className="curator-disc-dev__stat-label">Listeners</span>
                            <span className="curator-disc-dev__stat-value">
                              {curatorCompactCount(artist.listenerCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
