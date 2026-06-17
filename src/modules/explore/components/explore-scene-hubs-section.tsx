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
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'
import { ExploreStatsBar } from '@/modules/explore/components/explore-stats-bar'

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
    <ExploreStatsBar
      aria-label="Scene network statistics"
      items={[
        {
          icon: <Globe2 size={16} strokeWidth={2} aria-hidden />,
          value: stats.hubs,
          label: 'Scene hubs',
        },
        {
          icon: <Users size={16} strokeWidth={2} aria-hidden />,
          value: stats.artists,
          label: 'Artists',
        },
        {
          icon: <TrendingUp size={16} strokeWidth={2} aria-hidden />,
          value: stats.releases,
          label: 'Releases',
        },
        {
          icon: <Calendar size={16} strokeWidth={2} aria-hidden />,
          value: stats.events,
          label: 'Events',
        },
        {
          icon: <Sparkles size={16} strokeWidth={2} aria-hidden />,
          value: 'IOS',
          label: 'Curated by IOS Desk',
          accent: true,
        },
      ]}
    />
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
      <ExploreSectionHead
        index={6}
        kicker="Scenes"
        title="Scene Hubs"
        description="City × taste tribe — local density first."
        action={<ExploreSectionHeadAction label="All hubs" href="#explore-scenes" />}
      />

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
