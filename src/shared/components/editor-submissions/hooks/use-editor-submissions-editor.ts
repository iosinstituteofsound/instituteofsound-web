import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { listEditorSubmissions, reviewSubmission } from '@/modules/explore/api/explore.api'
import type { TrackSubmissionDto } from '@/modules/explore/types/explore.types'
import { useEditorSubmissionsDesk } from '@/shared/components/editor-submissions/hooks/use-editor-submissions-desk'
import type { SubmissionStatusFilter } from '@/shared/components/editor-submissions/types'

interface UseEditorSubmissionsEditorOptions {
  enabled?: boolean
  onReviewed?: (submission: TrackSubmissionDto) => void
}

export function useEditorSubmissionsEditor({
  enabled = true,
  onReviewed,
}: UseEditorSubmissionsEditorOptions = {}) {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<SubmissionStatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const submissionsQuery = useQuery({
    queryKey: ['editor-submissions'],
    queryFn: () => listEditorSubmissions(),
    enabled,
  })

  const submissions = submissionsQuery.data ?? []

  const desk = useEditorSubmissionsDesk({
    submissions,
    filter,
    selectedId,
    onSelect: setSelectedId,
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      editorNotes,
    }: {
      id: string
      status: TrackSubmissionDto['status']
      editorNotes: string
    }) => reviewSubmission(id, { status, editorNotes: editorNotes.trim() || undefined }),
    onSuccess: async (submission) => {
      await queryClient.invalidateQueries({ queryKey: ['editor-submissions'] })
      toast.success(`Submission ${submission.status.replace('_', ' ')}`)
      onReviewed?.(submission)
    },
    onError: () => {
      toast.error('Could not update submission')
    },
  })

  const review = (status: TrackSubmissionDto['status']) => {
    if (!selectedId) return
    reviewMutation.mutate({
      id: selectedId,
      status,
      editorNotes: desk.editorNotes,
    })
  }

  return {
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    submissions,
    isLoading: submissionsQuery.isLoading,
    isReviewing: reviewMutation.isPending,
    review,
    ...desk,
  }
}
