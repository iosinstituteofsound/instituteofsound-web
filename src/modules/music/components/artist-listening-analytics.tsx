import { useMemo, useState } from 'react'
import { Disc3, MapPin, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ArtistAnalyticsDashboardDto } from '@/modules/music/types/analytics.types'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import {
  AnalyticsLocationList,
  AnalyticsStatCell,
  AnalyticsTrendsChart,
} from '@/modules/music/components/analytics-dashboard-blocks'
import { ReleaseLocationMap } from '@/modules/explore/components/release-location-map'
import { ReleaseListenerCard } from '@/modules/explore/components/release-listener-card'

type Props = {
  data: ArtistAnalyticsDashboardDto
}

function filterTrend(points: ArtistAnalyticsDashboardDto['trend'], range: '7d' | '30d') {
  const days = range === '7d' ? 7 : 30
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return points.filter((p) => p.date >= cutoffKey)
}

function ReleasePerformanceRow({
  release,
  maxPlays,
}: {
  release: ArtistAnalyticsDashboardDto['releases'][number]
  maxPlays: number
}) {
  const barWidth = maxPlays > 0 ? (release.qualifiedPlays / maxPlays) * 100 : 0
  return (
    <article className="ios-artist-analytics__release-row">
      <div className="ios-artist-analytics__release-main">
        <div className="ios-artist-analytics__release-head">
          <Disc3 size={16} aria-hidden />
          <div>
            <h4>{release.title}</h4>
            <p className="capitalize">{release.type}</p>
          </div>
        </div>
        <div className="ios-artist-analytics__release-bar">
          <span style={{ width: `${barWidth}%` }} />
        </div>
      </div>
      <div className="ios-artist-analytics__release-stats">
        <span>{formatPlays(release.qualifiedPlays)} plays</span>
        <span>{formatListenTime(release.totalListenSec)}</span>
        <span>{formatPercent(release.completionRate)} done</span>
        <span>{formatPlays(release.activeLikes)} likes</span>
      </div>
      <div className="ios-artist-analytics__release-links">
        <Link to={`/releases/${release.releaseId}`}>Release</Link>
        <Link to={`/releases/${release.releaseId}/listeners`}>Listeners</Link>
        <Link to={`/releases/${release.releaseId}/likes`}>Likes</Link>
      </div>
    </article>
  )
}

export function ArtistListeningAnalytics({ data }: Props) {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const trendPoints = useMemo(() => filterTrend(data.trend, range), [data.trend, range])
  const maxReleasePlays = Math.max(1, ...data.releases.map((r) => r.qualifiedPlays))

  return (
    <section className="ios-artist-analytics__panel" aria-label="Artist listening analytics">
      <div className="ios-release-analytics__grid ios-artist-analytics__stats">
        <AnalyticsStatCell label="Plays" value={formatPlays(data.overview.qualifiedPlays)} />
        <AnalyticsStatCell label="Listen time" value={formatListenTime(data.overview.totalListenSec)} />
        <AnalyticsStatCell label="Avg listen" value={formatListenTime(data.overview.averageListenSec)} />
        <AnalyticsStatCell label="Completion" value={formatPercent(data.overview.averageCompletionRate)} />
        <AnalyticsStatCell label="Skip rate" value={formatPercent(data.overview.skipRate)} />
        <AnalyticsStatCell label="Likes" value={formatPlays(data.overview.activeLikes)} />
        <AnalyticsStatCell label="Listeners" value={formatPlays(data.overview.uniqueListeners)} />
        <AnalyticsStatCell label="Locations" value={String(data.overview.uniqueLocations)} />
      </div>

      <div className="ios-artist-analytics__map-trends">
        <div className="ios-release-analytics__section ios-release-analytics__section--map ios-artist-analytics__map">
          <div className="ios-release-analytics__section-head">
            <MapPin size={16} aria-hidden />
            <h3>Listener map</h3>
          </div>
          <ReleaseLocationMap locations={data.locations} height={480} />
        </div>

        <div className="ios-release-analytics__section ios-artist-analytics__trends">
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
          {trendPoints.length ? (
            <AnalyticsTrendsChart points={trendPoints} />
          ) : (
            <p className="ios-release-analytics__empty">Publish releases and get plays to see trends.</p>
          )}
        </div>
      </div>

      <div className="ios-release-analytics__split">
        <div className="ios-release-analytics__section">
          <div className="ios-release-analytics__section-head">
            <Users size={16} aria-hidden />
            <h3>Top listeners</h3>
          </div>
          <div className="ios-release-analytics__listeners">
            {data.topListeners.map((listener) => (
              <ReleaseListenerCard key={listener.userId} listener={listener} />
            ))}
            {!data.topListeners.length ? (
              <p className="ios-release-analytics__empty">No listeners yet — share your releases to grow.</p>
            ) : null}
          </div>
        </div>

        <div className="ios-release-analytics__section">
          <div className="ios-release-analytics__section-head">
            <MapPin size={16} aria-hidden />
            <h3>Locations</h3>
          </div>
          <AnalyticsLocationList locations={data.locations} />
        </div>
      </div>

      <div className="ios-release-analytics__section ios-artist-analytics__releases">
        <div className="ios-release-analytics__section-head">
          <Disc3 size={16} aria-hidden />
          <h3>Release performance</h3>
        </div>
        <div className="ios-artist-analytics__release-list">
          {data.releases.map((release) => (
            <ReleasePerformanceRow key={release.releaseId} release={release} maxPlays={maxReleasePlays} />
          ))}
          {!data.releases.length ? (
            <p className="ios-release-analytics__empty">No published releases with analytics yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
