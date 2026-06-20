import type { ReactNode } from 'react'
import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'

export type SubmissionStatusFilter = 'all' | TrackSubmissionDto['status']

export interface EditorSubmissionsLabels {
  inboxKicker?: string
  inboxTitle?: string
  inboxEmpty?: string
  reviewKicker?: string
  reviewTitle?: string
  reviewEmpty?: string
  notesPlaceholder?: string
  inReviewLabel?: string
  approveLabel?: string
  rejectLabel?: string
  savingLabel?: string
  artistLabel?: string
  projectLabel?: string
  genreLabel?: string
  submittedLabel?: string
  reviewedLabel?: string
  descriptionLabel?: string
  streamLabel?: string
  openStreamLabel?: string
}

export const DEFAULT_EDITOR_SUBMISSIONS_LABELS: Required<EditorSubmissionsLabels> = {
  inboxKicker: ':: Intake queue',
  inboxTitle: 'Submission inbox',
  inboxEmpty: 'No submissions in this filter. Artists submit from their studio desk.',
  reviewKicker: ':: Review console',
  reviewTitle: 'Track review',
  reviewEmpty: 'Select a submission to listen, annotate, and approve or reject.',
  notesPlaceholder: 'Editor notes — feedback for the artist or internal desk…',
  inReviewLabel: 'Mark in review',
  approveLabel: 'Approve release',
  rejectLabel: 'Reject',
  savingLabel: 'Saving…',
  artistLabel: 'Artist',
  projectLabel: 'Project',
  genreLabel: 'Genre',
  submittedLabel: 'Submitted',
  reviewedLabel: 'Reviewed',
  descriptionLabel: 'Description',
  streamLabel: 'Stream',
  openStreamLabel: 'Open source link',
}

export interface EditorSubmissionsDeskProps {
  submissions: TrackSubmissionDto[]
  filter: SubmissionStatusFilter
  onFilterChange: (filter: SubmissionStatusFilter) => void
  selectedId: string | null
  onSelect: (id: string) => void
  editorNotes: string
  onEditorNotesChange: (notes: string) => void
  onReview: (status: TrackSubmissionDto['status']) => void
  isReviewing?: boolean
  className?: string
  labels?: EditorSubmissionsLabels
  enabledFilters?: SubmissionStatusFilter[]
}

export interface EditorSubmissionsEditorProps {
  enabled?: boolean
  className?: string
  labels?: EditorSubmissionsLabels
  enabledFilters?: SubmissionStatusFilter[]
  onReviewed?: (submission: TrackSubmissionDto) => void
  children?: ReactNode
}
