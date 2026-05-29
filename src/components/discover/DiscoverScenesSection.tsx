import { GatedLink } from '@/components/auth/GatedLink'
import { SceneHubCover } from '@/components/discover/SceneHubCover'
import {
  DISCOVER_SCENE_ROWS,
  discoverSceneGenres,
  discoverSceneHubPath,
  sceneNetworkStats,
  type DiscoverSceneHubMeta,
} from '@/lib/discovery/scenes'
import '@/styles/scene-hubs.css'

function SceneHubCard({ hub }: { hub: DiscoverSceneHubMeta }) {
  const genres = discoverSceneGenres(hub)
  const hubPath = discoverSceneHubPath(hub.slug)

  return (
    <article
      className={`scn-card scn-card--${hub.variant}`}
      data-city={hub.slug}
    >
      <div className="scn-card__media" aria-hidden>
        <SceneHubCover
          src={hub.imageUrl}
          alt=""
          width={900}
          sizes={
            hub.variant === 'hero'
              ? '(max-width: 900px) 100vw, 58vw'
              : hub.variant === 'side'
                ? '(max-width: 900px) 100vw, 42vw'
                : '(max-width: 900px) 50vw, 25vw'
          }
          className="scn-card__img"
        />
        <div className="scn-card__shade" />
        <div className="scn-card__tint" />
      </div>

      <div className="scn-card__body">
        <div className="scn-card__top">
          <p className="scn-card__kicker">Scene hub</p>
          <GatedLink
            to={hubPath}
            forceGate
            className="scn-card__arrow"
            aria-label={`Open ${hub.label} scene hub`}
          >
            <ArrowIcon />
          </GatedLink>
        </div>

        <GatedLink to={hubPath} forceGate className="scn-card__title-link">
          <h3 className="scn-card__city">{hub.label}</h3>
        </GatedLink>

        <span className="scn-card__wave">Wave 1</span>

        {hub.description && (
          <p className="scn-card__desc">{hub.description}</p>
        )}

        <div className="scn-card__genres">
          {genres.map((genre) => (
            <GatedLink
              key={genre.slug}
              to={discoverSceneHubPath(hub.slug, genre.slug)}
              forceGate
              className="scn-card__genre"
            >
              {genre.label}
            </GatedLink>
          ))}
        </div>
      </div>
    </article>
  )
}

function SceneStatsBar() {
  const stats = sceneNetworkStats()
  return (
    <div className="scn__stats" aria-label="Scene network statistics">
      <div className="scn__stats-cell">
        <GlobeIcon className="scn__stats-icon" />
        <span className="scn__stats-val">{stats.hubs}</span>
        <span className="scn__stats-label">Scene hubs</span>
      </div>
      <div className="scn__stats-cell">
        <PeopleIcon className="scn__stats-icon" />
        <span className="scn__stats-val">{stats.artists}</span>
        <span className="scn__stats-label">Artists</span>
      </div>
      <div className="scn__stats-cell">
        <WaveIcon className="scn__stats-icon" />
        <span className="scn__stats-val">{stats.releases}</span>
        <span className="scn__stats-label">Releases</span>
      </div>
      <div className="scn__stats-cell">
        <CalendarIcon className="scn__stats-icon" />
        <span className="scn__stats-val">{stats.events}</span>
        <span className="scn__stats-label">Events</span>
      </div>
      <div className="scn__stats-cell scn__stats-cell--wide">
        <StarIcon className="scn__stats-icon" />
        <span className="scn__stats-val scn__stats-val--text">Curated by IOS Desk</span>
      </div>
    </div>
  )
}

export function DiscoverScenesSection() {
  return (
    <section id="discover-scenes" className="scn-sec scroll-mt-24">
      <header className="scn-sec__head">
        <div className="scn-sec__brand">
          <span className="scn-sec__idx" aria-hidden>
            06
          </span>
          <div>
            <p className="scn-sec__tag">Scenes</p>
            <h2 className="scn-sec__title">Scene hubs</h2>
            <p className="scn-sec__sub">City × taste tribe — local density first.</p>
          </div>
        </div>
        <GatedLink to="/scenes" forceGate className="scn__all-btn">
          <span className="scn__all-btn-text">All hubs</span>
          <span className="scn__all-btn-arrow" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      <div className="scn__mosaic">
        {DISCOVER_SCENE_ROWS.map((row, i) => (
          <div
            key={i}
            className={
              i === 0 ? 'scn__row scn__row--hero' : 'scn__row scn__row--quad'
            }
          >
            {row.map((hub) => (
              <SceneHubCard key={hub.slug} hub={hub} />
            ))}
          </div>
        ))}
      </div>

      <SceneStatsBar />
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3.5 8.5 8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 7h11M7 1.5c1.5 2 1.5 9 0 11M7 1.5c-1.5 2-1.5 9 0 11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <circle cx="4.5" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 12c0-2 1.3-3.2 3-3.2s3 1.2 3 3.2" stroke="currentColor" strokeWidth="1" />
      <circle cx="9.5" cy="5" r="1.4" stroke="currentColor" strokeWidth="1" />
      <path d="M7.5 12c.4-1.5 1.2-2.2 2-2.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={1.5 + i * 3}
          y={5 - (i % 2)}
          width="1.8"
          height={3.5 + (i % 2) * 1.5}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M2 6h10M5 1.5V4M9 1.5V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path
        d="M7 1.5 8.6 5.2 12.5 5.5 9.5 8.1 10.5 12 7 10.2 3.5 12 4.5 8.1 1.5 5.5 5.4 5.2 7 1.5z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}
