import { useEffect, useMemo, useState } from 'react'
import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import {
  countSubmissionsByStatus,
  filterSubmissions,
} from '@/shared/components/editor-submissions/lib/submission-utils'
import type { SubmissionStatusFilter } from '@/shared/components/editor-submissions/types'

interface UseEditorSubmissionsDeskOptions {
  submissions: TrackSubmissionDto[]
  filter: SubmissionStatusFilter
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function useEditorSubmissionsDesk({
  submissions,
  filter,
  selectedId,
  onSelect,
}: UseEditorSubmissionsDeskOptions) {
  const [editorNotes, setEditorNotes] = useState('')

  const filteredSubmissions = useMemo(
    () => filterSubmissions(submissions, filter),
    [filter, submissions],
  )

  const statusCounts = useMemo(() => countSubmissionsByStatus(submissions), [submissions])

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedId) ?? null,
    [selectedId, submissions],
  )

  useEffect(() => {
    setEditorNotes(selectedSubmission?.editorNotes ?? '')
  }, [selectedSubmission?.id, selectedSubmission?.editorNotes])

  useEffect(() => {
    if (selectedId && !submissions.some((submission) => submission.id === selectedId)) {
      onSelect(null)
    }
  }, [onSelect, selectedId, submissions])

  return {
    filteredSubmissions,
    statusCounts,
    selectedSubmission,
    editorNotes,
    setEditorNotes,
  }
}
