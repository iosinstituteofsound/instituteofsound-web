import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CuratorSupportedArtistDto } from '@/modules/explore/types/explore.types'
import { SimilarArtistTile } from '@/modules/profile/components/curator/artist-vinyl-art'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import '@/modules/profile/styles/curator-similar-artists-rail.css'

const GRID_COLS = 4
const GRID_ROWS = 3
const GRID_LIMIT = GRID_COLS * GRID_ROWS

type CuratorSimilarArtistsRailProps = {
  title?: string
  id: string
  artists: CuratorSupportedArtistDto[]
  viewAllHref?: string
  kicker?: string
  moduleId?: string
  telemetryTag?: string
}

function SimilarArtistCard({ artist, index }: { artist: CuratorSupportedArtistDto; index: number }) {
  const href = artist.userId ? `/profile/${artist.userId}` : '/discover#explore-artists'

  return (
    <Link
      to={href}
      className="cur-sim-artists__card"
      aria-label={artist.displayName}
      style={{ '--cur-sim-artists-delay': `${index * 50}ms` } as React.CSSProperties}
    >
      <div className="cur-sim-artists__tile-host">
        <SimilarArtistTile displayName={artist.displayName} imageUrl={artist.avatarUrl} />
      </div>
      <div className="cur-sim-artists__meta">
        <span className="cur-sim-artists__meta-link" aria-hidden />
        <VerifiedUserName
          name={artist.displayName}
          isVerified={artist.isVerified}
          className={artist.isVerified ? 'cur-sim-artists__name cur-sim-artists__name--verified' : 'cur-sim-artists__name'}
          nameClassName="cur-sim-artists__name-text"
          badgeClassName="cur-sim-artists__name-badge"
        />
      </div>
    </Link>
  )
}

export function CuratorSimilarArtistsRail({
  title = 'Followers Also Listen To',
  id,
  artists,
  viewAllHref = '/discover#explore-artists',
  kicker = ':: Listener relay',
  moduleId = 'LA-01',
  telemetryTag = 'SIG::LISTENER::ARRAY',
}: CuratorSimilarArtistsRailProps) {
  if (artists.length === 0) return null

  const visible = artists.slice(0, GRID_LIMIT)
  const fillPct = Math.min(100, Math.round((visible.length / GRID_LIMIT) * 100))

  return (
    <section
      className="cur-sim-artists"
      aria-labelledby={id}
      style={
        {
          '--cur-sim-artists-fill': fillPct,
          '--cur-sim-artists-cols': GRID_COLS,
          '--cur-sim-artists-rows': GRID_ROWS,
        } as React.CSSProperties
      }
    >
      <div className="cur-sim-artists__chassis">
        <span className="cur-sim-artists__chassis-glow" aria-hidden />

        <header className="cur-sim-artists__head">
          <div className="cur-sim-artists__head-copy">
            <p className="cur-sim-artists__kicker">{kicker}</p>
            <div className="cur-sim-artists__title-row">
              <span className="cur-sim-artists__module-id" aria-hidden>
                {moduleId}
              </span>
              <h2 id={id} className="cur-sim-artists__title">
                {title}
              </h2>
            </div>
          </div>

          <Link to={viewAllHref} className="cur-sim-artists__view-all">
            View All Artists
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </Link>
        </header>

        <div className="cur-sim-artists__grid" role="list">
          {visible.map((artist, index) => (
            <div key={artist.id} role="listitem">
              <SimilarArtistCard artist={artist} index={index} />
            </div>
          ))}
        </div>

        <div className="cur-sim-artists__telemetry">
          <span className="cur-sim-artists__telemetry-tag">{telemetryTag}</span>
          <div className="cur-sim-artists__progress" aria-hidden>
            <span className="cur-sim-artists__progress-track">
              <span className="cur-sim-artists__progress-fill" />
            </span>
          </div>
          <span className="cur-sim-artists__telemetry-count">
            {String(visible.length).padStart(2, '0')} NODES
          </span>
        </div>
      </div>
    </section>
  )
}
