import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPin, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getReleaseAnalytics,
  getReleaseAnalyticsTrends,
  toggleTrackLike,
} from '@/modules/music/api/music.api'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import {
  AnalyticsLocationList,
  AnalyticsStatCell,
  AnalyticsTrendsChart,
} from '@/modules/music/components/analytics-dashboard-blocks'
import { ReleaseLocationMap } from '@/modules/explore/components/release-location-map'
import { ReleaseListenerCard } from '@/modules/explore/components/release-listener-card'
import { SectionHeader } from '@/shared/components/layout'
import '@/modules/explore/styles/release-analytics.css'

import { useAnalyticsRealtime } from '@/modules/music/hooks/use-analytics-realtime'
import { SegmentedControl } from '@/shared/components/controls'

type Props = {
  releaseId: string
  primaryTrackId?: string
}

export function ReleaseAnalyticsPanel({ releaseId, primaryTrackId }: Props) {
  const queryClient = useQueryClient()
  const [range, setRange] = useState<'7d' | '30d'>('7d')

  useAnalyticsRealtime({ releaseId })

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['release-analytics', releaseId],
    queryFn: () => getReleaseAnalytics(releaseId),
  })

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
      <SectionHeader
        className="ios-release-analytics__header [&_h2]:ios-mh-kicker"
        title="Listening analytics"
        action={
          primaryTrackId ? (
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
          ) : null
        }
      />

      <div className="ios-release-analytics__grid">
        <AnalyticsStatCell label="Plays" value={formatPlays(analytics.qualifiedPlays)} />
        <AnalyticsStatCell label="Listen time" value={formatListenTime(analytics.totalListenSec)} />
        <AnalyticsStatCell label="Avg listen" value={formatListenTime(analytics.averageListenSec)} />
        <AnalyticsStatCell label="Completion" value={formatPercent(analytics.completionRate)} />
        <AnalyticsStatCell label="Skip rate" value={formatPercent(analytics.skipRate)} />
        <AnalyticsStatCell label="Likes" value={formatPlays(analytics.activeLikes)} />
        <AnalyticsStatCell label="Listeners" value={formatPlays(analytics.uniqueListeners)} />
        <AnalyticsStatCell label="Locations" value={String(analytics.uniqueLocations)} />
      </div>

      <div className="ios-release-analytics__section">
        <div className="ios-release-analytics__section-head">
          <TrendingUp size={16} aria-hidden />
          <h3>Trends</h3>
          <SegmentedControl
            value={range}
            options={[
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
            ]}
            onChange={setRange}
            className="ios-release-analytics__range"
            aria-label="Trend range"
          />
        </div>
        {trends?.length ? <AnalyticsTrendsChart points={trends} /> : (
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
          <AnalyticsLocationList locations={analytics.locations} />
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
