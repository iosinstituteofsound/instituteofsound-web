import { Link } from 'react-router-dom'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { SCENE_CITIES, SCENE_GENRES } from '@/lib/discovery/sceneRegistry'

interface DiscoveryPathsPanelProps {
  className?: string
}

export function DiscoveryPathsPanel({ className }: DiscoveryPathsPanelProps) {
  const { stats } = useCommunityMemberStats()

  const tribeSlug = stats?.primaryGenreSlug
  const tribeCity = SCENE_CITIES[0]

  return (
    <section
      className={['discovery-paths ios-card', className].filter(Boolean).join(' ')}
      aria-labelledby="discovery-paths-heading"
    >
      <p className="ios-kicker" id="discovery-paths-heading">
        Discovered by people. Not machines.
      </p>
      <p className="font-display text-xl font-bold mt-1">Human discovery paths</p>
      <p className="text-sm text-muted mt-2">
        No global algorithm feed — music surfaces through editors, tribes, crews, and scenes you
        trust.
      </p>

      <ul className="discovery-paths-list mt-6">
        <li>
          <Link to="/community#feed" className="discovery-path-row">
            <span className="discovery-path-label">Following</span>
            <span className="discovery-path-desc">Operators and crews you follow</span>
          </Link>
        </li>
        {tribeSlug && (
          <li>
            <Link to="/community#feed" className="discovery-path-row">
              <span className="discovery-path-label">Your tribe</span>
              <span className="discovery-path-desc">
                Weekly board for {SCENE_GENRES.find((g) => g.slug === tribeSlug)?.label ?? tribeSlug}
              </span>
            </Link>
          </li>
        )}
        <li>
          <Link to="/features" className="discovery-path-row">
            <span className="discovery-path-label">Editor path</span>
            <span className="discovery-path-desc">IOS desk features, reviews, and wire picks</span>
          </Link>
        </li>
        {tribeSlug && (
          <li>
            <Link
              to={`/scenes/${tribeCity.slug}/${tribeSlug}`}
              className="discovery-path-row discovery-path-row-accent"
            >
              <span className="discovery-path-label">Your scene</span>
              <span className="discovery-path-desc">
                {tribeCity.label} · {SCENE_GENRES.find((g) => g.slug === tribeSlug)?.label}
              </span>
            </Link>
          </li>
        )}
        <li>
          <Link to="/collab" className="discovery-path-row">
            <span className="discovery-path-label">Collab board</span>
            <span className="discovery-path-desc">Need / offer calls — city, genre, skill filters</span>
          </Link>
        </li>
        <li>
          <Link to="/scenes" className="discovery-path-row">
            <span className="discovery-path-label">India scenes</span>
            <span className="discovery-path-desc">City + genre hubs — local density first</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
