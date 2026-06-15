import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import { updateProfile } from '@/modules/profile/api/profile.api'
import type { UpdateProfileInput } from '@/modules/profile/types/profile.types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(meQueryKey, data)
    },
  })
}
