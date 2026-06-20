import { Inbox } from 'lucide-react'
import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import { SubmissionStatusBadge } from '@/shared/components/editor-submissions/components/submission-status-badge'
import {
  formatSubmissionDate,
  submissionGenreLabel,
  submissionInitials,
  SUBMISSION_FILTER_LABELS,
  SUBMISSION_STATUS_FILTERS,
} from '@/shared/components/editor-submissions/lib/submission-utils'
import type { SubmissionStatusFilter } from '@/shared/components/editor-submissions/types'
import { cn } from '@/shared/lib/cn'

export function SubmissionFilterTabs({
  filter,
  counts,
  enabledFilters = SUBMISSION_STATUS_FILTERS,
  onChange,
}: {
  filter: SubmissionStatusFilter
  counts: Record<SubmissionStatusFilter, number>
  enabledFilters?: SubmissionStatusFilter[]
  onChange: (filter: SubmissionStatusFilter) => void
}) {
  return (
    <div className="sub-desk__filters" role="tablist" aria-label="Submission filters">
      {enabledFilters.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={filter === key ? 'true' : 'false'}
          className={cn('sub-desk__filter', filter === key && 'sub-desk__filter--active')}
          onClick={() => onChange(key)}
        >
          {SUBMISSION_FILTER_LABELS[key]}
          <span className="sub-desk__filter-count">{counts[key]}</span>
        </button>
      ))}
    </div>
  )
}

export function SubmissionInboxRow({
  submission,
  active,
  onSelect,
}: {
  submission: TrackSubmissionDto
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={cn('sub-desk__row', active && 'sub-desk__row--active')}
      onClick={onSelect}
    >
      <div className="sub-desk__art">
        {submission.coverUrl ? (
          <img src={submission.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="sub-desk__art-fallback">{submissionInitials(submission.trackTitle)}</div>
        )}
      </div>
      <div className="sub-desk__info">
        <p className="sub-desk__track-title">{submission.trackTitle}</p>
        <p className="sub-desk__track-meta">
          {submission.artistName ?? 'Unknown artist'} · {submission.projectName}
        </p>
        <p className="sub-desk__track-date">{formatSubmissionDate(submission.createdAt)}</p>
        <div className="sub-desk__badges">
          <span className="sub-desk__badge">{submissionGenreLabel(submission.genre)}</span>
        </div>
      </div>
      <SubmissionStatusBadge status={submission.status} />
    </button>
  )
}

export function SubmissionInboxPanel({
  submissions,
  filter,
  counts,
  selectedId,
  labels,
  enabledFilters,
  onFilterChange,
  onSelect,
}: {
  submissions: TrackSubmissionDto[]
  filter: SubmissionStatusFilter
  counts: Record<SubmissionStatusFilter, number>
  selectedId: string | null
  labels: { inboxKicker: string; inboxTitle: string; inboxEmpty: string }
  enabledFilters?: SubmissionStatusFilter[]
  onFilterChange: (filter: SubmissionStatusFilter) => void
  onSelect: (id: string) => void
}) {
  return (
    <section className="sub-desk__panel sub-desk__panel--inbox" aria-labelledby="submission-inbox-heading">
      <header className="sub-desk__header">
        <div>
          <p className="sub-desk__kicker">{labels.inboxKicker}</p>
          <h3 id="submission-inbox-heading" className="sub-desk__title">
            {labels.inboxTitle}
          </h3>
        </div>
        <span className="sub-desk__meta">
          <Inbox size={12} aria-hidden />
          {counts.all} total
        </span>
      </header>
      <div className="sub-desk__body">
        <SubmissionFilterTabs
          filter={filter}
          counts={counts}
          enabledFilters={enabledFilters}
          onChange={onFilterChange}
        />
        <div className="sub-desk__scroll">
          {submissions.length === 0 ? (
            <div className="sub-desk__empty">{labels.inboxEmpty}</div>
          ) : (
            <div className="sub-desk__list">
              {submissions.map((submission) => (
                <SubmissionInboxRow
                  key={submission.id}
                  submission={submission}
                  active={selectedId === submission.id}
                  onSelect={() => onSelect(submission.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
