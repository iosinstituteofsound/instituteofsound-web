import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPin, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getReleaseAnalytics,
  getReleaseAnalyticsTrends,
  toggleTrackLike,
} from '@/modules/music/api/music.api'
import type { ReleaseAnalyticsSummaryDto } from '@/modules/music/types/analytics.types'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import { ReleaseLocationMap } from '@/modules/explore/components/release-location-map'
import { ReleaseListenerCard } from '@/modules/explore/components/release-listener-card'
import '@/modules/explore/styles/release-analytics.css'

type Props = {
  releaseId: string
  primaryTrackId?: string
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="ios-release-analytics__stat">
      <span className="ios-release-analytics__stat-label">{label}</span>
      <span className="ios-release-analytics__stat-value">{value}</span>
    </div>
  )
}

function TrendsChart({
  points,
}: {
  points: Array<{ date: string; qualifiedPlays: number; totalListenSec: number }>
}) {
  const maxPlays = Math.max(1, ...points.map((p) => p.qualifiedPlays))
  return (
    <div className="ios-release-analytics__chart" role="img" aria-label="Daily plays trend">
      {points.map((p) => (
        <div key={p.date} className="ios-release-analytics__chart-bar-wrap">
          <div
            className="ios-release-analytics__chart-bar"
            style={{ height: `${Math.max(4, (p.qualifiedPlays / maxPlays) * 100)}%` }}
            title={`${p.date}: ${p.qualifiedPlays} plays`}
          />
          <span className="ios-release-analytics__chart-label">{p.date.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

function LocationList({ analytics }: { analytics: ReleaseAnalyticsSummaryDto }) {
  const maxPlays = Math.max(1, ...analytics.locations.map((l) => l.qualifiedPlays))
  return (
    <ul className="ios-release-analytics__locations">
      {analytics.locations.slice(0, 8).map((loc) => (
        <li key={`${loc.countryCode}-${loc.city ?? ''}`}>
          <div className="ios-release-analytics__loc-head">
            <MapPin size={14} aria-hidden />
            <span>
              {loc.city ? `${loc.city}, ` : ''}
              {loc.countryName ?? loc.countryCode}
            </span>
            <span>{formatPlays(loc.qualifiedPlays)}</span>
          </div>
          <div className="ios-release-analytics__loc-bar">
            <span style={{ width: `${(loc.qualifiedPlays / maxPlays) * 100}%` }} />
          </div>
        </li>
      ))}
      {!analytics.locations.length ? (
        <li className="ios-release-analytics__empty">No location data yet.</li>
      ) : null}
    </ul>
  )
}

export function ReleaseAnalyticsPanel({ releaseId, primaryTrackId }: Props) {
  const queryClient = useQueryClient()
  const [range, setRange] = useState<'7d' | '30d'>('7d')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['release-analytics', releaseId],
    queryFn: () => getReleaseAnalytics(releaseId),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ releaseId: string }>).detail
      if (detail?.releaseId === releaseId) {
        void queryClient.invalidateQueries({ queryKey: ['release-analytics', releaseId] })
      }
    }
    window.addEventListener('ios:listen-flushed', refresh)
    return () => window.removeEventListener('ios:listen-flushed', refresh)
  }, [queryClient, releaseId])

  const { data: trends } = useQuery({
    queryKey: ['release-analytics-trends', releaseId, range],
    queryFn: () => getReleaseAnalyticsTrends(releaseId, range),
    enabled: Boolean(releaseId),
  })

  const likeMutation = useMutation({
    mutationFn: () => toggleTrackLike(primaryTrackId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['release-analytics', releaseId] })
    },
  })

  if (isLoading || !analytics) return null

  return (
    <section className="ios-release-analytics" aria-label="Release analytics">
      <div className="ios-release-analytics__header">
        <h2 className="ios-mh-kicker">Listening analytics</h2>
        {primaryTrackId ? (
          <button
            type="button"
            className={`ios-release-analytics__like${analytics.userLiked ? ' is-active' : ''}`}
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <Heart size={16} fill={analytics.userLiked ? 'currentColor' : 'none'} />
            {analytics.userLiked ? 'Liked' : 'Like'}
            <span>{formatPlays(analytics.activeLikes)}</span>
          </button>
        ) : null}
      </div>

      <div className="ios-release-analytics__grid">
        <StatCell label="Plays" value={formatPlays(analytics.qualifiedPlays)} />
        <StatCell label="Listen time" value={formatListenTime(analytics.totalListenSec)} />
        <StatCell label="Avg listen" value={formatListenTime(analytics.averageListenSec)} />
        <StatCell label="Completion" value={formatPercent(analytics.completionRate)} />
        <StatCell label="Skip rate" value={formatPercent(analytics.skipRate)} />
        <StatCell label="Likes" value={formatPlays(analytics.activeLikes)} />
        <StatCell label="Listeners" value={formatPlays(analytics.uniqueListeners)} />
        <StatCell label="Locations" value={String(analytics.uniqueLocations)} />
      </div>

      <div className="ios-release-analytics__section">
        <div className="ios-release-analytics__section-head">
          <TrendingUp size={16} aria-hidden />
          <h3>Trends</h3>
          <div className="ios-release-analytics__range">
            <button type="button" className={range === '7d' ? 'is-active' : ''} onClick={() => setRange('7d')}>
              7d
            </button>
            <button type="button" className={range === '30d' ? 'is-active' : ''} onClick={() => setRange('30d')}>
              30d
            </button>
          </div>
        </div>
        {trends?.length ? <TrendsChart points={trends} /> : (
          <p className="ios-release-analytics__empty">Play this release to see trends.</p>
        )}
      </div>

      <div className="ios-release-analytics__section ios-release-analytics__section--map">
        <div className="ios-release-analytics__section-head">
          <MapPin size={16} aria-hidden />
          <h3>Listener map</h3>
        </div>
        <ReleaseLocationMap locations={analytics.locations} />
      </div>

      <div className="ios-release-analytics__split">
        <div className="ios-release-analytics__section">
          <div className="ios-release-analytics__section-head">
            <Users size={16} aria-hidden />
            <h3>Top listeners</h3>
            <Link to={`/releases/${releaseId}/listeners`} className="ios-release-analytics__more">
              More
            </Link>
          </div>
          <div className="ios-release-analytics__listeners">
            {analytics.topListeners.map((l) => (
              <ReleaseListenerCard key={l.userId} listener={l} />
            ))}
            {!analytics.topListeners.length ? (
              <p className="ios-release-analytics__empty">No listeners yet — be the first.</p>
            ) : null}
          </div>
        </div>

        <div className="ios-release-analytics__section">
          <div className="ios-release-analytics__section-head">
            <MapPin size={16} aria-hidden />
            <h3>Locations</h3>
          </div>
          <LocationList analytics={analytics} />
        </div>
      </div>

      <div className="ios-release-analytics__likes-row">
        <Link to={`/releases/${releaseId}/likes`} className="ios-release-analytics__likes-link">
          See who liked ({formatPlays(analytics.activeLikes)})
        </Link>
      </div>
    </section>
  )
}
