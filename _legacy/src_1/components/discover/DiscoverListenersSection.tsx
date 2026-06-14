import { useEffect, useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { networkProfilePath } from '@/lib/community/networkPaths'
import {
  discoverNetworkStats,
  formatDb,
  formatDelta,
  listDiscoverListeners,
  type DiscoverListenerRow,
} from '@/lib/discovery/listeners'
import '@/styles/listeners-operators.css'

function roleBadgeLabel(rank: string): string {
  return rank.toUpperCase()
}

function ListenerAvatar({ row, size }: { row: DiscoverListenerRow; size: 'hero' | 'card' }) {
  const initial = row.name.slice(0, 1).toUpperCase()
  const cls = size === 'hero' ? 'lsn-hero__avatar-img' : 'lsn-card__avatar-img'
  if (row.avatarUrl) {
    return <img src={row.avatarUrl} alt="" className={cls} loading="lazy" />
  }
  return <span className={`${cls}-fallback`}>{initial}</span>
}

function RoleBadge({ rank }: { rank: string }) {
  return <span className="lsn-role-badge">{roleBadgeLabel(rank)}</span>
}

function HeroCard({ row }: { row: DiscoverListenerRow }) {
  return (
    <GatedLink
      to={networkProfilePath(row.handle)}
      forceGate
      className="lsn-hero"
      aria-label={`#1 ${row.name}`}
    >
      <div className="lsn-hero__bg" aria-hidden />
      <span className="lsn-hero__rank-pill">#1 · This week</span>
      <div className="lsn-hero__avatar">
        <ListenerAvatar row={row} size="hero" />
      </div>
      <p className="lsn-hero__name">{row.name}</p>
      <RoleBadge rank={row.rank} />
      <p className="lsn-hero__db">{formatDb(row.weeklyDb)}</p>
      <p className="lsn-hero__delta">{formatDelta(row.weeklyDelta)} from last week</p>
      <div className="lsn-hero__foot">
        {row.totalListens && (
          <div className="lsn-hero__stat">
            <IcoWave />
            <span className="lsn-hero__stat-label">Total listens</span>
            <span className="lsn-hero__stat-val">{row.totalListens}</span>
          </div>
        )}
        <div className="lsn-hero__stat">
          <IcoPeople />
          <span className="lsn-hero__stat-label">Followers</span>
          <span className="lsn-hero__stat-val">{row.followers}</span>
        </div>
        {row.weeksOnTop != null && (
          <div className="lsn-hero__stat">
            <IcoCal />
            <span className="lsn-hero__stat-label">Weeks on top</span>
            <span className="lsn-hero__stat-val">{row.weeksOnTop}</span>
          </div>
        )}
      </div>
    </GatedLink>
  )
}

function SideCard({ row, rank }: { row: DiscoverListenerRow; rank: number }) {
  return (
    <GatedLink
      to={networkProfilePath(row.handle)}
      forceGate
      className="lsn-card"
      aria-label={`#${rank} ${row.name}`}
    >
      <span className="lsn-card__rank">#{rank}</span>
      <div className="lsn-card__avatar">
        <ListenerAvatar row={row} size="card" />
      </div>
      <p className="lsn-card__name">{row.name}</p>
      <RoleBadge rank={row.rank} />
      <p className="lsn-card__db">{formatDb(row.weeklyDb)}</p>
      <p className="lsn-card__delta">{formatDelta(row.weeklyDelta)}</p>
      <div className="lsn-card__followers">
        <span className="lsn-card__followers-label">Followers</span>
        <span className="lsn-card__followers-val">{row.followers}</span>
      </div>
    </GatedLink>
  )
}

function TrendChip({ row, rank }: { row: DiscoverListenerRow; rank: number }) {
  const initial = row.name.slice(0, 1).toUpperCase()
  return (
    <GatedLink
      to={networkProfilePath(row.handle)}
      forceGate
      className="lsn-trend"
      aria-label={`#${rank} ${row.name}`}
    >
      <span className="lsn-trend__rank">{rank}</span>
      <span className="lsn-trend__avatar" aria-hidden>
        {initial}
      </span>
      <span className="lsn-trend__name">{row.name}</span>
      <span className="lsn-trend__delta">{formatDelta(row.weeklyDelta)}</span>
    </GatedLink>
  )
}

export function DiscoverListenersSection() {
  const [rows, setRows] = useState<DiscoverListenerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void listDiscoverListeners(10)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  const top = rows[0]
  const side = rows.slice(1, 5)
  const trend = rows.slice(5, 10)
  const stats = discoverNetworkStats(rows)

  return (
    <section id="discover-listeners" className="lsn-sec scroll-mt-24">
      <header className="lsn-sec__head">
        <div className="lsn-sec__brand">
          <span className="lsn-sec__idx" aria-hidden>
            08
          </span>
          <div>
            <p className="lsn-sec__tag">Operators</p>
            <h2 className="lsn-sec__title">Listeners</h2>
            <p className="lsn-sec__sub">Weekly dB on the network.</p>
          </div>
        </div>
        <GatedLink to="/community#genre-board" forceGate className="lsn__board-btn">
          Leaderboards →
        </GatedLink>
      </header>

      {loading && <p className="disco-loading">Loading operators…</p>}

      {!loading && top && (
        <>
          <div className="lsn__top">
            <HeroCard row={top} />
            {side.map((row, i) => (
              <SideCard key={row.userId} row={row} rank={i + 2} />
            ))}
          </div>

          <div className="lsn__foot">
            <div className="lsn__foot-trend">
              <p className="lsn__foot-kicker">Trending this week</p>
              <div className="lsn__foot-trend-row">
                {trend.map((row, i) => (
                  <TrendChip key={row.userId} row={row} rank={i + 6} />
                ))}
              </div>
            </div>

            <aside className="lsn__foot-network" aria-label="Network totals">
              <p className="lsn__foot-kicker">Total network dB</p>
              <div className="lsn__foot-network-line">
                <IcoWaveLarge />
                <p className="lsn__foot-network-val">
                  <span className="lsn__foot-network-num">{stats.totalDb}</span>
                  <span className="lsn__foot-network-unit">dB</span>
                </p>
                <GatedLink to="/community" forceGate className="lsn__foot-network-btn" aria-label="Community stats">
                  <IcoChart />
                </GatedLink>
              </div>
              <p className="lsn__foot-network-growth">↑ {stats.growthPct} from last week</p>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}

function IcoWave() {
  return (
    <svg className="lsn-ico" width="14" height="12" viewBox="0 0 14 12" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={1 + i * 3.5} y={2 - (i % 2)} width="2" height={4 + (i % 2) * 3} fill="currentColor" />
      ))}
    </svg>
  )
}

function IcoWaveLarge() {
  return (
    <svg className="lsn-ico lsn-ico--red" width="22" height="18" viewBox="0 0 22 18" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={1 + i * 4} y={2 - (i % 2)} width="2.5" height={6 + (i % 2) * 4} fill="currentColor" />
      ))}
    </svg>
  )
}

function IcoPeople() {
  return (
    <svg className="lsn-ico" width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <circle cx="4.5" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1" />
      <path d="M1 10c0-1.6 1.4-2.8 3.5-2.8S8 8.4 8 10" stroke="currentColor" strokeWidth="1" />
      <circle cx="9.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M7.5 10c0-1.2 0.9-2 2.5-2" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function IcoCal() {
  return (
    <svg className="lsn-ico" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="9" height="8" rx="0.8" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 4.5h9" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function IcoChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2" y="8" width="2" height="4" fill="currentColor" />
      <rect x="6" y="5" width="2" height="7" fill="currentColor" />
      <rect x="10" y="2" width="2" height="10" fill="currentColor" />
    </svg>
  )
}
