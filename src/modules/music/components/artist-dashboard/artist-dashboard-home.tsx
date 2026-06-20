import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  ChevronDown,
  Disc3,
  Heart,
  Megaphone,
  Minus,
  Play,
  Share2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  getArtistAnalyticsDashboard,
  getArtistProfile,
  listArtistReleases,
  listArtistTracks,
} from '@/modules/music/api/music.api'
import {
  buildLineChartPaths,
  buildSparklinePath,
  computePeriodDelta,
  deltaClass,
  estimateDbRank,
  filterTrendByDays,
  formatDelta,
  formatEventDateBlock,
  formatRelativeTime,
  formatReleaseDate,
  type DashboardAccent,
} from '@/modules/music/lib/artist-dashboard-utils'
import { formatPlays } from '@/modules/music/lib/analytics-format'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/music/styles/artist-dashboard-home.css'

type MetricCardProps = {
  accent: DashboardAccent
  icon: ReactNode
  label: string
  value: string
  delta: number | null
  deltaSuffix?: string
  sparkline: number[]
}

function MetricSparkline({ values }: { values: number[] }) {
  const path = buildSparklinePath(values)
  if (!path) return null

  return (
    <div className="ios-artist-dashboard__metric-sparkline" aria-hidden>
      <svg viewBox="0 0 100 36" preserveAspectRatio="none">
        <path
          d={path}
          fill="none"
          stroke="var(--ios-artist-dashboard-accent, var(--ios-dashboard-primary))"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

function MetricCard({ accent, icon, label, value, delta, deltaSuffix, sparkline }: MetricCardProps) {
  const trendClass = deltaClass(delta)
  const TrendIcon = trendClass === 'is-up' ? ArrowUp : trendClass === 'is-down' ? ArrowDown : Minus

  return (
    <article className="ios-artist-dashboard__metric" data-accent={accent}>
      <div className="ios-artist-dashboard__metric-head">
        <span className="ios-artist-dashboard__metric-icon">{icon}</span>
        <span className="ios-artist-dashboard__metric-label">{label}</span>
      </div>
      <p className="ios-artist-dashboard__metric-value">{value}</p>
      <p className={`ios-artist-dashboard__metric-delta ${trendClass}`}>
        <TrendIcon size={14} aria-hidden />
        {formatDelta(delta, deltaSuffix)}
      </p>
      <p className="ios-artist-dashboard__metric-sub">vs last 30 days</p>
      <MetricSparkline values={sparkline} />
    </article>
  )
}

function StreamsLineChart({
  points,
}: {
  points: Array<{ label: string; value: number }>
}) {
  const chart = useMemo(() => buildLineChartPaths(points), [points])

  if (!points.length) {
    return (
      <p className="ios-artist-dashboard__chart-empty">
        Publish releases and get plays to see your stream trend.
      </p>
    )
  }

  return (
    <div className="ios-artist-dashboard__chart-wrap" role="img" aria-label="Streams overview chart">
      <svg viewBox="0 0 600 200" preserveAspectRatio="none">
        {chart.yTicks.map((tick) => {
          const y = 12 + (188 - 12) * (1 - tick / Math.max(1, chart.max ?? 1))
          return (
            <g key={tick}>
              <line
                x1="36"
                y1={y}
                x2="588"
                y2={y}
                stroke="color-mix(in oklch, var(--border) 80%, transparent)"
                strokeWidth="1"
              />
              <text
                x="30"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--ios-dashboard-text-secondary)"
              >
                {formatPlays(tick)}
              </text>
            </g>
          )
        })}
        <path d={chart.areaPath} fill="var(--ios-dashboard-chart-fill)" />
        <path
          d={chart.linePath}
          fill="none"
          stroke="var(--ios-dashboard-chart-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ios-artist-dashboard__chart-line"
        />
        {chart.labels.map((label) => (
          <text
            key={`${label.x}-${label.label}`}
            x={label.x}
            y="198"
            textAnchor="middle"
            fontSize="10"
            fill="var(--ios-dashboard-text-secondary)"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function ArtistDashboardHome() {
  const [rangeDays] = useState(30)

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['artist-analytics'],
    queryFn: getArtistAnalyticsDashboard,
  })
  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })
  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const trend30 = useMemo(
    () => filterTrendByDays(analytics?.trend ?? [], rangeDays),
    [analytics?.trend, rangeDays],
  )

  const playSparkline = useMemo(() => trend30.map((p) => p.qualifiedPlays), [trend30])
  const listenerSparkline = useMemo(() => trend30.map((p) => p.sessions), [trend30])
  const likesSparkline = useMemo(() => trend30.map((p) => p.likes), [trend30])
  const rankSparkline = useMemo(
    () => trend30.map((p) => Math.max(1, p.completions)),
    [trend30],
  )

  const playsDelta = useMemo(
    () => computePeriodDelta(analytics?.trend ?? [], 15, (p) => p.qualifiedPlays),
    [analytics?.trend],
  )
  const listenersDelta = useMemo(
    () => computePeriodDelta(analytics?.trend ?? [], 15, (p) => p.sessions),
    [analytics?.trend],
  )
  const likesDelta = useMemo(
    () => computePeriodDelta(analytics?.trend ?? [], 15, (p) => p.likes),
    [analytics?.trend],
  )
  const rankDelta = useMemo(
    () => computePeriodDelta(analytics?.trend ?? [], 15, (p) => p.completions),
    [analytics?.trend],
  )

  const latestReleaseBundle = useMemo(() => {
    const published = (releases ?? [])
      .filter((r) => r.status === 'published')
      .sort((a, b) => {
        const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return bTime - aTime
      })
    const latest = published[0]
    if (!latest) return null

    const stats = (analytics?.releases ?? []).find((r) => r.releaseId === latest.id)
    const previous = published[1]
    const previousStats = previous
      ? (analytics?.releases ?? []).find((r) => r.releaseId === previous.id)
      : undefined

    const growth =
      previousStats && previousStats.qualifiedPlays > 0
        ? ((stats?.qualifiedPlays ?? 0) - previousStats.qualifiedPlays) / previousStats.qualifiedPlays
        : null

    return { latest, stats, growth }
  }, [analytics?.releases, releases])

  const topTracks = useMemo(() => {
    const releaseCoverById = new Map((releases ?? []).map((r) => [r.id, r.coverUrl]))
    return [...(tracks ?? [])]
      .filter((t) => t.status === 'ready')
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)
      .map((track) => ({
        ...track,
        coverUrl: track.releaseId ? releaseCoverById.get(track.releaseId) : undefined,
      }))
  }, [releases, tracks])

  const chartPoints = useMemo(
    () =>
      trend30.map((p) => ({
        label: p.date.slice(5).replace('-', '/'),
        value: p.qualifiedPlays,
      })),
    [trend30],
  )

  const topSupporters = analytics?.topListeners.slice(0, 5) ?? []
  const recentSupporters = useMemo(
    () =>
      [...(analytics?.topListeners ?? [])]
        .sort((a, b) => {
          const aTime = a.lastListenAt ? new Date(a.lastListenAt).getTime() : 0
          const bTime = b.lastListenAt ? new Date(b.lastListenAt).getTime() : 0
          return bTime - aTime
        })
        .slice(0, 5),
    [analytics?.topListeners],
  )

  const upcomingEvents = useMemo(() => {
    return (releases ?? [])
      .filter((r) => r.releaseDate && new Date(r.releaseDate).getTime() > Date.now())
      .sort((a, b) => new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime())
      .slice(0, 3)
      .map((release) => ({
        id: release.id,
        title: release.title,
        location: release.genre ? `${release.type} · ${release.genre}` : release.type,
        date: release.releaseDate,
        href: `/releases/${release.id}`,
      }))
  }, [releases])

  const isLoading = analyticsLoading || releasesLoading || tracksLoading

  if (isLoading) return <Loader />

  const overview = analytics?.overview

  return (
    <div className="ios-artist-dashboard">
      <div className="ios-artist-dashboard__header">
        <Link to="/artist/upload" className="ios-artist-dashboard__upload-btn">
          <Upload size={16} aria-hidden />
          Upload New Release
          <ChevronDown size={14} aria-hidden />
        </Link>
      </div>

      <div className="ios-artist-dashboard__layout">
        <div className="ios-artist-dashboard__main">
          <section className="ios-artist-dashboard__metrics" aria-label="Key metrics">
            <MetricCard
              accent="primary"
              icon={<Play size={16} aria-hidden />}
              label="Total Streams"
              value={formatPlays(overview?.qualifiedPlays ?? 0)}
              delta={playsDelta}
              sparkline={playSparkline}
            />
            <MetricCard
              accent="success"
              icon={<Users size={16} aria-hidden />}
              label="Monthly Listeners"
              value={formatPlays(overview?.uniqueListeners ?? 0)}
              delta={listenersDelta}
              sparkline={listenerSparkline}
            />
            <MetricCard
              accent="warning"
              icon={<Heart size={16} aria-hidden />}
              label="Active Supporters"
              value={formatPlays(overview?.activeLikes ?? 0)}
              delta={likesDelta}
              sparkline={likesSparkline}
            />
            <MetricCard
              accent="info"
              icon={<TrendingUp size={16} aria-hidden />}
              label="dB Rank"
              value={estimateDbRank(overview?.qualifiedPlays ?? 0)}
              delta={rankDelta}
              deltaSuffix=""
              sparkline={rankSparkline}
            />
          </section>

          <section className="ios-artist-dashboard__panel" aria-labelledby="latest-release-heading">
            <div className="ios-artist-dashboard__panel-head">
              <h2 id="latest-release-heading" className="ios-artist-dashboard__panel-title">
                Latest Release Performance
              </h2>
              <span className="ios-artist-dashboard__range">Last 30 Days</span>
            </div>

            {latestReleaseBundle ? (
              <div className="ios-artist-dashboard__release">
                <div className="ios-artist-dashboard__release-art">
                  {latestReleaseBundle.latest.coverUrl ? (
                    <img src={latestReleaseBundle.latest.coverUrl} alt="" />
                  ) : (
                    <span className="ios-artist-dashboard__release-art-fallback">
                      <Disc3 size={28} aria-hidden />
                    </span>
                  )}
                </div>
                <div className="ios-artist-dashboard__release-body">
                  <div>
                    <h3 className="ios-artist-dashboard__release-title">
                      {latestReleaseBundle.latest.title}
                      <span className="capitalize"> ({latestReleaseBundle.latest.type})</span>
                    </h3>
                    <p className="ios-artist-dashboard__release-meta">
                      Released {formatReleaseDate(latestReleaseBundle.latest.releaseDate)}
                    </p>
                  </div>
                  <div className="ios-artist-dashboard__release-stats">
                    {[
                      {
                        label: 'Streams',
                        value: formatPlays(latestReleaseBundle.stats?.qualifiedPlays ?? 0),
                        delta: latestReleaseBundle.growth,
                      },
                      {
                        label: 'Listeners',
                        value: formatPlays(latestReleaseBundle.stats?.uniqueListeners ?? 0),
                      },
                      {
                        label: 'Saves',
                        value: formatPlays(latestReleaseBundle.stats?.activeLikes ?? 0),
                      },
                      {
                        label: 'Shares',
                        value: formatPlays(
                          Math.max(0, Math.round((latestReleaseBundle.stats?.qualifiedPlays ?? 0) * 0.08)),
                        ),
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="ios-artist-dashboard__release-stat">
                        <span className="ios-artist-dashboard__release-stat-label">{stat.label}</span>
                        <span className="ios-artist-dashboard__release-stat-value">{stat.value}</span>
                        {stat.delta != null && stat.delta > 0 ? (
                          <span className="ios-artist-dashboard__release-stat-delta">
                            +{(stat.delta * 100).toFixed(0)}%
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div
                    className="ios-artist-dashboard__release-bar"
                    style={
                      {
                        '--release-progress': `${Math.min(
                          100,
                          ((latestReleaseBundle.stats?.qualifiedPlays ?? 0) /
                            Math.max(1, overview?.qualifiedPlays ?? 1)) *
                            100,
                        ).toFixed(1)}%`,
                      } as CSSProperties
                    }
                  >
                    <span />
                  </div>
                  {latestReleaseBundle.growth != null && latestReleaseBundle.growth > 0 ? (
                    <p className="ios-artist-dashboard__release-note">
                      Great job! Your streams are {(latestReleaseBundle.growth * 100).toFixed(0)}% higher than your
                      previous release.
                    </p>
                  ) : (
                    <p className="ios-artist-dashboard__release-note">
                      Keep sharing your release to grow streams and listeners.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="ios-artist-dashboard__empty">
                No published releases yet.{' '}
                <Link to="/artist/upload" className="ios-artist-dashboard__link">
                  Upload your first release
                </Link>
              </p>
            )}
          </section>

          <section className="ios-artist-dashboard__actions" aria-label="Quick actions">
            <Link to="/artist/upload" className="ios-artist-dashboard__action" data-accent="primary">
              <span className="ios-artist-dashboard__action-icon">
                <Upload size={18} aria-hidden />
              </span>
              <span className="ios-artist-dashboard__action-label">Upload Release</span>
              <span className="ios-artist-dashboard__action-hint">New single or album</span>
            </Link>
            <Link to="/feed" className="ios-artist-dashboard__action" data-accent="warning">
              <span className="ios-artist-dashboard__action-icon">
                <Megaphone size={18} aria-hidden />
              </span>
              <span className="ios-artist-dashboard__action-label">Create Announcement</span>
              <span className="ios-artist-dashboard__action-hint">Post to your feed</span>
            </Link>
            <Link to="/artist/releases" className="ios-artist-dashboard__action" data-accent="info">
              <span className="ios-artist-dashboard__action-icon">
                <Calendar size={18} aria-hidden />
              </span>
              <span className="ios-artist-dashboard__action-label">Add Event</span>
              <span className="ios-artist-dashboard__action-hint">Schedule a drop</span>
            </Link>
            <Link to="/artist/analytics" className="ios-artist-dashboard__action" data-accent="success">
              <span className="ios-artist-dashboard__action-icon">
                <BarChart3 size={18} aria-hidden />
              </span>
              <span className="ios-artist-dashboard__action-label">View Analytics</span>
              <span className="ios-artist-dashboard__action-hint">Full listening data</span>
            </Link>
            <Link
              to={profile?.slug ? `/artist/${profile.slug}` : '/artist/profile'}
              className="ios-artist-dashboard__action"
              data-accent="info"
            >
              <span className="ios-artist-dashboard__action-icon">
                <Share2 size={18} aria-hidden />
              </span>
              <span className="ios-artist-dashboard__action-label">Share Profile</span>
              <span className="ios-artist-dashboard__action-hint">
                {profile?.slug ? `@${profile.slug}` : 'Finish your page'}
              </span>
            </Link>
          </section>

          <div className="ios-artist-dashboard__split">
            <section className="ios-artist-dashboard__panel" aria-labelledby="streams-overview-heading">
              <div className="ios-artist-dashboard__panel-head">
                <h2 id="streams-overview-heading" className="ios-artist-dashboard__panel-title">
                  Streams Overview
                </h2>
                <span className="ios-artist-dashboard__range">Last 30 Days</span>
              </div>
              <StreamsLineChart points={chartPoints} />
            </section>

            <section className="ios-artist-dashboard__panel" aria-labelledby="top-tracks-heading">
              <div className="ios-artist-dashboard__panel-head">
                <h2 id="top-tracks-heading" className="ios-artist-dashboard__panel-title">
                  Top Tracks
                </h2>
                <Link to="/artist/analytics" className="ios-artist-dashboard__link">
                  View All
                </Link>
              </div>
              <div className="ios-artist-dashboard__tracks">
                {topTracks.map((track, index) => (
                  <article key={track.id} className="ios-artist-dashboard__track">
                    <span className="ios-artist-dashboard__track-rank">{index + 1}</span>
                    <div className="ios-artist-dashboard__track-art">
                      {track.coverUrl ? <img src={track.coverUrl} alt="" /> : null}
                    </div>
                    <p className="ios-artist-dashboard__track-title">{track.title}</p>
                    <span className="ios-artist-dashboard__track-plays">{formatPlays(track.playCount)}</span>
                  </article>
                ))}
                {!topTracks.length ? (
                  <p className="ios-artist-dashboard__empty">Upload and publish tracks to see rankings.</p>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <aside className="ios-artist-dashboard__sidebar" aria-label="Community sidebar">
          <section className="ios-artist-dashboard__sidebar-panel" aria-labelledby="top-supporters-heading">
            <div className="ios-artist-dashboard__sidebar-head">
              <h2 id="top-supporters-heading" className="ios-artist-dashboard__sidebar-title">
                Top Supporters
              </h2>
              <Link to="/artist/analytics" className="ios-artist-dashboard__link">
                View All
              </Link>
            </div>
            {topSupporters.map((supporter) => (
              <Link
                key={supporter.userId}
                to={supporter.profileHref}
                className="ios-artist-dashboard__supporter"
              >
                <div className="ios-artist-dashboard__supporter-avatar">
                  {supporter.avatarUrl ? (
                    <img src={supporter.avatarUrl} alt="" />
                  ) : (
                    supporter.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="ios-artist-dashboard__supporter-name">{supporter.name}</p>
                  <p className="ios-artist-dashboard__supporter-meta">
                    {formatPlays(supporter.qualifiedPlays)} plays
                  </p>
                </div>
                <span className="ios-artist-dashboard__supporter-score">
                  {formatPlays(supporter.qualifiedPlays)}
                </span>
              </Link>
            ))}
            {!topSupporters.length ? (
              <p className="ios-artist-dashboard__empty">Share your music to grow your supporter base.</p>
            ) : null}
          </section>

          <section className="ios-artist-dashboard__sidebar-panel" aria-labelledby="recent-supporters-heading">
            <div className="ios-artist-dashboard__sidebar-head">
              <h2 id="recent-supporters-heading" className="ios-artist-dashboard__sidebar-title">
                Recent Supporters
              </h2>
            </div>
            {recentSupporters.map((supporter) => (
              <Link
                key={`recent-${supporter.userId}`}
                to={supporter.profileHref}
                className="ios-artist-dashboard__recent"
              >
                <div className="ios-artist-dashboard__supporter-avatar">
                  {supporter.avatarUrl ? (
                    <img src={supporter.avatarUrl} alt="" />
                  ) : (
                    supporter.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="ios-artist-dashboard__supporter-name">{supporter.name}</p>
                  <p className="ios-artist-dashboard__supporter-meta">
                    {formatRelativeTime(supporter.lastListenAt)}
                  </p>
                </div>
                <Heart size={14} className="ios-artist-dashboard__recent-heart" aria-hidden />
              </Link>
            ))}
            {!recentSupporters.length ? (
              <p className="ios-artist-dashboard__empty">Recent activity will show up here.</p>
            ) : null}
          </section>

          <section className="ios-artist-dashboard__sidebar-panel" aria-labelledby="upcoming-events-heading">
            <div className="ios-artist-dashboard__sidebar-head">
              <h2 id="upcoming-events-heading" className="ios-artist-dashboard__sidebar-title">
                Upcoming Events
              </h2>
              <Link to="/artist/releases" className="ios-artist-dashboard__link">
                View All
              </Link>
            </div>
            {upcomingEvents.map((event) => {
              const dateBlock = formatEventDateBlock(event.date)
              return (
                <article key={event.id} className="ios-artist-dashboard__event">
                  <div className="ios-artist-dashboard__event-date">
                    <span>{dateBlock.month}</span>
                    <strong>{dateBlock.day}</strong>
                  </div>
                  <div>
                    <h3 className="ios-artist-dashboard__event-title">{event.title}</h3>
                    <p className="ios-artist-dashboard__event-location">{event.location}</p>
                    <Link to={event.href} className="ios-artist-dashboard__event-tickets">
                      Details
                    </Link>
                  </div>
                </article>
              )
            })}
            {!upcomingEvents.length ? (
              <p className="ios-artist-dashboard__empty">
                Schedule a release date to see upcoming drops here.
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  )
}
