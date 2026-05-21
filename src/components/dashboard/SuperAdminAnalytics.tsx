import { useState } from 'react'
import { StatusBadge } from '@/components/auth/StatusBadge'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { SuperAdminAnalytics } from '@/lib/analytics/types'
import {
  AnalyticsDetailPanel,
  type AnalyticsDetailKey,
} from '@/components/dashboard/AnalyticsDetailPanel'
import clsx from 'clsx'

interface SuperAdminAnalyticsProps {
  data: SuperAdminAnalytics
  operatorName: string
  onOpenQueue: (filter?: 'pending' | 'in_review' | 'approved' | 'rejected') => void
  onSelectSubmission?: (submissionId: string) => void
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function pipelineCopy(p: SuperAdminAnalytics['pipeline']) {
  switch (p) {
    case 'backlog':
      return { label: 'Backlog', variant: 'live' as const, note: 'Queue needs attention' }
    case 'steady':
      return { label: 'Active', variant: 'crimson' as const, note: 'Steady submission flow' }
    default:
      return { label: 'Clear', variant: 'dark' as const, note: 'Pipeline under control' }
  }
}

export function SuperAdminAnalyticsPanel({
  data,
  operatorName,
  onOpenQueue,
  onSelectSubmission,
}: SuperAdminAnalyticsProps) {
  const [detail, setDetail] = useState<AnalyticsDetailKey | null>(null)
  const pipe = pipelineCopy(data.pipeline)
  const updated = new Date(data.generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const heroStats: {
    key: AnalyticsDetailKey
    label: string
    value: string | number
    code: string
  }[] = [
    { key: 'artists', label: 'Artists Registered', value: data.artistsRegistered, code: 'ART' },
    { key: 'submissions', label: 'Track Submissions', value: data.totalSubmissions, code: 'SUB' },
    { key: 'week', label: 'Last 7 Days', value: data.submissionsLast7Days, code: '7D' },
    { key: 'approval', label: 'Approval Rate', value: `${data.approvalRate}%`, code: 'APR' },
  ]

  const draftStats = [
    { label: 'Reviews', value: data.draftsByType.review },
    { label: 'Features', value: data.draftsByType.feature },
    { label: 'Band Profiles', value: data.draftsByType.band_profile },
  ]

  const openSubmissionFromDetail = (id: string) => {
    setDetail(null)
    onSelectSubmission?.(id)
  }

  return (
    <div className="ios-analytics space-y-10">
      <section className="ios-panel ios-panel-accent ios-analytics-hero">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="ios-kicker">Personal Command</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 tracking-tight">
              Analytics — {operatorName}
            </h2>
            <p className="text-sm text-muted mt-3 max-w-xl leading-relaxed">
              Institute of Sound operations at a glance. Submissions, artists, editorial
              drafts, and pipeline health — live from your database.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <MetalBadge variant={pipe.variant}>{pipe.label}</MetalBadge>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted">{pipe.note}</span>
            </div>
          </div>
          <div className="ios-analytics-meta text-right">
            <span className="ios-label block">Last sync</span>
            <span className="font-mono text-xs text-signal mt-1">{updated}</span>
            <span className="ios-label block mt-4">Unique submitters</span>
            <span className="font-display text-2xl font-bold text-mh-red">
              {data.uniqueSubmittingArtists}
            </span>
          </div>
        </div>
        <div className="transmission-line mt-8 mb-6" />
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">
          Click a metric for full detail
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {heroStats.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setDetail(detail === s.key ? null : s.key)}
              className={clsx(
                'ios-analytics-stat ios-analytics-stat-btn text-left',
                detail === s.key && 'ios-analytics-stat-active'
              )}
            >
              <span className="ios-analytics-stat-code">{s.code}</span>
              <span className="ios-analytics-stat-value">{s.value}</span>
              <span className="ios-analytics-stat-label">{s.label}</span>
              <span className="ios-analytics-stat-hint">View detail →</span>
            </button>
          ))}
        </div>
      </section>

      {detail && (
        <AnalyticsDetailPanel
          view={detail}
          onClose={() => setDetail(null)}
          artistAccounts={data.artistAccounts}
          artistProfiles={data.artistProfiles}
          submissions={data.submissionLog}
          approvalRate={data.approvalRate}
          statusApproved={data.statusCounts.approved}
          statusRejected={data.statusCounts.rejected}
          onOpenSubmission={onSelectSubmission ? openSubmissionFromDetail : undefined}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="ios-panel lg:col-span-2">
          <p className="ios-kicker ios-kicker-rs">Pipeline</p>
          <h3 className="font-display text-xl font-bold uppercase mt-2 mb-6">Submission Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {(
              [
                ['pending', 'Pending', data.statusCounts.pending],
                ['in_review', 'In Review', data.statusCounts.in_review],
                ['approved', 'Approved', data.statusCounts.approved],
                ['rejected', 'Rejected', data.statusCounts.rejected],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => onOpenQueue(key)}
                className="ios-analytics-pipeline-tile group"
              >
                <span className="font-display text-3xl font-bold group-hover:text-mh-red transition-colors">
                  {count}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted mt-1">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <p className="ios-kicker">Signal Mix</p>
          <h3 className="font-display text-lg font-bold uppercase mt-2 mb-4">Top Genres</h3>
          {data.genreBreakdown.length === 0 ? (
            <p className="text-sm text-muted">No submissions yet — genre breakdown appears here.</p>
          ) : (
            <ul className="space-y-4">
              {data.genreBreakdown.map((g) => (
                <li key={g.genre}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold uppercase tracking-wide">{g.genre}</span>
                    <span className="text-muted font-mono">
                      {g.count} · {g.pct}%
                    </span>
                  </div>
                  <div className="ios-analytics-bar-track">
                    <div
                      className="ios-analytics-bar-fill"
                      style={{ width: `${Math.max(g.pct, 4)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ios-panel">
          <p className="ios-kicker">Editorial</p>
          <h3 className="font-display text-xl font-bold uppercase mt-2 mb-4">Your Drafts</h3>
          <p className="font-display text-4xl font-bold text-mh-red">{data.draftsTotal}</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mt-1 mb-6">
            Total in system
          </p>
          <ul className="space-y-3 border-t border-border pt-4">
            {draftStats.map((d) => (
              <li key={d.label} className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-muted">{d.label}</span>
                <span className="font-display text-lg font-bold">{d.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted uppercase tracking-widest">30-day intake</span>
              <span className="font-bold">{data.submissionsLast30Days}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted uppercase tracking-widest">Avg review time</span>
              <span className="font-bold font-mono">
                {data.avgReviewHours != null ? `${data.avgReviewHours}h` : '—'}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="ios-panel">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="ios-kicker">Transmission Log</p>
            <h3 className="font-display text-xl font-bold uppercase mt-2">Recent Submissions</h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenQueue()}
            className="ios-btn ios-btn-ghost text-[10px] tracking-[0.2em]"
          >
            Open full queue →
          </button>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center border border-dashed border-border">
            No artist submissions yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recentActivity.map((item, i) => (
              <li
                key={item.id}
                className={clsx(
                  'ios-analytics-feed-row py-4 flex flex-wrap items-center justify-between gap-3',
                  i === 0 && 'ios-analytics-feed-row-new'
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.trackTitle}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {item.artistName} · {item.genre}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-mono text-muted">{formatWhen(item.createdAt)}</span>
                  <StatusBadge status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
