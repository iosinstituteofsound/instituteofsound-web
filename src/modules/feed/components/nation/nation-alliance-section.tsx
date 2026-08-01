import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import { useNationHub } from '@/modules/feed/hooks/use-nation-hub'
import { useAlliances, useMyAlliance } from '@/modules/tribes/hooks/use-alliances'
import { cn } from '@/shared/lib/cn'

export function NationAllianceSection() {
  const hub = useNationHub()
  const mine = useMyAlliance()
  const leaderboard = useAlliances({ sort: 'score', limit: 3 })
  const topAlliances = (leaderboard.data ?? []).slice(0, 3)
  const myAlliance = mine.data?.alliance
  const membership = mine.data?.membership
  const loading = mine.isLoading || leaderboard.isLoading
  const leaderGenre = hub.genreWar?.leaderGenre ?? 'electronic'

  return (
    <section className="nation-section">
      <div className="nation-section__head">
        <h2 className="nation-section__title">Your Alliance</h2>
        <Link to={`/genres/${leaderGenre}`} className="nation-section__link">
          Browse Genres
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {hub.genreWar?.leaderLabel ? (
        <div className="nation-genre-war">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <p>
            Genre war lead: <span className="text-primary">{hub.genreWar.leaderLabel}</span>
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="nation-card nation-card--center">Loading alliances…</div>
      ) : myAlliance && membership ? (
        <div className="nation-card">
          <p className="nation-card__label">Squad</p>
          <p className="nation-card__hero">{myAlliance.name}</p>
          <p className="nation-card__meta">
            {(myAlliance.genreLabel ?? myAlliance.genreSlug)} · {myAlliance.reputationTag} · Lv{' '}
            {myAlliance.level}
          </p>
          <div className="nation-stat-chips">
            <div className="nation-stat-chip">
              <span>Rank</span>
              <strong>{membership.rankTitle}</strong>
            </div>
            <div className="nation-stat-chip">
              <span>Score</span>
              <strong className="text-primary">{myAlliance.tribeScore.toLocaleString()}</strong>
            </div>
            <div className="nation-stat-chip">
              <span>Your wk dB</span>
              <strong>{membership.weeklyDbContributed.toLocaleString()}</strong>
            </div>
          </div>
          <div className="nation-actions">
            <Link
              to={`/genres/${myAlliance.genreSlug}/alliances/${myAlliance.slug}`}
              className="nation-btn nation-btn--primary"
            >
              Open HQ
            </Link>
          </div>
          <p className="nation-card__meta">
            +2 dB listen bonus · war claim +25 dB to active members
          </p>
        </div>
      ) : (
        <div className="nation-card">
          <p className="nation-card__label">No alliance yet</p>
          <p className="nation-card__body">
            Join a squad for +2 personal dB per listen, weekly war rewards, and shared treasury dB.
          </p>
          <div className="nation-actions">
            <Link to={`/genres/${leaderGenre}`} className="nation-btn nation-btn--ghost">
              Find an alliance
            </Link>
            <Link
              to={`/genres/${leaderGenre}/alliances/new`}
              className="nation-btn nation-btn--primary"
            >
              Create an alliance
            </Link>
          </div>
        </div>
      )}

      {topAlliances.length > 0 ? (
        <div className="nation-card">
          <p className="nation-card__label">Top alliances</p>
          <ul className="nation-alliance-list">
            {topAlliances.map((row, index) => (
              <li key={row.id}>
                <Link
                  to={`/genres/${row.genreSlug}/alliances/${row.slug}`}
                  className="nation-alliance-row"
                >
                  <span className="nation-alliance-row__rank">#{index + 1}</span>
                  <span className="nation-alliance-row__copy">
                    <strong>{row.name}</strong>
                    <em>
                      {row.genreSlug.replace(/-/g, ' ')} · {row.tribeScore.toLocaleString()} pts
                    </em>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-45" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export function NationStatsSection() {
  const stats = useNationHub()

  if (stats.isLoading) {
    return <div className="nation-card nation-card--center">Loading Nation stats…</div>
  }

  if (stats.isError) {
    return (
      <div className="nation-card nation-card--center">
        <p>Could not load Nation stats.</p>
        <button type="button" className="nation-btn nation-btn--ghost mt-3" onClick={() => void stats.refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const networkPct = Math.min(100, Math.round((stats.networkScore / Math.max(stats.networkScoreCap, 1)) * 100))

  return (
    <section className="nation-stats">
      <div className="nation-card nation-card--network">
        <p className="nation-card__label">Network Score</p>
        <div className="nation-card__row">
          <p className="nation-card__hero">{stats.networkScore.toLocaleString()}</p>
          <p className="nation-trend">↑ {stats.networkTrendPct}% this week</p>
        </div>
        <div className="nation-progress" aria-hidden>
          <span style={{ width: `${networkPct}%` }} />
        </div>
        <p className="nation-card__meta">Cap {Math.round(stats.networkScoreCap / 1000)}K</p>
      </div>

      <div className="nation-stats__pair">
        <div className="nation-card">
          <p className="nation-card__label">Wallet dB</p>
          <p className={cn('nation-card__hero', 'text-primary')}>
            {stats.dbScore.toLocaleString()}
            <span className="nation-card__unit">dB</span>
          </p>
          <p className="nation-card__meta">+{stats.dbTrendDelta} dB this week</p>
        </div>
        <div className="nation-card">
          <p className="nation-card__label">Rank</p>
          <p className="nation-card__hero">
            {stats.rankTierLabel}
            <span className="nation-card__unit">{stats.rankLevelLabel}</span>
          </p>
          <p className="nation-card__meta">Top {stats.rankPercentile}%</p>
        </div>
      </div>
    </section>
  )
}
