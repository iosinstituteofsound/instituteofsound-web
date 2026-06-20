import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Minus } from 'lucide-react'
import type { ArtistAnalyticsDashboardDto } from '@/modules/music/types/analytics.types'
import { DashboardLineChart } from '@/modules/music/components/artist-dashboard/dashboard-line-chart'
import {
  computePeriodDelta,
  deltaClass,
  estimateDbRank,
  filterTrendByDays,
  formatDelta,
  formatRelativeTime,
  type DashboardAccent,
} from '@/modules/music/lib/artist-dashboard-utils'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

export type MetricDetailKind = 'streams' | 'listeners' | 'supporters' | 'rank'

type Props = {
  kind: MetricDetailKind | null
  onClose: () => void
  analytics: ArtistAnalyticsDashboardDto
  accent: DashboardAccent
  icon: ReactNode
  label: string
  value: string
  delta: number | null
  deltaSuffix?: string
}

function periodRange(days: number) {
  const toDate = new Date().toISOString().slice(0, 10)
  const from = new Date()
  from.setUTCDate(from.getUTCDate() - days)
  return { fromDate: from.toISOString().slice(0, 10), toDate }
}

function MetricTrendChart({
  points,
  valueKey,
  valueLabel,
}: {
  points: ArtistAnalyticsDashboardDto['trend']
  valueKey: 'qualifiedPlays' | 'sessions' | 'likes' | 'completions'
  valueLabel: string
}) {
  const { fromDate, toDate } = periodRange(30)
  return (
    <DashboardLineChart
      points={points}
      fromDate={fromDate}
      toDate={toDate}
      valueKey={valueKey}
      ariaLabel={`${valueLabel} trend chart`}
    />
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="ios-artist-dashboard__modal-stat">
      <span className="ios-artist-dashboard__modal-stat-label">{label}</span>
      <span className="ios-artist-dashboard__modal-stat-value">{value}</span>
    </div>
  )
}

function TrendBadge({ delta, suffix }: { delta: number | null; suffix?: string }) {
  const trendClass = deltaClass(delta)
  const TrendIcon = trendClass === 'is-up' ? ArrowUp : trendClass === 'is-down' ? ArrowDown : Minus
  return (
    <span className={`ios-artist-dashboard__modal-delta ${trendClass}`}>
      <TrendIcon size={14} aria-hidden />
      {formatDelta(delta, suffix)}
      <span className="ios-artist-dashboard__modal-delta-sub">vs last 30 days</span>
    </span>
  )
}

function DailyBreakdownTable({
  rows,
  valueKey,
  valueLabel,
}: {
  rows: ArtistAnalyticsDashboardDto['trend']
  valueKey: 'qualifiedPlays' | 'sessions' | 'likes' | 'completions'
  valueLabel: string
}) {
  const recent = filterTrendByDays(rows, 30).slice().reverse()

  if (!recent.length) {
    return <p className="ios-artist-dashboard__modal-empty">Daily breakdown will appear once you have activity.</p>
  }

  return (
    <div className="ios-artist-dashboard__modal-table-wrap">
      <table className="ios-artist-dashboard__modal-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{valueLabel}</th>
            <th scope="col">Listen time</th>
            <th scope="col">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((row) => (
            <tr key={row.date}>
              <td>{row.date}</td>
              <td>{formatPlays(row[valueKey])}</td>
              <td>{formatListenTime(row.totalListenSec)}</td>
              <td>{formatPlays(row.sessions)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReleaseBreakdown({
  releases,
  valueKey,
  valueLabel,
}: {
  releases: ArtistAnalyticsDashboardDto['releases']
  valueKey: 'qualifiedPlays' | 'uniqueListeners' | 'activeLikes'
  valueLabel: string
}) {
  const sorted = [...releases].sort((a, b) => b[valueKey] - a[valueKey])

  if (!sorted.length) {
    return <p className="ios-artist-dashboard__modal-empty">Publish releases to see a breakdown here.</p>
  }

  const max = Math.max(1, ...sorted.map((r) => r[valueKey]))

  return (
    <ul className="ios-artist-dashboard__modal-list">
      {sorted.map((release) => (
        <li key={release.releaseId} className="ios-artist-dashboard__modal-list-item">
          <div className="ios-artist-dashboard__modal-list-main">
            <p className="ios-artist-dashboard__modal-list-title">{release.title}</p>
            <p className="ios-artist-dashboard__modal-list-meta capitalize">{release.type}</p>
            <div className="ios-artist-dashboard__modal-list-bar">
              <span
                style={
                  { '--modal-bar-width': `${(release[valueKey] / max) * 100}%` } as CSSProperties
                }
              />
            </div>
          </div>
          <div className="ios-artist-dashboard__modal-list-stats">
            <span>{formatPlays(release[valueKey])} {valueLabel.toLowerCase()}</span>
            <span>{formatListenTime(release.totalListenSec)}</span>
            <span>{formatPercent(release.completionRate)} completion</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ListenerRows({ listeners }: { listeners: ArtistAnalyticsDashboardDto['topListeners'] }) {
  if (!listeners.length) {
    return <p className="ios-artist-dashboard__modal-empty">No listeners yet — share your releases to grow.</p>
  }

  return (
    <ul className="ios-artist-dashboard__modal-list">
      {listeners.map((listener) => (
        <li key={listener.userId} className="ios-artist-dashboard__modal-list-item ios-artist-dashboard__modal-list-item--row">
          <div className="ios-artist-dashboard__supporter-avatar">
            {listener.avatarUrl ? (
              <img src={listener.avatarUrl} alt="" />
            ) : (
              listener.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="ios-artist-dashboard__modal-list-main">
            <Link to={listener.profileHref} className="ios-artist-dashboard__modal-list-title ios-artist-dashboard__modal-link">
              {listener.name}
            </Link>
            <p className="ios-artist-dashboard__modal-list-meta">
              {formatPlays(listener.qualifiedPlays)} plays · {formatListenTime(listener.totalListenSec)} ·{' '}
              {formatRelativeTime(listener.lastListenAt)}
            </p>
          </div>
          <span className="ios-artist-dashboard__supporter-score">#{listener.rank}</span>
        </li>
      ))}
    </ul>
  )
}

function LocationRows({ locations }: { locations: ArtistAnalyticsDashboardDto['locations'] }) {
  const sorted = [...locations].sort((a, b) => b.uniqueListeners - a.uniqueListeners).slice(0, 12)
  const max = Math.max(1, ...sorted.map((l) => l.uniqueListeners))

  if (!sorted.length) {
    return <p className="ios-artist-dashboard__modal-empty">Location data will appear as listeners join from new markets.</p>
  }

  return (
    <ul className="ios-artist-dashboard__modal-list">
      {sorted.map((loc) => (
        <li key={`${loc.countryCode}-${loc.city ?? ''}`} className="ios-artist-dashboard__modal-list-item">
          <div className="ios-artist-dashboard__modal-list-main">
            <p className="ios-artist-dashboard__modal-list-title">
              {loc.city ? `${loc.city}, ` : ''}
              {loc.countryName ?? loc.countryCode}
            </p>
            <div className="ios-artist-dashboard__modal-list-bar">
              <span
                style={
                  { '--modal-bar-width': `${(loc.uniqueListeners / max) * 100}%` } as CSSProperties
                }
              />
            </div>
          </div>
          <div className="ios-artist-dashboard__modal-list-stats">
            <span>{formatPlays(loc.uniqueListeners)} listeners</span>
            <span>{formatPlays(loc.qualifiedPlays)} streams</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function MetricBody({
  kind,
  analytics,
}: {
  kind: MetricDetailKind
  analytics: ArtistAnalyticsDashboardDto
}) {
  const trend30 = useMemo(() => filterTrendByDays(analytics.trend, 30), [analytics.trend])
  const overview = analytics.overview

  if (kind === 'streams') {
    const last7 = filterTrendByDays(analytics.trend, 7)
    const last7Plays = last7.reduce((sum, p) => sum + p.qualifiedPlays, 0)
    const last30Plays = trend30.reduce((sum, p) => sum + p.qualifiedPlays, 0)

    return (
      <>
        <div className="ios-artist-dashboard__modal-stats">
          <StatTile label="All-time streams" value={formatPlays(overview.qualifiedPlays)} />
          <StatTile label="Last 7 days" value={formatPlays(last7Plays)} />
          <StatTile label="Last 30 days" value={formatPlays(last30Plays)} />
          <StatTile label="Total listen time" value={formatListenTime(overview.totalListenSec)} />
          <StatTile label="Avg listen" value={formatListenTime(overview.averageListenSec)} />
          <StatTile label="Completion rate" value={formatPercent(overview.averageCompletionRate)} />
          <StatTile label="Skip rate" value={formatPercent(overview.skipRate)} />
          <StatTile label="Published releases" value={String(analytics.releases.length)} />
        </div>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Daily streams (30 days)</h3>
          <MetricTrendChart points={trend30} valueKey="qualifiedPlays" valueLabel="Streams" />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">By release</h3>
          <ReleaseBreakdown releases={analytics.releases} valueKey="qualifiedPlays" valueLabel="streams" />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Daily log</h3>
          <DailyBreakdownTable rows={analytics.trend} valueKey="qualifiedPlays" valueLabel="Streams" />
        </section>
      </>
    )
  }

  if (kind === 'listeners') {
    const peakDay = [...trend30].sort((a, b) => b.sessions - a.sessions)[0]

    return (
      <>
        <div className="ios-artist-dashboard__modal-stats">
          <StatTile label="Unique listeners" value={formatPlays(overview.uniqueListeners)} />
          <StatTile label="Unique markets" value={String(overview.uniqueLocations)} />
          <StatTile label="30d sessions" value={formatPlays(trend30.reduce((s, p) => s + p.sessions, 0))} />
          <StatTile label="Avg sessions / day" value={formatPlays(trend30.length ? trend30.reduce((s, p) => s + p.sessions, 0) / trend30.length : 0)} />
          <StatTile label="Peak day" value={peakDay ? peakDay.date : '—'} />
          <StatTile label="Peak sessions" value={formatPlays(peakDay?.sessions ?? 0)} />
          <StatTile label="Top listener plays" value={formatPlays(analytics.topListeners[0]?.qualifiedPlays ?? 0)} />
          <StatTile label="Listener completion" value={formatPercent(overview.averageCompletionRate)} />
        </div>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Session trend (30 days)</h3>
          <MetricTrendChart points={trend30} valueKey="sessions" valueLabel="Sessions" />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Top listeners</h3>
          <ListenerRows listeners={analytics.topListeners} />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Top markets</h3>
          <LocationRows locations={analytics.locations} />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Daily sessions</h3>
          <DailyBreakdownTable rows={analytics.trend} valueKey="sessions" valueLabel="Sessions" />
        </section>
      </>
    )
  }

  if (kind === 'supporters') {
    const totalLikes30 = trend30.reduce((sum, p) => sum + p.likes, 0)

    return (
      <>
        <div className="ios-artist-dashboard__modal-stats">
          <StatTile label="Active supporters" value={formatPlays(overview.activeLikes)} />
          <StatTile label="Likes (30d)" value={formatPlays(totalLikes30)} />
          <StatTile label="Top fan plays" value={formatPlays(analytics.topListeners[0]?.qualifiedPlays ?? 0)} />
          <StatTile label="Top fan listen time" value={formatListenTime(analytics.topListeners[0]?.totalListenSec ?? 0)} />
          <StatTile label="Releases with saves" value={String(analytics.releases.filter((r) => r.activeLikes > 0).length)} />
          <StatTile label="Avg saves / release" value={formatPlays(analytics.releases.length ? overview.activeLikes / analytics.releases.length : 0)} />
          <StatTile label="Completion rate" value={formatPercent(overview.averageCompletionRate)} />
          <StatTile label="Markets reached" value={String(overview.uniqueLocations)} />
        </div>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Support trend (30 days)</h3>
          <MetricTrendChart points={trend30} valueKey="likes" valueLabel="Saves" />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Top supporters</h3>
          <ListenerRows listeners={analytics.topListeners} />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Saves by release</h3>
          <ReleaseBreakdown releases={analytics.releases} valueKey="activeLikes" valueLabel="saves" />
        </section>
        <section className="ios-artist-dashboard__modal-section">
          <h3 className="ios-artist-dashboard__modal-section-title">Daily saves</h3>
          <DailyBreakdownTable rows={analytics.trend} valueKey="likes" valueLabel="Saves" />
        </section>
      </>
    )
  }

  const rankValue = estimateDbRank(overview.qualifiedPlays)
  const rankDelta = computePeriodDelta(analytics.trend, 15, (p) => p.completions)
  const bestRelease = [...analytics.releases].sort((a, b) => b.completionRate - a.completionRate)[0]

  return (
    <>
      <div className="ios-artist-dashboard__modal-stats">
        <StatTile label="Current dB rank" value={rankValue} />
        <StatTile label="Rank momentum" value={formatDelta(rankDelta, '')} />
        <StatTile label="Total streams" value={formatPlays(overview.qualifiedPlays)} />
        <StatTile label="Completion rate" value={formatPercent(overview.averageCompletionRate)} />
        <StatTile label="Skip rate" value={formatPercent(overview.skipRate)} />
        <StatTile label="30d completions" value={formatPlays(trend30.reduce((s, p) => s + p.completions, 0))} />
        <StatTile label="30d skips" value={formatPlays(trend30.reduce((s, p) => s + p.skips, 0))} />
        <StatTile label="Best completion release" value={bestRelease?.title ?? '—'} />
      </div>
      <section className="ios-artist-dashboard__modal-section">
        <h3 className="ios-artist-dashboard__modal-section-title">Completion trend (30 days)</h3>
        <MetricTrendChart points={trend30} valueKey="completions" valueLabel="Completions" />
      </section>
      <section className="ios-artist-dashboard__modal-section">
        <h3 className="ios-artist-dashboard__modal-section-title">Release performance rank</h3>
        <ReleaseBreakdown releases={analytics.releases} valueKey="qualifiedPlays" valueLabel="streams" />
      </section>
      <section className="ios-artist-dashboard__modal-section">
        <h3 className="ios-artist-dashboard__modal-section-title">Daily completions</h3>
        <DailyBreakdownTable rows={analytics.trend} valueKey="completions" valueLabel="Completions" />
      </section>
    </>
  )
}

const METRIC_DESCRIPTIONS: Record<MetricDetailKind, string> = {
  streams: 'Qualified plays, listen time, and release-level stream performance over the last 30 days.',
  listeners: 'Unique listeners, session activity, top fans, and where your audience is listening from.',
  supporters: 'Active saves, fan engagement, and which releases are building the strongest supporter base.',
  rank: 'Your dB rank momentum based on completions, skip rate, and release performance across the catalog.',
}

export function ArtistDashboardMetricModal({
  kind,
  onClose,
  analytics,
  accent,
  icon,
  label,
  value,
  delta,
  deltaSuffix,
}: Props) {
  return (
    <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        elevated
        className="ios-artist-dashboard__modal-content max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:rounded-2xl"
      >
        {kind ? (
          <div className="ios-artist-dashboard__modal" data-accent={accent}>
            <DialogHeader className="ios-artist-dashboard__modal-header">
              <div className="ios-artist-dashboard__modal-hero">
                <span className="ios-artist-dashboard__metric-icon">{icon}</span>
                <div>
                  <DialogTitle className="ios-artist-dashboard__modal-title">{label}</DialogTitle>
                  <DialogDescription className="ios-artist-dashboard__modal-desc">
                    {METRIC_DESCRIPTIONS[kind]}
                  </DialogDescription>
                </div>
              </div>
              <div className="ios-artist-dashboard__modal-hero-stats">
                <p className="ios-artist-dashboard__modal-value">{value}</p>
                <TrendBadge delta={delta} suffix={deltaSuffix} />
              </div>
            </DialogHeader>

            <div className="ios-artist-dashboard__modal-body">
              <MetricBody kind={kind} analytics={analytics} />
            </div>

            <div className="ios-artist-dashboard__modal-footer">
              <Button asChild variant="outline">
                <Link to="/artist/analytics">
                  Open full analytics
                  <ExternalLink size={14} aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
