import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getArtistReleasePerformance } from '@/modules/music/api/music.api'
import type { ArtistReleasePerformanceDto } from '@/modules/music/types/analytics.types'
import {
  ANALYTICS_RANGE_PRESETS,
  buildSparklinePath,
  formatReleaseDate,
  type AnalyticsRangePreset,
} from '@/modules/music/lib/artist-dashboard-utils'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import { DashboardLineChart } from '@/modules/music/components/artist-dashboard/dashboard-line-chart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Loader } from '@/shared/components/feedback/loader'

type PeriodSelectorProps = {
  preset: AnalyticsRangePreset
  customFrom: string
  customTo: string
  onPresetChange: (preset: AnalyticsRangePreset) => void
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
  compact?: boolean
}

export function ArtistDashboardPeriodSelector({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
  compact = false,
}: PeriodSelectorProps) {
  return (
    <div
      className={compact ? 'ios-artist-dashboard__range-picker' : 'ios-artist-dashboard__modal-range'}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="presentation"
    >
      <div className="ios-artist-dashboard__range-tabs" role="tablist" aria-label="Analytics period">
        {ANALYTICS_RANGE_PRESETS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={preset === option.id}
            className={`ios-artist-dashboard__range-tab${preset === option.id ? ' is-active' : ''}`}
            onClick={() => onPresetChange(option.id)}
          >
            {compact ? option.label.replace('Last ', '').replace(' days', 'd') : option.label}
          </button>
        ))}
      </div>
      {preset === 'custom' ? (
        <div className="ios-artist-dashboard__custom-range">
          <label className="ios-artist-dashboard__custom-field">
            <span>From</span>
            <Input type="date" value={customFrom} onChange={(e) => onCustomFromChange(e.target.value)} />
          </label>
          <label className="ios-artist-dashboard__custom-field">
            <span>To</span>
            <Input type="date" value={customTo} onChange={(e) => onCustomToChange(e.target.value)} />
          </label>
        </div>
      ) : null}
    </div>
  )
}

function ReleaseTrendSparkline({ points }: { points: ArtistReleasePerformanceDto['releases'][number]['trend'] }) {
  const values = points.map((p) => p.qualifiedPlays)
  const path = buildSparklinePath(values, 120, 32)
  if (!path) return <span className="ios-artist-dashboard__release-row-spark-empty">—</span>

  return (
    <div className="ios-artist-dashboard__release-row-spark" aria-hidden>
      <svg viewBox="0 0 120 32" preserveAspectRatio="none">
        <path
          d={path}
          fill="none"
          stroke="var(--ios-dashboard-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

function ReleasePerformanceList({ data }: { data: ArtistReleasePerformanceDto }) {
  const maxPlays = Math.max(1, ...data.releases.map((r) => r.qualifiedPlays))

  return (
    <ul className="ios-artist-dashboard__release-list">
      {data.releases.map((release) => (
        <li key={release.releaseId} className="ios-artist-dashboard__release-row">
          <div className="ios-artist-dashboard__release-row-art">
            {release.coverUrl ? (
              <img src={release.coverUrl} alt="" />
            ) : (
              <span className="ios-artist-dashboard__release-art-fallback">
                <Disc3 size={18} aria-hidden />
              </span>
            )}
          </div>
          <div className="ios-artist-dashboard__release-row-main">
            <div className="ios-artist-dashboard__release-row-head">
              <div>
                <Link to={`/releases/${release.releaseId}`} className="ios-artist-dashboard__release-row-title">
                  {release.title}
                </Link>
                <p className="ios-artist-dashboard__release-row-meta capitalize">
                  {release.type}
                  {release.releaseDate ? ` · ${formatReleaseDate(release.releaseDate)}` : ''}
                </p>
              </div>
              <ReleaseTrendSparkline points={release.trend} />
            </div>
            <div className="ios-artist-dashboard__release-row-stats">
              <span>{formatPlays(release.qualifiedPlays)} streams</span>
              <span>{formatPlays(release.uniqueListeners)} listeners</span>
              <span>{formatPlays(release.activeLikes)} saves</span>
              <span>{formatListenTime(release.totalListenSec)}</span>
              <span>{formatPercent(release.completionRate)} done</span>
            </div>
            <div
              className="ios-artist-dashboard__release-bar"
              style={{ '--release-progress': `${(release.qualifiedPlays / maxPlays) * 100}%` } as CSSProperties}
            >
              <span />
            </div>
          </div>
        </li>
      ))}
      {!data.releases.length ? (
        <li className="ios-artist-dashboard__modal-empty">No published releases in this period.</li>
      ) : null}
    </ul>
  )
}

type ModalProps = {
  open: boolean
  onClose: () => void
  preset: AnalyticsRangePreset
  customFrom: string
  customTo: string
  onPresetChange: (preset: AnalyticsRangePreset) => void
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
}

export function ArtistDashboardReleasesModal({
  open,
  onClose,
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
}: ModalProps) {
  const queryEnabled = open && (preset !== 'custom' || Boolean(customFrom))

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artist-release-performance', preset, customFrom, customTo],
    queryFn: () =>
      getArtistReleasePerformance({
        range: preset,
        from: preset === 'custom' ? customFrom : undefined,
        to: preset === 'custom' ? customTo || undefined : undefined,
      }),
    enabled: queryEnabled,
  })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        elevated
        className="ios-artist-dashboard__modal-content max-h-[92vh] max-w-5xl overflow-y-auto p-0 sm:rounded-2xl"
      >
        <div className="ios-artist-dashboard__modal ios-artist-dashboard__modal--releases" data-accent="primary">
          <DialogHeader className="ios-artist-dashboard__modal-header">
            <div>
              <DialogTitle className="ios-artist-dashboard__modal-title">Release Performance</DialogTitle>
              <DialogDescription className="ios-artist-dashboard__modal-desc">
                All releases with streams, listeners, saves, and per-release trend graphs.
              </DialogDescription>
            </div>
            <ArtistDashboardPeriodSelector
              preset={preset}
              customFrom={customFrom}
              customTo={customTo}
              onPresetChange={onPresetChange}
              onCustomFromChange={onCustomFromChange}
              onCustomToChange={onCustomToChange}
            />
          </DialogHeader>

          <div className="ios-artist-dashboard__modal-body">
            {isLoading ? <Loader /> : null}
            {isError ? (
              <p className="ios-artist-dashboard__modal-empty">Could not load release performance for this period.</p>
            ) : null}
            {data ? (
              <>
                <div className="ios-artist-dashboard__modal-stats">
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Period</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{data.range.label}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Total streams</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{formatPlays(data.totals.qualifiedPlays)}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Listeners</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{formatPlays(data.totals.uniqueListeners)}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Saves</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{formatPlays(data.totals.activeLikes)}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Listen time</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{formatListenTime(data.totals.totalListenSec)}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Completion</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{formatPercent(data.totals.completionRate)}</span>
                  </div>
                  <div className="ios-artist-dashboard__modal-stat">
                    <span className="ios-artist-dashboard__modal-stat-label">Releases</span>
                    <span className="ios-artist-dashboard__modal-stat-value">{data.releases.length}</span>
                  </div>
                </div>

                <section className="ios-artist-dashboard__modal-section">
                  <h3 className="ios-artist-dashboard__modal-section-title">Combined stream trend</h3>
                  <DashboardLineChart
                    points={data.aggregateTrend}
                    fromDate={data.range.from}
                    toDate={data.range.to}
                    emptyMessage="No stream activity in this period yet."
                    ariaLabel="All releases stream trend"
                  />
                </section>

                <section className="ios-artist-dashboard__modal-section">
                  <h3 className="ios-artist-dashboard__modal-section-title">All releases</h3>
                  <ReleasePerformanceList data={data} />
                </section>
              </>
            ) : null}
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
      </DialogContent>
    </Dialog>
  )
}

export function useArtistReleasePerformanceCard(
  preset: AnalyticsRangePreset,
  customFrom: string,
  customTo: string,
) {
  const enabled = preset !== 'custom' || Boolean(customFrom)

  return useQuery({
    queryKey: ['artist-release-performance', preset, customFrom, customTo],
    queryFn: () =>
      getArtistReleasePerformance({
        range: preset,
        from: preset === 'custom' ? customFrom : undefined,
        to: preset === 'custom' ? customTo || undefined : undefined,
      }),
    enabled,
  })
}
