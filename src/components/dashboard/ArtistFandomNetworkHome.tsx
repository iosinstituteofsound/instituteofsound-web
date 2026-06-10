import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { fetchArtistFandom, fetchArtistSentRecognitions } from '@/lib/fandom/service'
import type {
  ArtistContentChampionRow,
  ArtistDiscoveryDriverRow,
  ArtistRecentSupportRow,
  ArtistSupporterRow,
  FandomSentRecognitionRow,
  FandomWindow,
} from '@/lib/fandom/types'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { IOSImage } from '@/components/ui/IOSImage'
import { FandomThankSupporterModal } from '@/components/fandom/FandomThankSupporterModal'
import { getLiveApiConfigHint } from '@/lib/api/liveMode'

const ACTION_LABEL: Record<string, string> = {
  review: 'left a review',
  editorial: 'wrote editorial about you',
  tagged_spin: 'spinned your track',
  tagged_drop: 'dropped your track',
  comment: 'commented on your work',
  reaction: 'reacted to your post',
  share: 'shared your work',
}

const ACTION_ICON: Record<string, string> = {
  review: '★',
  editorial: '✎',
  tagged_spin: '♪',
  tagged_drop: '↓',
  comment: '💬',
  reaction: '♥',
  share: '↗',
}

function aggregateSupporterTotals(supporters: ArtistSupporterRow[]) {
  return supporters.reduce(
    (acc, s) => ({
      spins: acc.spins + s.spins,
      drops: acc.drops + s.drops,
      reactions: acc.reactions + s.reactions,
      comments: acc.comments + s.comments,
      shares: acc.shares + s.shares,
      reviews: acc.reviews + s.reviews,
      editorials: acc.editorials + s.editorials,
      support: acc.support + s.supportScore,
    }),
    {
      spins: 0,
      drops: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      reviews: 0,
      editorials: 0,
      support: 0,
    },
  )
}

function artistInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

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

function FandomMap({
  centerLabel,
  supporters,
  drivers,
}: {
  centerLabel: string
  supporters: ArtistSupporterRow[]
  drivers: ArtistDiscoveryDriverRow[]
}) {
  const nodes = [
    ...supporters.slice(0, 2).map((s) => ({
      key: s.supporterUserId,
      label: `${s.displayName.split(/\s+/)[0]?.toUpperCase() ?? 'FAN'} · #${s.supporterRank}`,
      className: 'afn-map-node--super' as const,
      style: { top: '10%', left: '14%' },
    })),
    ...drivers.slice(0, 2).map((d, i) => ({
      key: d.supporterUserId,
      label: `${d.displayName.split(/\s+/)[0]?.toUpperCase() ?? 'FAN'} · ${d.shares} shares`,
      className: 'afn-map-node--tribe' as const,
      style: i === 0 ? { bottom: '16%', left: '18%' } : { bottom: '12%', right: '14%' },
    })),
  ]

  return (
    <div className="afn-map" role="img" aria-label="Fandom network visualization">
      <svg className="afn-map-lines" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <line x1="200" y1="140" x2="90" y2="48" stroke="var(--color-mh-red)" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="200" y1="140" x2="310" y2="72" stroke="var(--color-mh-red)" strokeOpacity="0.28" strokeWidth="1" />
        <line x1="200" y1="140" x2="120" y2="220" stroke="var(--color-mh-red)" strokeOpacity="0.22" strokeWidth="1" />
        <line x1="200" y1="140" x2="300" y2="210" stroke="var(--color-mh-red)" strokeOpacity="0.32" strokeWidth="1" />
        <circle cx="90" cy="48" r="28" fill="var(--color-mh-red)" fillOpacity="0.18" />
        <circle cx="310" cy="72" r="18" fill="var(--color-signal)" fillOpacity="0.06" />
        <circle cx="120" cy="220" r="22" fill="var(--color-signal)" fillOpacity="0.04" />
        <circle cx="300" cy="210" r="26" fill="var(--color-mh-red)" fillOpacity="0.14" />
        {[...Array(18)].map((_, i) => (
          <circle
            key={i}
            cx={40 + (i * 19) % 320}
            cy={30 + (i * 13) % 220}
            r={i % 3 === 0 ? 2.5 : 1.5}
            fill={i % 4 === 0 ? 'var(--color-mh-red)' : 'var(--color-signal)'}
            fillOpacity={i % 4 === 0 ? 0.55 : 0.2}
          />
        ))}
      </svg>
      <span className="afn-map-center">
        <span className="afn-map-center-ring" aria-hidden />
        {centerLabel}
      </span>
      {nodes.length === 0 ? (
        <span className="afn-map-node afn-map-node--active" style={{ top: '42%', left: '50%', transform: 'translateX(-50%)' }}>
          No supporter signals yet
        </span>
      ) : (
        nodes.map((node) => (
          <span
            key={node.key}
            className={clsx('afn-map-node', node.className)}
            style={node.style}
          >
            {node.label}
          </span>
        ))
      )}
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return <p className="text-sm text-muted p-4">{message}</p>
}

export function ArtistFandomNetworkHome() {
  const { user } = useAuth()
  const [window, setWindow] = useState<FandomWindow>('90d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supporters, setSupporters] = useState<ArtistSupporterRow[]>([])
  const [recent, setRecent] = useState<ArtistRecentSupportRow[]>([])
  const [champions, setChampions] = useState<ArtistContentChampionRow[]>([])
  const [drivers, setDrivers] = useState<ArtistDiscoveryDriverRow[]>([])
  const [sentRecognitions, setSentRecognitions] = useState<FandomSentRecognitionRow[]>([])
  const [thankTarget, setThankTarget] = useState<{ id: string; name: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [data, sent] = await Promise.all([
        fetchArtistFandom(window),
        fetchArtistSentRecognitions(),
      ])
      setSupporters(data.supporters ?? [])
      setRecent(data.recent ?? [])
      setChampions(data.champions ?? [])
      setDrivers(data.drivers ?? [])
      setSentRecognitions(sent ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fandom')
      setSupporters([])
      setRecent([])
      setChampions([])
      setDrivers([])
      setSentRecognitions([])
    } finally {
      setLoading(false)
    }
  }, [window])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(() => aggregateSupporterTotals(supporters), [supporters])
  const wiredReach = useMemo(
    () => drivers.reduce((sum, d) => sum + d.wiredReach, 0),
    [drivers],
  )
  const engagementEvents =
    totals.spins +
    totals.drops +
    totals.comments +
    totals.reactions +
    totals.shares +
    totals.reviews +
    totals.editorials

  const kpis = useMemo(
    () => [
      { label: 'Supporters', value: supporters.length.toLocaleString(), icon: '◎' },
      { label: 'Engagement', value: engagementEvents.toLocaleString(), icon: '↗' },
      { label: 'Reviews', value: (totals.reviews + totals.editorials).toLocaleString(), icon: '◆' },
      { label: 'Support score', value: totals.support.toLocaleString(), icon: '★' },
      { label: 'Wired reach', value: wiredReach.toLocaleString(), icon: '⚡' },
    ],
    [supporters.length, engagementEvents, totals.reviews, totals.editorials, totals.support, wiredReach],
  )

  const topDrivers = drivers.slice(0, 4)
  const topChampions = champions.slice(0, 5)
  const maxChampionScore = topChampions[0]?.contentScore ?? 1
  const liveHint = getLiveApiConfigHint()

  return (
    <div className="afn-home">
      <FandomThankSupporterModal
        supporterUserId={thankTarget?.id ?? ''}
        supporterName={thankTarget?.name ?? ''}
        open={thankTarget != null}
        onClose={() => setThankTarget(null)}
        onSent={() => void load()}
      />

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
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </header>

      {liveHint && (
        <p className="text-xs text-muted mb-4">{liveHint}</p>
      )}

      {error && <p className="text-sm text-mh-red mb-4">{error}</p>}

      <div className="afn-kpis">
        {kpis.map((k) => (
          <article key={k.label} className="afn-kpi">
            <span className="afn-kpi-icon" aria-hidden>
              {k.icon}
            </span>
            <p className="afn-kpi-label">{k.label}</p>
            <p className="afn-kpi-value">{loading ? '…' : k.value}</p>
            <Sparkline />
          </article>
        ))}
      </div>

      <div className="afn-mid">
        <section className="afn-panel afn-tribes">
          <h3 className="afn-panel-title">Discovery drivers</h3>
          {loading ? (
            <EmptyPanel message="Loading…" />
          ) : topDrivers.length === 0 ? (
            <EmptyPanel message="No amplification signals yet — supporters who share your work will appear here." />
          ) : (
            <div className="afn-tribe-grid">
              {topDrivers.map((d, i) => {
                const pct = Math.max(12, Math.round((d.wiredReach / (topDrivers[0]?.wiredReach || 1)) * 100))
                return (
                  <article key={d.supporterUserId} className="afn-tribe-card">
                    <span className="afn-tribe-rank">{i + 1}</span>
                    <span className={clsx('afn-tribe-emblem', `afn-tribe-emblem--${['void', 'rift', 'bass', 'neon'][i % 4]}`)} aria-hidden />
                    <p className="afn-tribe-name">{d.displayName.toUpperCase()}</p>
                    <p className="afn-tribe-meta">{d.shares} SHARES · {d.wiredReach} REACH</p>
                    <div className="afn-tribe-bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="afn-tribe-pct">#{d.driverRank} driver</p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="afn-panel">
          <h3 className="afn-panel-title">Content champions</h3>
          {loading ? (
            <EmptyPanel message="Loading…" />
          ) : topChampions.length === 0 ? (
            <EmptyPanel message="No champion content yet — spins, drops, reviews, and editorial will rank here." />
          ) : (
            <ol className="afn-wars-list">
              {topChampions.map((c, i) => {
                const pct = Math.max(8, Math.round((c.contentScore / maxChampionScore) * 100))
                return (
                  <li key={c.supporterUserId} className="afn-wars-row">
                    <span className="afn-wars-rank">{i + 1}</span>
                    <span className="afn-wars-name">{c.displayName.toUpperCase()}</span>
                    <span className="afn-wars-bar">
                      <span style={{ width: `${pct}%` }} />
                    </span>
                    <span className="afn-wars-score">{c.contentScore.toLocaleString()}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="afn-panel">
          <h3 className="afn-panel-title">Top Supporters</h3>
          {loading ? (
            <EmptyPanel message="Loading…" />
          ) : supporters.length === 0 ? (
            <EmptyPanel message="No supporter activity in this window yet." />
          ) : (
            <ol className="afn-supporters-list">
              {supporters.slice(0, 5).map((s) => (
                <li key={s.supporterUserId} className="afn-supporter-row">
                  <span
                    className={clsx(
                      'afn-supporter-rank',
                      s.supporterRank === 1 && 'afn-supporter-rank--gold',
                      s.supporterRank === 2 && 'afn-supporter-rank--silver',
                      s.supporterRank === 3 && 'afn-supporter-rank--bronze',
                    )}
                  >
                    {s.supporterRank}
                  </span>
                  {s.avatarUrl ? (
                    <IOSImage src={s.avatarUrl} alt="" width={36} height={36} className="afn-supporter-av" />
                  ) : (
                    <span className="afn-supporter-av afn-supporter-av--ph" />
                  )}
                  <div className="afn-supporter-copy">
                    <p className="afn-supporter-name">{s.displayName}</p>
                    <p className="afn-supporter-meta">
                      {s.badgeLabel ? s.badgeLabel.toUpperCase() : `RANK #${s.supporterRank}`}
                    </p>
                  </div>
                  <div className="afn-supporter-score">
                    <span className="afn-supporter-score-label">Support Score</span>
                    <strong>{s.supportScore.toLocaleString()}</strong>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      className="ios-btn ios-btn-primary !text-[10px] !py-1"
                      onClick={() => setThankTarget({ id: s.supporterUserId, name: s.displayName })}
                    >
                      Thank
                    </button>
                    <Link
                      to={networkProfilePath(s.handle)}
                      className="ios-btn ios-btn-ghost !text-[10px] !py-1"
                    >
                      Profile
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="afn-bottom">
        <section className="afn-panel afn-feed">
          <h3 className="afn-panel-title">Fan Activity Feed</h3>
          {loading ? (
            <EmptyPanel message="Loading…" />
          ) : recent.length === 0 ? (
            <EmptyPanel message="Nothing recent — supporter actions on the network will show here." />
          ) : (
            <ul className="afn-activity-list">
              {recent.slice(0, 8).map((a, i) => (
                <li key={`${a.supporterUserId}-${a.createdAt}-${i}`} className="afn-activity-row">
                  <span className="afn-activity-icon">{ACTION_ICON[a.actionType] ?? '•'}</span>
                  <p className="afn-activity-text">
                    <strong>@{a.handle || a.displayName.replace(/\s/g, '_')}</strong>{' '}
                    {ACTION_LABEL[a.actionType] ?? a.actionType}
                  </p>
                  <time className="afn-activity-time">{formatRelativeTime(a.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="afn-panel afn-map-panel">
          <h3 className="afn-panel-title">Fandom Network</h3>
          <FandomMap
            centerLabel={artistInitials(user?.name ?? 'You')}
            supporters={supporters}
            drivers={drivers}
          />
          <ul className="afn-map-legend">
            <li><span className="afn-legend-dot afn-legend-dot--tribe" /> Amplifiers</li>
            <li><span className="afn-legend-dot afn-legend-dot--super" /> Top supporters</li>
            <li><span className="afn-legend-dot afn-legend-dot--active" /> You</li>
          </ul>
        </section>

        <section className="afn-panel afn-insights">
          <h3 className="afn-panel-title">Insights</h3>
          {loading ? (
            <EmptyPanel message="Loading…" />
          ) : (
            <>
              <article className="afn-insight-card afn-insight-card--release">
                <div className="afn-release-art" aria-hidden />
                <div>
                  <p className="afn-insight-kicker">Engagement mix</p>
                  <p className="afn-insight-title">
                    {totals.spins} spins · {totals.drops} drops
                  </p>
                  <p className="afn-insight-meta">
                    {totals.reactions} reactions · {totals.comments} comments · {totals.shares} shares
                  </p>
                  <Sparkline variant="soft" />
                </div>
              </article>
              <article className="afn-insight-card afn-insight-card--event">
                <div className="afn-event-date" aria-hidden>
                  <span className="afn-event-month">{supporters.length > 0 ? 'TOP' : '—'}</span>
                  <span className="afn-event-day">{supporters[0]?.supporterRank ?? '—'}</span>
                </div>
                <div>
                  <p className="afn-insight-kicker">Leading supporter</p>
                  <p className="afn-insight-title">
                    {supporters[0]?.displayName ?? 'No supporters yet'}
                  </p>
                  <p className="afn-insight-meta">
                    {supporters[0]
                      ? `${supporters[0].supportScore.toLocaleString()} support score`
                      : 'Share your page on the network feed'}
                  </p>
                </div>
              </article>
              <article className="afn-insight-card afn-insight-card--row">
                <div>
                  <p className="afn-insight-kicker">Recognition sent</p>
                  <p className="afn-insight-title">{sentRecognitions.length}</p>
                </div>
                <div>
                  <p className="afn-insight-kicker">Champions</p>
                  <p className="afn-insight-title">{champions.length}</p>
                </div>
              </article>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
