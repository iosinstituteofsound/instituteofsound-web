import { useMemo } from 'react'
import type { SubmissionInboxPageDto, SubmissionInboxRowDto } from '@/modules/explore/types/explore.types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import '@/modules/submissions-desk/styles/submissions-desk.css'

const FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'in_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'archived', label: 'Archived' },
]

function formatSubmittedAt(value: string): string {
  return new Date(value)
    .toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .toUpperCase()
}

export function SubmissionsDesk({
  page,
  filter,
  onFilterChange,
  onPageChange,
  selectedId,
  onSelect,
  reviewerNotes,
  onReviewerNotesChange,
  onReview,
  isReviewing,
  className,
}: {
  page: SubmissionInboxPageDto
  filter: string
  onFilterChange: (value: string) => void
  onPageChange: (page: number) => void
  selectedId: string | null
  onSelect: (id: string) => void
  reviewerNotes: string
  onReviewerNotesChange: (value: string) => void
  onReview: (status: SubmissionInboxRowDto['status']) => void
  isReviewing: boolean
  className?: string
}) {
  const counts = useMemo(() => {
    const base: Record<string, number> = Object.fromEntries(FILTERS.map((f) => [f.id, 0]))
    base.all = page.total
    for (const item of page.items) base[item.status] = (base[item.status] ?? 0) + 1
    return base
  }, [page.items, page.total])

  const selected = useMemo(
    () => (selectedId ? page.items.find((i) => i.id === selectedId) ?? null : null),
    [page.items, selectedId],
  )

  const from = page.total === 0 ? 0 : (page.page - 1) * page.limit + 1
  const to = Math.min(page.total, page.page * page.limit)
  const totalPages = Math.max(1, Math.ceil(page.total / page.limit))

  return (
    <div className={cn('sdesk', className)}>
      <div className="sdesk__filters" aria-label="Submission filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn('sdesk__filter', filter === f.id && 'sdesk__filter--active')}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
            <span className="sdesk__filter-count">{counts[f.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="sdesk__grid">
        <div className="sdesk__table">
          <div className="sdesk__thead">
            <div>Track / Artist</div>
            <div>Genre</div>
            <div>Submitted To</div>
            <div>Submitted On</div>
            <div>Status</div>
          </div>
          <div className="sdesk__tbody">
            {page.items.map((row) => (
              <button
                key={row.id}
                type="button"
                className={cn('sdesk__row', row.id === selectedId && 'sdesk__row--active')}
                onClick={() => onSelect(row.id)}
              >
                <div className="sdesk__track">
                  <div className="sdesk__cover">
                    {row.coverUrl ? <img src={row.coverUrl} alt="" /> : <div className="sdesk__cover--empty" />}
                  </div>
                  <div className="sdesk__track-meta">
                    <div className="sdesk__title">{row.trackTitle}</div>
                    <div className="sdesk__sub">{row.artistName}</div>
                  </div>
                </div>
                <div className="sdesk__pill">{row.genre}</div>
                <div className="sdesk__submittedTo">
                  <div className="sdesk__submittedTo-title">{row.submittedTo.title}</div>
                  <div className="sdesk__sub">{row.submittedTo.reviewerRoleSlug}</div>
                </div>
                <div className="sdesk__date">{formatSubmittedAt(row.submittedAt)}</div>
                <div className={cn('sdesk__status', `sdesk__status--${row.status}`)}>{row.status.replace('_', ' ')}</div>
              </button>
            ))}
            {page.items.length === 0 && <div className="sdesk__empty">No submissions.</div>}
          </div>

          <div className="sdesk__pagination">
            <div className="sdesk__pagination-left">
              Showing {from} to {to} of {page.total} submissions
            </div>
            <div className="sdesk__pagination-right">
              <Button
                variant="ghost"
                size="sm"
                disabled={page.page <= 1}
                onClick={() => onPageChange(page.page - 1)}
              >
                Prev
              </Button>
              <div className="sdesk__pagination-pages">
                {page.page} / {totalPages}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={page.page >= totalPages}
                onClick={() => onPageChange(page.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="sdesk__detail">
          {selected ? (
            <>
              <div className="sdesk__detail-header">
                <div className="sdesk__detail-title">{selected.trackTitle}</div>
                <div className="sdesk__sub">{selected.artistName}</div>
              </div>

              <div className="sdesk__detail-actions">
                <Button disabled={isReviewing} variant="secondary" onClick={() => onReview('shortlisted')}>
                  Shortlist
                </Button>
                <Button disabled={isReviewing} variant="destructive" onClick={() => onReview('rejected')}>
                  Reject
                </Button>
                <Button disabled={isReviewing} onClick={() => onReview('approved')}>
                  Approve
                </Button>
              </div>

              <div className="sdesk__detail-block">
                <div className="sdesk__detail-label">Reviewer notes</div>
                <Textarea
                  value={reviewerNotes}
                  onChange={(e) => onReviewerNotesChange(e.target.value)}
                  placeholder="Add a note for this submission..."
                  rows={8}
                />
              </div>

              <div className="sdesk__detail-block">
                <div className="sdesk__detail-label">Details</div>
                <div className="sdesk__kv">
                  <div>Genre</div>
                  <div>{selected.genre}</div>
                  <div>Submitted to</div>
                  <div>{selected.submittedTo.title}</div>
                  <div>Status</div>
                  <div className={cn('sdesk__status', `sdesk__status--${selected.status}`)}>
                    {selected.status.replace('_', ' ')}
                  </div>
                  <div>Submitted at</div>
                  <div>{formatSubmittedAt(selected.submittedAt)}</div>
                  <div>Reviewed by</div>
                  <div>{selected.reviewedByName ?? '—'}</div>
                  <div>Reviewed at</div>
                  <div>{selected.reviewedAt ? formatSubmittedAt(selected.reviewedAt) : '—'}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="sdesk__detail-empty">Select a submission to review.</div>
          )}
        </div>
      </div>
    </div>
  )
}

