import { MapPin } from 'lucide-react'
import type { LocationAggregateDto } from '@/modules/music/types/analytics.types'
import { formatPlays } from '@/modules/music/lib/analytics-format'

export function AnalyticsStatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="ios-release-analytics__stat">
      <span className="ios-release-analytics__stat-label">{label}</span>
      <span className="ios-release-analytics__stat-value">{value}</span>
    </div>
  )
}

export function AnalyticsTrendsChart({
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

export function AnalyticsLocationList({ locations }: { locations: LocationAggregateDto[] }) {
  const maxPlays = Math.max(1, ...locations.map((l) => l.qualifiedPlays))
  return (
    <ul className="ios-release-analytics__locations">
      {locations.slice(0, 8).map((loc) => (
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
      {!locations.length ? (
        <li className="ios-release-analytics__empty">No location data yet.</li>
      ) : null}
    </ul>
  )
}
