import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Heart,
  Images,
  MessageCircle,
  Minus,
  Palette,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import { getIllustratorAnalyticsDashboard } from '@/modules/illustrator/api/illustrator.api'
import {
  buildSparklinePath,
  computeIllustratorPeriodDelta,
  deltaClass,
  filterIllustratorTrendByDays,
  formatDelta,
  formatIllustratorCount,
  type DashboardAccent,
} from '@/modules/illustrator/lib/illustrator-dashboard-utils'
import { DashboardLineChart } from '@/modules/music/components/artist-dashboard/dashboard-line-chart'
import { Loader } from '@/shared/components/feedback/loader'
import { DashboardPanel } from '@/shared/components/layout'
import '@/modules/music/styles/artist-dashboard-home.css'

type MetricKind = 'reactions' | 'comments' | 'portfolio' | 'engagers'

type MetricCardProps = {
  accent: DashboardAccent
  icon: ReactNode
  label: string
  value: string
  delta: number | null
  sparkline: number[]
  onOpen: () => void
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

function MetricCard({ accent, icon, label, value, delta, sparkline, onOpen }: MetricCardProps) {
  const trendClass = deltaClass(delta)
  const TrendIcon = trendClass === 'is-up' ? ArrowUp : trendClass === 'is-down' ? ArrowDown : Minus

  return (
    <button
      type="button"
      className="ios-artist-dashboard__metric ios-artist-dashboard__metric--clickable"
      data-accent={accent}
      onClick={onOpen}
      aria-label={`View detailed ${label}`}
    >
      <div className="ios-artist-dashboard__metric-head">
        <span className="ios-artist-dashboard__metric-icon">{icon}</span>
        <span className="ios-artist-dashboard__metric-label">{label}</span>
      </div>
      <p className="ios-artist-dashboard__metric-value">{value}</p>
      <p className={`ios-artist-dashboard__metric-delta ${trendClass}`}>
        <TrendIcon size={14} aria-hidden />
        {formatDelta(delta)}
      </p>
      <p className="ios-artist-dashboard__metric-sub">vs last 30 days</p>
      <MetricSparkline values={sparkline} />
    </button>
  )
}

export function IllustratorDashboardHome() {
  const [activeMetric, setActiveMetric] = useState<MetricKind | null>(null)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['illustrator-analytics'],
    queryFn: getIllustratorAnalyticsDashboard,
  })

  const trend30 = useMemo(
    () => filterIllustratorTrendByDays(analytics?.trend ?? [], 30),
    [analytics?.trend],
  )

  const reactionSparkline = useMemo(() => trend30.map((p) => p.reactions), [trend30])
  const commentSparkline = useMemo(() => trend30.map((p) => p.comments), [trend30])
  const postSparkline = useMemo(() => trend30.map((p) => p.posts), [trend30])

  const reactionsDelta = useMemo(
    () => computeIllustratorPeriodDelta(analytics?.trend ?? [], 15, (p) => p.reactions),
    [analytics?.trend],
  )
  const commentsDelta = useMemo(
    () => computeIllustratorPeriodDelta(analytics?.trend ?? [], 15, (p) => p.comments),
    [analytics?.trend],
  )
  const postsDelta = useMemo(
    () => computeIllustratorPeriodDelta(analytics?.trend ?? [], 15, (p) => p.posts),
    [analytics?.trend],
  )

  const latestArtwork = analytics?.artworks[0] ?? null

  const chartPoints = useMemo(
    () =>
      trend30.map((p) => ({
        date: p.date,
        qualifiedPlays: p.reactions,
        totalListenSec: 0,
        sessions: p.comments,
        completions: p.posts,
        skips: 0,
        likes: 0,
      })),
    [trend30],
  )

  if (isLoading) return <Loader />

  const overview = analytics?.overview

  const metricCards: Array<{
    kind: MetricKind
    accent: DashboardAccent
    icon: ReactNode
    label: string
    value: string
    delta: number | null
    sparkline: number[]
  }> = [
    {
      kind: 'reactions',
      accent: 'primary',
      icon: <Heart size={16} aria-hidden />,
      label: 'Total Reactions',
      value: formatIllustratorCount(overview?.totalReactions ?? 0),
      delta: reactionsDelta,
      sparkline: reactionSparkline,
    },
    {
      kind: 'comments',
      accent: 'success',
      icon: <MessageCircle size={16} aria-hidden />,
      label: 'Comments',
      value: formatIllustratorCount(overview?.totalComments ?? 0),
      delta: commentsDelta,
      sparkline: commentSparkline,
    },
    {
      kind: 'portfolio',
      accent: 'info',
      icon: <Images size={16} aria-hidden />,
      label: 'Canvas Pieces',
      value: formatIllustratorCount(overview?.portfolioCount ?? 0),
      delta: postsDelta,
      sparkline: postSparkline,
    },
    {
      kind: 'engagers',
      accent: 'warning',
      icon: <Users size={16} aria-hidden />,
      label: 'Unique Engagers',
      value: formatIllustratorCount(overview?.uniqueEngagers ?? 0),
      delta: null,
      sparkline: reactionSparkline,
    },
  ]

  const activeMetricCard = metricCards.find((card) => card.kind === activeMetric) ?? null

  return (
    <div className="ios-artist-dashboard">
      <div className="ios-artist-dashboard__header">
        <Link to="/home" className="ios-artist-dashboard__upload-btn">
          <Upload size={16} aria-hidden />
          Share Artwork
        </Link>
      </div>

      <div className="ios-artist-dashboard__layout">
        <div className="ios-artist-dashboard__main">
          <section className="ios-artist-dashboard__metrics" aria-label="Key metrics">
            {metricCards.map((card) => (
              <MetricCard
                key={card.kind}
                accent={card.accent}
                icon={card.icon}
                label={card.label}
                value={card.value}
                delta={card.delta}
                sparkline={card.sparkline}
                onOpen={() => setActiveMetric(card.kind)}
              />
            ))}
          </section>

          <DashboardPanel aria-labelledby="latest-artwork-heading">
            <div className="ios-artist-dashboard__panel-head">
              <h2 id="latest-artwork-heading" className="ios-artist-dashboard__panel-title">
                Latest Artwork Performance
              </h2>
            </div>

            {latestArtwork ? (
              <div className="ios-artist-dashboard__release">
                <div className="ios-artist-dashboard__release-art">
                  {latestArtwork.imageUrl ? (
                    <img src={latestArtwork.imageUrl} alt="" />
                  ) : (
                    <span className="ios-artist-dashboard__release-art-fallback">
                      <Palette size={28} aria-hidden />
                    </span>
                  )}
                </div>
                <div className="ios-artist-dashboard__release-body">
                  <div>
                    <h3 className="ios-artist-dashboard__release-title">
                      {latestArtwork.title || 'Untitled artwork'}
                    </h3>
                    <p className="ios-artist-dashboard__release-meta">
                      {formatIllustratorCount(latestArtwork.reactionTotal)} reactions ·{' '}
                      {formatIllustratorCount(latestArtwork.commentCount)} comments
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="ios-artist-dashboard__empty-copy">
                No portfolio artwork yet.{' '}
                <Link to="/home" className="ios-artist-dashboard__link">
                  Share an image post
                </Link>{' '}
                to start tracking engagement.
              </p>
            )}
          </DashboardPanel>

          <DashboardPanel aria-labelledby="reactions-chart-heading">
            <div className="ios-artist-dashboard__panel-head">
              <h2 id="reactions-chart-heading" className="ios-artist-dashboard__panel-title">
                Reactions Overview
              </h2>
              <Link to="/illustrator/analytics" className="ios-artist-dashboard__link">
                Full analytics
              </Link>
            </div>
            <DashboardLineChart
              points={chartPoints}
              emptyMessage="Publish artwork posts to see reaction trends."
              ariaLabel="Artwork reactions chart"
              className="ios-artist-dashboard__chart-wrap"
              width={600}
              height={200}
            />
          </DashboardPanel>

          <section className="ios-artist-dashboard__actions" aria-label="Quick actions">
            <Link to="/home" className="ios-artist-dashboard__action" data-accent="primary">
              <Upload size={18} aria-hidden />
              <span>Share artwork</span>
            </Link>
            <Link to="/illustrator/canvas" className="ios-artist-dashboard__action" data-accent="info">
              <Images size={18} aria-hidden />
              <span>Canvas</span>
            </Link>
            <Link to="/illustrator/analytics" className="ios-artist-dashboard__action" data-accent="success">
              <BarChart3 size={18} aria-hidden />
              <span>Artwork analytics</span>
            </Link>
            <Link to="/profile" className="ios-artist-dashboard__action" data-accent="warning">
              <TrendingUp size={18} aria-hidden />
              <span>Public profile</span>
            </Link>
          </section>
        </div>

        <aside className="ios-artist-dashboard__aside" aria-label="Studio sidebar">
          <section className="ios-artist-dashboard__aside-panel">
            <h2 className="ios-artist-dashboard__aside-title">Top engagers</h2>
            {analytics?.topEngagers.length ? (
              <ul className="ios-artist-dashboard__supporters">
                {analytics.topEngagers.map((engager) => (
                  <li key={engager.userId}>
                    <Link to={engager.profileHref} className="ios-artist-dashboard__supporter">
                      {engager.avatarUrl ? (
                        <img src={engager.avatarUrl} alt="" className="ios-artist-dashboard__supporter-avatar" />
                      ) : (
                        <span className="ios-artist-dashboard__supporter-avatar ios-artist-dashboard__supporter-avatar--fallback">
                          {engager.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="ios-artist-dashboard__supporter-body">
                        <span className="ios-artist-dashboard__supporter-name">{engager.name}</span>
                        <span className="ios-artist-dashboard__supporter-meta">
                          {engager.reactionCount} reactions
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ios-artist-dashboard__aside-empty">Engagement will appear as fans react to your art.</p>
            )}
          </section>
        </aside>
      </div>

      {activeMetricCard ? (
        <div
          className="ios-artist-dashboard__metric-modal-backdrop"
          role="presentation"
          onClick={() => setActiveMetric(null)}
        >
          <div
            className="ios-artist-dashboard__metric-modal"
            role="dialog"
            aria-modal="true"
            aria-label={activeMetricCard.label}
            onClick={(e) => e.stopPropagation()}
            style={{ '--ios-artist-dashboard-accent': `var(--ios-dashboard-${activeMetricCard.accent})` } as CSSProperties}
          >
            <h3>{activeMetricCard.label}</h3>
            <p className="ios-artist-dashboard__metric-modal-value">{activeMetricCard.value}</p>
            <p className="ios-artist-dashboard__metric-modal-copy">
              Track artwork reactions, comments, and portfolio growth from your image posts on the feed.
            </p>
            <Link to="/illustrator/analytics" className="ios-artist-dashboard__link" onClick={() => setActiveMetric(null)}>
              Open full analytics
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
