export { EditorSubmissionsDesk } from '@/shared/components/editor-submissions/components/editor-submissions-desk'
export { EditorSubmissionsEditor } from '@/shared/components/editor-submissions/components/editor-submissions-editor'
export { SubmissionInboxPanel } from '@/shared/components/editor-submissions/components/submission-inbox-panel'
export { SubmissionReviewPanel } from '@/shared/components/editor-submissions/components/submission-review-panel'
export {
  SubmissionFilterTabs,
  SubmissionInboxRow,
} from '@/shared/components/editor-submissions/components/submission-inbox-panel'
export { SubmissionStatusBadge } from '@/shared/components/editor-submissions/components/submission-status-badge'

export { useEditorSubmissionsDesk } from '@/shared/components/editor-submissions/hooks/use-editor-submissions-desk'
export { useEditorSubmissionsEditor } from '@/shared/components/editor-submissions/hooks/use-editor-submissions-editor'

export {
  SUBMISSION_STATUS_FILTERS,
  SUBMISSION_FILTER_LABELS,
  SUBMISSION_STATUS_LABELS,
  countSubmissionsByStatus,
  filterSubmissions,
  formatSubmissionDate,
  submissionGenreLabel,
  submissionInitials,
} from '@/shared/components/editor-submissions/lib/submission-utils'

export {
  DEFAULT_EDITOR_SUBMISSIONS_LABELS,
  type EditorSubmissionsDeskProps,
  type EditorSubmissionsEditorProps,
  type EditorSubmissionsLabels,
  type SubmissionStatusFilter,
} from '@/shared/components/editor-submissions/types'
