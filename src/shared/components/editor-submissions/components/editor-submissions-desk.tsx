import { useMemo } from 'react'
import { SubmissionInboxPanel } from '@/shared/components/editor-submissions/components/submission-inbox-panel'
import { SubmissionReviewPanel } from '@/shared/components/editor-submissions/components/submission-review-panel'
import {
  countSubmissionsByStatus,
  filterSubmissions,
  SUBMISSION_STATUS_FILTERS,
} from '@/shared/components/editor-submissions/lib/submission-utils'
import {
  DEFAULT_EDITOR_SUBMISSIONS_LABELS,
  type EditorSubmissionsDeskProps,
} from '@/shared/components/editor-submissions/types'
import { cn } from '@/shared/lib/cn'
import '@/shared/components/editor-submissions/styles/editor-submissions-desk.css'

export function EditorSubmissionsDesk({
  submissions,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  editorNotes,
  onEditorNotesChange,
  onReview,
  isReviewing,
  className,
  labels,
  enabledFilters = SUBMISSION_STATUS_FILTERS,
}: EditorSubmissionsDeskProps) {
  const copy = { ...DEFAULT_EDITOR_SUBMISSIONS_LABELS, ...labels }

  const filteredSubmissions = useMemo(
    () => filterSubmissions(submissions, filter),
    [filter, submissions],
  )
  const statusCounts = useMemo(() => countSubmissionsByStatus(submissions), [submissions])
  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedId) ?? null,
    [selectedId, submissions],
  )

  const inboxLabels = {
    inboxKicker: copy.inboxKicker,
    inboxTitle: copy.inboxTitle,
    inboxEmpty: copy.inboxEmpty,
  }

  const reviewLabels = {
    reviewKicker: copy.reviewKicker,
    reviewTitle: copy.reviewTitle,
    reviewEmpty: copy.reviewEmpty,
    notesPlaceholder: copy.notesPlaceholder,
    inReviewLabel: copy.inReviewLabel,
    approveLabel: copy.approveLabel,
    rejectLabel: copy.rejectLabel,
    savingLabel: copy.savingLabel,
    artistLabel: copy.artistLabel,
    projectLabel: copy.projectLabel,
    genreLabel: copy.genreLabel,
    submittedLabel: copy.submittedLabel,
    reviewedLabel: copy.reviewedLabel,
    descriptionLabel: copy.descriptionLabel,
    openStreamLabel: copy.openStreamLabel,
  }

  return (
    <div className={cn('sub-desk', className)}>
      <SubmissionInboxPanel
        submissions={filteredSubmissions}
        filter={filter}
        counts={statusCounts}
        selectedId={selectedId}
        labels={inboxLabels}
        enabledFilters={enabledFilters}
        onFilterChange={onFilterChange}
        onSelect={onSelect}
      />
      <SubmissionReviewPanel
        submission={selectedSubmission}
        editorNotes={editorNotes}
        onEditorNotesChange={onEditorNotesChange}
        onReview={onReview}
        isReviewing={isReviewing}
        labels={reviewLabels}
      />
    </div>
  )
}
