import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLabelProfile } from '@/modules/explore/api/explore.api'

export function useUpdateLabelProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLabelProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile-label-overview', userId] })
      void queryClient.invalidateQueries({ queryKey: ['label-profile'] })
    },
  })
}
