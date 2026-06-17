import { Link } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  Check,
  Users,
  AudioLines,
} from 'lucide-react'
import type { ListenerStatDto } from '@/modules/explore/types/explore.types'
import type { ExploreListenerRow } from '@/modules/explore/lib/listener-meta'
import {
  formatDb,
  formatDelta,
  listenerInitial,
  listenerNetworkStats,
  listExploreListeners,
} from '@/modules/explore/lib/listener-meta'
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'

interface ExploreListenersSectionProps {
  topListener: ListenerStatDto | null
  cards: ListenerStatDto[]
  totalListeners: number
  totalPlays: number
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="explore-lsn-role">
      <Check size={10} strokeWidth={2.5} aria-hidden />
      {role}
    </span>
  )
}

function ListenerAvatar({
  row,
  size,
}: {
  row: ExploreListenerRow
  size: 'hero' | 'card' | 'trend'
}) {
  const cls =
    size === 'hero'
      ? 'explore-lsn-hero__avatar-img'
      : size === 'card'
        ? 'explore-lsn-card__avatar-img'
        : 'explore-lsn-trend__avatar-img'

  if (row.avatarUrl) {
    return <img src={row.avatarUrl} alt="" loading="lazy" className={cls} />
  }

  return <span className={`${cls}-fallback`}>{listenerInitial(row.name)}</span>
}

function HeroCard({ row }: { row: ExploreListenerRow }) {
  return (
    <Link to={`/profile/${row.userId}`} className="explore-lsn-hero" aria-label={`#1 ${row.name}`}>
      <div className="explore-lsn-hero__bg" aria-hidden>
        {row.avatarUrl ? (
          <img src={row.avatarUrl} alt="" className="explore-lsn-hero__bg-photo" loading="lazy" />
        ) : null}
        <div className="explore-lsn-hero__bg-glow" />
      </div>
      <span className="explore-lsn-hero__rank-pill">#1 · This week</span>
      <div className="explore-lsn-hero__avatar">
        <ListenerAvatar row={row} size="hero" />
      </div>
      <p className="explore-lsn-hero__name">{row.name}</p>
      <RoleBadge role="Listener" />
      <p className="explore-lsn-hero__db">{formatDb(row.dbScore)}</p>
      <p className="explore-lsn-hero__delta">{formatDelta(row.weeklyDelta)} from last week</p>
      <div className="explore-lsn-hero__foot">
        {row.totalListens ? (
          <div className="explore-lsn-hero__stat">
            <AudioLines size={14} strokeWidth={2} aria-hidden />
            <span className="explore-lsn-hero__stat-label">Total listens</span>
            <span className="explore-lsn-hero__stat-val">{row.totalListens}</span>
          </div>
        ) : null}
        <div className="explore-lsn-hero__stat">
          <Users size={14} strokeWidth={2} aria-hidden />
          <span className="explore-lsn-hero__stat-label">Followers</span>
          <span className="explore-lsn-hero__stat-val">{row.followers}</span>
        </div>
        {row.weeksOnTop != null ? (
          <div className="explore-lsn-hero__stat">
            <Calendar size={14} strokeWidth={2} aria-hidden />
            <span className="explore-lsn-hero__stat-label">Weeks on top</span>
            <span className="explore-lsn-hero__stat-val">{row.weeksOnTop}</span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

function SideCard({ row, rank }: { row: ExploreListenerRow; rank: number }) {
  const listens = row.totalListens ?? String(row.totalPlays)

  return (
    <Link to={`/profile/${row.userId}`} className="explore-lsn-card" aria-label={`#${rank} ${row.name}`}>
      <div className="explore-lsn-card__glow" aria-hidden />

      <header className="explore-lsn-card__head">
        <span className="explore-lsn-card__rank">#{rank}</span>
        <div className="explore-lsn-card__avatar-ring">
          <div className="explore-lsn-card__avatar">
            <ListenerAvatar row={row} size="card" />
          </div>
        </div>
      </header>

      <div className="explore-lsn-card__main">
        <p className="explore-lsn-card__name">{row.name}</p>
        <RoleBadge role="Listener" />
        <div className="explore-lsn-card__db-panel">
          <span className="explore-lsn-card__db-kicker">Weekly dB</span>
          <p className="explore-lsn-card__db">{formatDb(row.dbScore)}</p>
          <p className="explore-lsn-card__delta">{formatDelta(row.weeklyDelta)} from last week</p>
        </div>
      </div>

      <footer className="explore-lsn-card__foot">
        <div className="explore-lsn-card__mini-stat">
          <AudioLines size={12} strokeWidth={2} aria-hidden />
          <span className="explore-lsn-card__mini-label">Listens</span>
          <span className="explore-lsn-card__mini-val">{listens}</span>
        </div>
        <div className="explore-lsn-card__mini-stat">
          <Users size={12} strokeWidth={2} aria-hidden />
          <span className="explore-lsn-card__mini-label">Followers</span>
          <span className="explore-lsn-card__mini-val">{row.followers}</span>
        </div>
      </footer>
    </Link>
  )
}

function TrendCard({ row, rank }: { row: ExploreListenerRow; rank: number }) {
  return (
    <Link to={`/profile/${row.userId}`} className="explore-lsn-trend" aria-label={`#${rank} ${row.name}`}>
      <div className="explore-lsn-trend__glow" aria-hidden />
      <header className="explore-lsn-trend__head">
        <span className="explore-lsn-trend__rank">#{rank}</span>
        <div className="explore-lsn-trend__avatar-ring">
          <span className="explore-lsn-trend__avatar" aria-hidden>
            {row.avatarUrl ? (
              <img src={row.avatarUrl} alt="" className="explore-lsn-trend__avatar-img" loading="lazy" />
            ) : (
              <span className="explore-lsn-trend__avatar-fallback">{listenerInitial(row.name)}</span>
            )}
          </span>
        </div>
      </header>
      <div className="explore-lsn-trend__body">
        <p className="explore-lsn-trend__name">{row.name}</p>
        <span className="explore-lsn-trend__role">
          <Check size={8} strokeWidth={2.5} aria-hidden />
          Listener
        </span>
        <div className="explore-lsn-trend__metric">
          <span className="explore-lsn-trend__db">{formatDb(row.dbScore)}</span>
          <span className="explore-lsn-trend__delta">{formatDelta(row.weeklyDelta)}</span>
        </div>
      </div>
    </Link>
  )
}

function NetworkBars() {
  return (
    <div className="explore-lsn-foot__network-bars" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="explore-lsn-foot__network-bar" />
      ))}
    </div>
  )
}

export function ExploreListenersSection({
  topListener,
  cards,
  totalListeners,
  totalPlays,
}: ExploreListenersSectionProps) {
  const rows = listExploreListeners(cards, topListener, 10)
  if (rows.length === 0) return null

  const top = rows[0]!
  const side = rows.slice(1, 5)
  const trend = rows.slice(5, 10)
  const stats = listenerNetworkStats(rows, totalPlays)
  const listenerCount = totalListeners > 0 ? totalListeners : rows.length

  return (
    <section id="explore-listeners" className="explore-section explore-lsn-section">
      <ExploreSectionHead
        index={8}
        kicker="Leaderboard"
        title="Listeners"
        description="Weekly dB on the network."
        action={<ExploreSectionHeadAction label="Leaderboards" href="#explore-listeners" />}
      />

      <div className="explore-lsn-top">
        <HeroCard row={top} />
        {side.map((row, i) => (
          <SideCard key={row.id} row={row} rank={i + 2} />
        ))}
      </div>

      <div className="explore-lsn-foot">
        <div className="explore-lsn-foot__trend">
          <div className="explore-lsn-foot__trend-head">
            <p className="explore-lsn-foot__kicker">Trending this week</p>
            <span className="explore-lsn-foot__trend-tag">Ranks 6–10</span>
          </div>
          <div className="explore-lsn-foot__trend-row">
            {trend.map((row, i) => (
              <TrendCard key={row.id} row={row} rank={i + 6} />
            ))}
          </div>
        </div>

        <aside className="explore-lsn-foot__network" aria-label="Network totals">
          <div className="explore-lsn-foot__network-glow" aria-hidden />
          <NetworkBars />
          <p className="explore-lsn-foot__kicker">Total network dB</p>
          <div className="explore-lsn-foot__network-panel">
            <div className="explore-lsn-foot__network-line">
              <AudioLines size={22} strokeWidth={2} className="explore-lsn-foot__wave" aria-hidden />
              <p className="explore-lsn-foot__network-val">
                <span className="explore-lsn-foot__network-num">{stats.totalDb}</span>
                <span className="explore-lsn-foot__network-unit">dB</span>
              </p>
              <a href="#explore-listeners" className="explore-lsn-foot__network-btn" aria-label="Network stats">
                <BarChart3 size={14} strokeWidth={2} aria-hidden />
              </a>
            </div>
            <p className="explore-lsn-foot__network-growth">↑ {stats.growthPct} from last week</p>
          </div>
          <div className="explore-lsn-foot__network-meta">
            <div className="explore-lsn-foot__network-stat">
              <Users size={12} strokeWidth={2} aria-hidden />
              <span className="explore-lsn-foot__network-stat-label">Listeners</span>
              <span className="explore-lsn-foot__network-stat-val">
                {listenerCount >= 1000
                  ? `${(listenerCount / 1000).toFixed(1)}K`
                  : listenerCount.toLocaleString()}
              </span>
            </div>
            <div className="explore-lsn-foot__network-stat">
              <AudioLines size={12} strokeWidth={2} aria-hidden />
              <span className="explore-lsn-foot__network-stat-label">Plays</span>
              <span className="explore-lsn-foot__network-stat-val">{stats.totalPlays}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
