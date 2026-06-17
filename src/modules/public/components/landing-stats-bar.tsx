import type { PlatformStats } from '@/modules/public/types/platform-stats.types'

function formatStat(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

interface StatTile {
  label: string
  value: number
}

function buildTiles(stats: PlatformStats): StatTile[] {
  return [
    { label: 'Listeners', value: stats.listeners },
    { label: 'Artists', value: stats.artists },
    { label: 'Releases', value: stats.releases.total },
    { label: 'Playlists', value: stats.playlists },
    { label: 'Total plays', value: stats.totalPlays },
    { label: 'Editors', value: stats.editors },
  ].filter((tile) => tile.value > 0)
}

interface LandingStatsBarProps {
  stats?: PlatformStats | null
  isLoading?: boolean
}

export function LandingStatsBar({ stats, isLoading }: LandingStatsBarProps) {
  const tiles = stats ? buildTiles(stats) : []

  if (!isLoading && tiles.length === 0) return null

  return (
    <section className="landing-stats" aria-label="Platform statistics">
      <div className="landing-stats__inner">
        <header className="landing-stats__head">
          <p className="landing-stats__kicker">Network</p>
          <h2 className="landing-stats__title">The movement in numbers</h2>
        </header>
        <div className="landing-stats__grid">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="landing-stats__tile">
                  <div className="landing-stats__skeleton" />
                  <p className="landing-stats__label">&nbsp;</p>
                </div>
              ))
            : tiles.map((tile) => (
                <div key={tile.label} className="landing-stats__tile">
                  <p className="landing-stats__value">{formatStat(tile.value)}</p>
                  <p className="landing-stats__label">{tile.label}</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
