import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import type { SubmissionStatusFilter } from '@/shared/components/editor-submissions/types'

export const SUBMISSION_STATUS_FILTERS: SubmissionStatusFilter[] = [
  'all',
  'pending',
  'in_review',
  'approved',
  'rejected',
]

export const SUBMISSION_STATUS_LABELS: Record<TrackSubmissionDto['status'], string> = {
  pending: 'Pending',
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const SUBMISSION_FILTER_LABELS: Record<SubmissionStatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function filterSubmissions(
  submissions: TrackSubmissionDto[],
  filter: SubmissionStatusFilter,
): TrackSubmissionDto[] {
  if (filter === 'all') return submissions
  return submissions.filter((submission) => submission.status === filter)
}

export function countSubmissionsByStatus(submissions: TrackSubmissionDto[]) {
  return {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    in_review: submissions.filter((s) => s.status === 'in_review').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }
}

export function submissionInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? 'TR').toUpperCase()
}

export function formatSubmissionDate(value?: string): string {
  if (!value) return '—'
  return new Date(value)
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .toUpperCase()
}

export function submissionGenreLabel(genre: string): string {
  return genre.trim().toUpperCase() || 'UNTAGGED'
}
