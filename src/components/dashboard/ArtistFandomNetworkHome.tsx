import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { fetchArtistFandom } from '@/lib/fandom/service'
import type { FandomWindow } from '@/lib/fandom/types'
import { IOSImage } from '@/components/ui/IOSImage'

const KPIS = [
  { label: 'Total Followers', value: '24.8K', delta: '+12.6%', icon: '◎' },
  { label: 'Monthly Growth', value: '+3.2K', delta: '+18.4%', icon: '↗' },
  { label: 'Fan Engagement', value: '78%', delta: '+8.7%', icon: '◆' },
  { label: 'Fan Loyalty Score', value: '9.1/10', delta: '+6.3%', icon: '★' },
  { label: 'Viral Reach Index', value: '6.7K', delta: '+22.1%', icon: '⚡' },
] as const

const TRIBES = [
  { rank: 1, name: 'VOID SOCIETY', members: '6.2K', activity: 72, emblem: 'void' },
  { rank: 2, name: 'RIFT WALKERS', members: '4.8K', activity: 65, emblem: 'rift' },
  { rank: 3, name: 'BASS CULT', members: '3.9K', activity: 58, emblem: 'bass' },
  { rank: 4, name: 'NEON DRIFT', members: '2.7K', activity: 51, emblem: 'neon' },
] as const

const TRIBE_WARS = [
  { rank: 1, name: 'VOID SOCIETY', score: '12.4K', pct: 100 },
  { rank: 2, name: 'RIFT WALKERS', score: '9.8K', pct: 79 },
  { rank: 3, name: 'BASS CULT', score: '7.2K', pct: 58 },
  { rank: 4, name: 'NEON DRIFT', score: '5.1K', pct: 41 },
  { rank: 5, name: 'STATIC CREW', score: '3.9K', pct: 31 },
] as const

type SupporterRow = {
  rank: number
  name: string
  meta: string
  score: string
  avatarUrl?: string
  userId?: string
}

const MOCK_SUPPORTERS: SupporterRow[] = [
  { rank: 1, name: 'RIFT_MASTER', meta: 'LVL 8 · ARCHON', score: '4,820' },
  { rank: 2, name: 'VOID_ECHO', meta: 'LVL 7 · SENTINEL', score: '4,210' },
  { rank: 3, name: 'NEON_DRIFT', meta: 'LVL 6 · VANGUARD', score: '3,980' },
  { rank: 4, name: 'BASSLINE_X', meta: 'LVL 6 · WARDEN', score: '3,540' },
  { rank: 5, name: 'STATIC_KID', meta: 'LVL 5 · SCOUT', score: '3,120' },
]

const ACTIVITY = [
  { icon: '♪', user: 'RIFT_MASTER', text: 'added your track "Dissolve" to their playlist', time: '3m ago' },
  { icon: '💬', user: 'VOID_ECHO', text: 'commented on your latest post', time: '12m ago' },
  { icon: '↻', user: 'NEON_DRIFT', text: 'reposted your release announcement', time: '28m ago' },
  { icon: '↗', user: 'BASSLINE_X', text: 'shared your artist page', time: '1h ago' },
  { icon: '♥', user: 'STATIC_KID', text: 'saved your track to favorites', time: '2h ago' },
] as const

function Sparkline({ variant = 'default' }: { variant?: 'default' | 'soft' }) {
  return (
    <svg className={clsx('afn-spark', variant === 'soft' && 'afn-spark--soft')} viewBox="0 0 80 24" preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,18 10,14 20,16 30,10 40,12 50,8 60,10 70,6 80,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FandomMap() {
  return (
    <div className="afn-map" role="img" aria-label="Fandom network visualization">
      <svg className="afn-map-lines" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <line x1="200" y1="140" x2="90" y2="48" stroke="rgba(212,0,0,0.35)" strokeWidth="1" />
        <line x1="200" y1="140" x2="310" y2="72" stroke="rgba(212,0,0,0.28)" strokeWidth="1" />
        <line x1="200" y1="140" x2="120" y2="220" stroke="rgba(212,0,0,0.22)" strokeWidth="1" />
        <line x1="200" y1="140" x2="300" y2="210" stroke="rgba(212,0,0,0.32)" strokeWidth="1" />
        <circle cx="90" cy="48" r="28" fill="rgba(212,0,0,0.18)" />
        <circle cx="310" cy="72" r="18" fill="rgba(255,255,255,0.06)" />
        <circle cx="120" cy="220" r="22" fill="rgba(255,255,255,0.04)" />
        <circle cx="300" cy="210" r="26" fill="rgba(212,0,0,0.14)" />
        {[...Array(18)].map((_, i) => (
          <circle
            key={i}
            cx={40 + (i * 19) % 320}
            cy={30 + (i * 13) % 220}
            r={i % 3 === 0 ? 2.5 : 1.5}
            fill={i % 4 === 0 ? 'rgba(212,0,0,0.55)' : 'rgba(255,255,255,0.2)'}
          />
        ))}
      </svg>
      <span className="afn-map-center">
        <span className="afn-map-center-ring" aria-hidden />
        MV
      </span>
      <span className="afn-map-node afn-map-node--tribe" style={{ top: '10%', left: '14%' }}>
        VOID SOCIETY · 4.8K
      </span>
      <span className="afn-map-node afn-map-node--super" style={{ top: '20%', right: '12%' }}>
        Super fans
      </span>
      <span className="afn-map-node afn-map-node--active" style={{ bottom: '16%', left: '18%' }}>
        Active fans
      </span>
      <span className="afn-map-node afn-map-node--tribe" style={{ bottom: '12%', right: '14%' }}>
        RIFT WALKERS · 3.2K
      </span>
    </div>
  )
}

export function ArtistFandomNetworkHome() {
  const [window, setWindow] = useState<FandomWindow>('90d')
  const [loading, setLoading] = useState(true)
  const [supporters, setSupporters] = useState(MOCK_SUPPORTERS)
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchArtistFandom(window)
      if (data.supporters?.length) {
        setSupporters(
          data.supporters.slice(0, 5).map((s, i) => ({
            rank: i + 1,
            name: s.displayName.replace(/\s/g, '_').toUpperCase(),
            meta: s.badgeLabel ? s.badgeLabel.toUpperCase() : `RANK #${s.supporterRank}`,
            score: `${Math.round(4800 - i * 320)}`,
            avatarUrl: s.avatarUrl,
            userId: s.supporterUserId,
          })),
        )
      }
    } catch {
      setSupporters(MOCK_SUPPORTERS)
    } finally {
      setLoading(false)
    }
  }, [window])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="afn-home">
      <header className="afn-hero">
        <div>
          <h2 className="afn-title">My Fandom</h2>
          <p className="afn-subtitle">Build your cult. Power your movement.</p>
        </div>
        <div className="afn-hero-actions">
          <select
            className="afn-select"
            value={window}
            onChange={(e) => setWindow(e.target.value as FandomWindow)}
            aria-label="Time range"
          >
            <option value="90d">Last 30 Days</option>
            <option value="all">All time</option>
          </select>
          <button type="button" className="afn-export-btn">
            <span aria-hidden>↓</span> Export Report
          </button>
        </div>
      </header>

      <div className="afn-kpis">
        {KPIS.map((k) => (
          <article key={k.label} className="afn-kpi">
            <span className="afn-kpi-icon" aria-hidden>
              {k.icon}
            </span>
            <p className="afn-kpi-label">{k.label}</p>
            <p className="afn-kpi-value">{k.value}</p>
            <p className="afn-kpi-delta">↑ {k.delta}</p>
            <Sparkline />
          </article>
        ))}
      </div>

      <div className="afn-mid">
        <section className="afn-panel afn-tribes">
          <h3 className="afn-panel-title">Top Tribes</h3>
          <div className="afn-tribe-grid">
            {TRIBES.map((t) => (
              <article key={t.name} className="afn-tribe-card">
                <span className="afn-tribe-rank">{t.rank}</span>
                <span className={clsx('afn-tribe-emblem', `afn-tribe-emblem--${t.emblem}`)} aria-hidden />
                <p className="afn-tribe-name">{t.name}</p>
                <p className="afn-tribe-meta">{t.members} MEMBERS</p>
                <div className="afn-tribe-bar">
                  <span style={{ width: `${t.activity}%` }} />
                </div>
                <p className="afn-tribe-pct">{t.activity}% Activity</p>
              </article>
            ))}
          </div>
        </section>

        <section className="afn-panel">
          <h3 className="afn-panel-title">Tribe Wars Leaderboard</h3>
          <ol className="afn-wars-list">
            {TRIBE_WARS.map((t) => (
              <li key={t.name} className="afn-wars-row">
                <span className="afn-wars-rank">{t.rank}</span>
                <span className="afn-wars-name">{t.name}</span>
                <span className="afn-wars-bar">
                  <span style={{ width: `${t.pct}%` }} />
                </span>
                <span className="afn-wars-score">{t.score}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="afn-link-btn">
            View All Tribes →
          </button>
        </section>

        <section className="afn-panel">
          <h3 className="afn-panel-title">Top Supporters</h3>
          {loading ? (
            <p className="text-sm text-muted p-4">Loading…</p>
          ) : (
            <ol className="afn-supporters-list">
              {supporters.map((s) => (
                <li key={s.rank} className="afn-supporter-row">
                  <span
                    className={clsx(
                      'afn-supporter-rank',
                      s.rank === 1 && 'afn-supporter-rank--gold',
                      s.rank === 2 && 'afn-supporter-rank--silver',
                      s.rank === 3 && 'afn-supporter-rank--bronze',
                    )}
                  >
                    {s.rank}
                  </span>
                  {s.avatarUrl ? (
                    <IOSImage src={s.avatarUrl} alt="" width={36} height={36} className="afn-supporter-av" />
                  ) : (
                    <span className="afn-supporter-av afn-supporter-av--ph" />
                  )}
                  <div className="afn-supporter-copy">
                    <p className="afn-supporter-name">{s.name}</p>
                    <p className="afn-supporter-meta">{s.meta}</p>
                  </div>
                  <div className="afn-supporter-score">
                    <span className="afn-supporter-score-label">Support Score</span>
                    <strong>{s.score}</strong>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <button type="button" className="afn-link-btn">
            View All Supporters →
          </button>
        </section>
      </div>

      <div className="afn-bottom">
        <section className="afn-panel afn-feed">
          <h3 className="afn-panel-title">Fan Activity Feed</h3>
          <ul className="afn-activity-list">
            {ACTIVITY.map((a) => (
              <li key={a.time + a.user} className="afn-activity-row">
                <span className="afn-activity-icon">{a.icon}</span>
                <p className="afn-activity-text">
                  <strong>@{a.user}</strong> {a.text}
                </p>
                <time className="afn-activity-time">{a.time}</time>
              </li>
            ))}
          </ul>
        </section>

        <section className="afn-panel afn-map-panel">
          <h3 className="afn-panel-title">Fandom Network</h3>
          <FandomMap />
          <ul className="afn-map-legend">
            <li><span className="afn-legend-dot afn-legend-dot--tribe" /> Tribes</li>
            <li><span className="afn-legend-dot afn-legend-dot--super" /> Super Fans</li>
            <li><span className="afn-legend-dot afn-legend-dot--active" /> Active Fans</li>
          </ul>
        </section>

        <section className="afn-panel afn-insights">
          <h3 className="afn-panel-title">Insights</h3>
          <article className="afn-insight-card afn-insight-card--release">
            <div className="afn-release-art" aria-hidden />
            <div>
              <p className="afn-insight-kicker">Trending Release</p>
              <p className="afn-insight-title">DISSOLVE</p>
              <p className="afn-insight-meta">2.4K saves · 1.1K shares</p>
              <Sparkline variant="soft" />
            </div>
          </article>
          <article className="afn-insight-card afn-insight-card--event">
            <div className="afn-event-date" aria-hidden>
              <span className="afn-event-month">JUN</span>
              <span className="afn-event-day">15</span>
            </div>
            <div>
              <p className="afn-insight-kicker">Upcoming Event</p>
              <p className="afn-insight-title">VOIDRIFT LIVE</p>
              <p className="afn-insight-meta">The Bunker, London · 142 going</p>
            </div>
          </article>
          <article className="afn-insight-card afn-insight-card--row">
            <div>
              <p className="afn-insight-kicker">Editorial</p>
              <p className="afn-insight-title">3 New</p>
            </div>
            <div>
              <p className="afn-insight-kicker">Playlists</p>
              <p className="afn-insight-title">18 · +4</p>
            </div>
          </article>
          <button type="button" className="afn-link-btn">
            View All Insights →
          </button>
        </section>
      </div>
    </div>
  )
}
