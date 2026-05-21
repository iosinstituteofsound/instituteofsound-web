import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/auth/StatusBadge'
import type {
  AnalyticsArtistAccount,
  AnalyticsArtistProfile,
  RecentActivityItem,
} from '@/lib/analytics/types'
import clsx from 'clsx'

export type AnalyticsDetailKey = 'artists' | 'submissions' | 'week' | 'approval'

interface AnalyticsDetailPanelProps {
  view: AnalyticsDetailKey
  onClose: () => void
  artistAccounts: AnalyticsArtistAccount[]
  artistProfiles: AnalyticsArtistProfile[]
  submissions: RecentActivityItem[]
  approvalRate: number
  statusApproved: number
  statusRejected: number
  onOpenSubmission?: (id: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const titles: Record<AnalyticsDetailKey, string> = {
  artists: 'Artists Registered',
  submissions: 'All Track Submissions',
  week: 'Submissions — Last 7 Days',
  approval: 'Approval Breakdown',
}

export function AnalyticsDetailPanel({
  view,
  onClose,
  artistAccounts,
  artistProfiles,
  submissions,
  approvalRate,
  statusApproved,
  statusRejected,
  onOpenSubmission,
}: AnalyticsDetailPanelProps) {
  const weekAgo = Date.now() - 7 * 86_400_000
  const weekItems = submissions.filter((s) => new Date(s.createdAt).getTime() >= weekAgo)
  const approved = submissions.filter((s) => s.status === 'approved')
  const rejected = submissions.filter((s) => s.status === 'rejected')

  return (
    <section className="ios-panel ios-analytics-detail border-mh-red/40">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="ios-kicker">Detail view</p>
          <h3 className="font-display text-2xl font-bold uppercase mt-1">{titles[view]}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ios-btn ios-btn-ghost text-[10px] tracking-[0.2em]"
        >
          Close ×
        </button>
      </div>

      {view === 'artists' && (
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">
              User accounts ({artistAccounts.length})
            </p>
            {artistAccounts.length === 0 ? (
              <p className="text-sm text-muted border border-dashed border-border p-4">
                No artist user accounts yet.
              </p>
            ) : (
              <ul className="divide-y divide-border border border-border">
                {artistAccounts.map((a) => (
                  <li key={a.id} className="px-4 py-3 flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-muted font-mono">{a.email}</p>
                    </div>
                    <span className="text-[10px] text-muted">{formatDate(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">
              Band profiles ({artistProfiles.length})
            </p>
            {artistProfiles.length === 0 ? (
              <p className="text-sm text-muted border border-dashed border-border p-4">
                No public band pages created yet — artists can build profiles in My Studio.
              </p>
            ) : (
              <ul className="divide-y divide-border border border-border">
                {artistProfiles.map((p) => (
                  <li key={p.id} className="px-4 py-3 flex flex-wrap justify-between gap-2 items-center">
                    <div>
                      <p className="font-semibold">{p.displayName}</p>
                      <p className="text-xs text-muted font-mono">/artist/{p.slug}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={clsx(
                          'text-[10px] uppercase tracking-widest',
                          p.published ? 'text-emerald-400' : 'text-muted'
                        )}
                      >
                        {p.published ? 'Live' : 'Draft'}
                      </span>
                      <Link to={`/artist/${p.slug}`} className="ios-link text-xs">
                        View →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {view === 'approval' && (
        <div className="space-y-6">
          <p className="text-sm text-muted leading-relaxed">
            Approval rate = approved ÷ (approved + rejected). Pending / in-review excluded.
            Current rate: <strong className="text-signal">{approvalRate}%</strong> ({statusApproved}{' '}
            approved, {statusRejected} rejected).
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <SubmissionList
              title={`Approved (${approved.length})`}
              items={approved}
              onOpenSubmission={onOpenSubmission}
            />
            <SubmissionList
              title={`Rejected (${rejected.length})`}
              items={rejected}
              onOpenSubmission={onOpenSubmission}
            />
          </div>
        </div>
      )}

      {(view === 'submissions' || view === 'week') && (
        <SubmissionList
          title={view === 'week' ? `${weekItems.length} in last 7 days` : `${submissions.length} total`}
          items={view === 'week' ? weekItems : submissions}
          onOpenSubmission={onOpenSubmission}
          emptyMessage={
            view === 'week'
              ? 'No submissions in the last 7 days.'
              : 'No track submissions yet.'
          }
        />
      )}
    </section>
  )
}

function SubmissionList({
  title,
  items,
  onOpenSubmission,
  emptyMessage = 'Nothing here yet.',
}: {
  title: string
  items: RecentActivityItem[]
  onOpenSubmission?: (id: string) => void
  emptyMessage?: string
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted border border-dashed border-border p-4">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-border border border-border max-h-[420px] overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              {onOpenSubmission ? (
                <button
                  type="button"
                  onClick={() => onOpenSubmission(item.id)}
                  className="w-full text-left px-4 py-3 flex flex-wrap justify-between gap-2 hover:bg-white/5 transition-colors"
                >
                  <SubmissionRowContent item={item} />
                </button>
              ) : (
                <div className="px-4 py-3 flex flex-wrap justify-between gap-2">
                  <SubmissionRowContent item={item} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SubmissionRowContent({ item }: { item: RecentActivityItem }) {
  return (
    <>
      <div className="min-w-0">
        <p className="font-semibold">{item.trackTitle}</p>
        <p className="text-xs text-muted mt-0.5">
          {item.artistName} · {item.genre}
        </p>
        <p className="text-[10px] text-muted font-mono mt-1">{formatDate(item.createdAt)}</p>
      </div>
      <StatusBadge status={item.status} />
    </>
  )
}
