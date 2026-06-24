import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listSubmissionInbox, reviewSubmissionTarget } from '@/modules/submissions-desk/api/submissions-inbox.api'

export function useSubmissionsInbox(input: { status: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ['submissions-inbox', input],
    queryFn: () => listSubmissionInbox(input),
    refetchOnMount: 'always',
  })
}

export function useReviewSubmissionTarget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewSubmissionTarget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['submissions-inbox'] })
    },
  })
}

