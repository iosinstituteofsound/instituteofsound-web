import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Calendar,
  Globe2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { SceneHubDto } from '@/modules/explore/types/explore.types'
import {
  buildSceneHubMosaic,
  sceneHubCover,
  sceneHubDescription,
  sceneHubNetworkStats,
  sceneHubPath,
  SCENE_GENRES,
  type SceneHubMosaicItem,
} from '@/modules/explore/lib/scene-hub-meta'

interface ExploreSceneHubsSectionProps {
  hubs: SceneHubDto[]
  artistCount?: number
  releaseCount?: number
  eventCount?: number
}

function SceneHubCard({ item, index }: { item: SceneHubMosaicItem; index: number }) {
  const { hub, variant } = item
  const hubLink = sceneHubPath(hub.slug)
  const description = sceneHubDescription(hub)

  return (
    <article
      className={`explore-scn-card explore-scn-card--${variant}`}
      style={{ '--explore-scn-card-delay': `${80 + index * 45}ms` } as React.CSSProperties}
      data-city={hub.slug}
    >
      <div className="explore-scn-card__media" aria-hidden>
        <img
          src={sceneHubCover(hub)}
          alt=""
          loading="lazy"
          className="explore-scn-card__img"
        />
        <div className="explore-scn-card__shade" />
        <div className="explore-scn-card__tint" />
        <div className="explore-scn-card__grain" />
      </div>

      <div className="explore-scn-card__body">
        <div className="explore-scn-card__top">
          <p className="explore-scn-card__kicker">Scene hub</p>
          <Link
            to={hubLink}
            className="explore-scn-card__arrow"
            aria-label={`Open ${hub.city} scene hub`}
          >
            <ArrowUpRight size={12} strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        <Link to={hubLink} className="explore-scn-card__title-link">
          <h3 className="explore-scn-card__city">{hub.city}</h3>
        </Link>

        <span className="explore-scn-card__wave">Wave 1</span>

        {(variant === 'hero' || variant === 'side') && description ? (
          <p className="explore-scn-card__desc">{description}</p>
        ) : null}

        <div className="explore-scn-card__genres">
          {SCENE_GENRES.map((genre) => (
            <Link
              key={genre.slug}
              to={sceneHubPath(hub.slug, genre.slug)}
              className="explore-scn-card__genre"
            >
              {genre.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function SceneStatsBar({
  hubs,
  artistCount = 0,
  releaseCount = 0,
  eventCount = 0,
}: ExploreSceneHubsSectionProps) {
  const stats = sceneHubNetworkStats(hubs, artistCount, releaseCount, eventCount)

  return (
    <footer className="explore-lbl-stats" aria-label="Scene network statistics">
      <div className="explore-lbl-stats__item">
        <Globe2 size={16} strokeWidth={2} aria-hidden />
        <div>
          <p className="explore-lbl-stats__val">{stats.hubs}</p>
          <p className="explore-lbl-stats__label">Scene hubs</p>
        </div>
      </div>
      <div className="explore-lbl-stats__item">
        <Users size={16} strokeWidth={2} aria-hidden />
        <div>
          <p className="explore-lbl-stats__val">{stats.artists}</p>
          <p className="explore-lbl-stats__label">Artists</p>
        </div>
      </div>
      <div className="explore-lbl-stats__item">
        <TrendingUp size={16} strokeWidth={2} aria-hidden />
        <div>
          <p className="explore-lbl-stats__val">{stats.releases}</p>
          <p className="explore-lbl-stats__label">Releases</p>
        </div>
      </div>
      <div className="explore-lbl-stats__item">
        <Calendar size={16} strokeWidth={2} aria-hidden />
        <div>
          <p className="explore-lbl-stats__val">{stats.events}</p>
          <p className="explore-lbl-stats__label">Events</p>
        </div>
      </div>
      <div className="explore-lbl-stats__item explore-lbl-stats__item--accent">
        <Sparkles size={16} strokeWidth={2} aria-hidden />
        <div>
          <p className="explore-lbl-stats__val">IOS</p>
          <p className="explore-lbl-stats__label">Curated by IOS Desk</p>
        </div>
      </div>
    </footer>
  )
}

export function ExploreSceneHubsSection({
  hubs,
  artistCount,
  releaseCount,
  eventCount,
}: ExploreSceneHubsSectionProps) {
  const rows = buildSceneHubMosaic(hubs)
  if (rows.length === 0) return null

  let cardIndex = 0

  return (
    <section id="explore-scenes" className="explore-section explore-scn-section">
      <header className="explore-scn-head">
        <div className="explore-scn-head__brand">
          <span className="explore-scn-head__num" aria-hidden>
            06
          </span>
          <div>
            <p className="explore-scn-head__kicker">Scenes</p>
            <h2 className="explore-scn-head__title">Scene Hubs</h2>
            <p className="explore-scn-head__sub">City × taste tribe — local density first.</p>
          </div>
        </div>

        <a href="#explore-scenes" className="explore-scn-head__all">
          <span className="explore-scn-head__all-text">All hubs</span>
          <span className="explore-scn-head__all-arrow" aria-hidden>
            →
          </span>
        </a>
      </header>

      <div className="explore-scn-mosaic">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={rowIndex === 0 ? 'explore-scn-row explore-scn-row--hero' : 'explore-scn-row explore-scn-row--quad'}
          >
            {row.map((item) => {
              const idx = cardIndex
              cardIndex += 1
              return <SceneHubCard key={item.hub.id} item={item} index={idx} />
            })}
          </div>
        ))}
      </div>

      <SceneStatsBar
        hubs={hubs}
        artistCount={artistCount}
        releaseCount={releaseCount}
        eventCount={eventCount}
      />
    </section>
  )
}
