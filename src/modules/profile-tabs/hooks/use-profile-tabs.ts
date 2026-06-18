import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as profileTabsApi from '@/modules/profile-tabs/api/profile-tabs.api'
import type { CreateProfileTabInput, UpdateProfileTabInput } from '@/shared/types/profile-tabs.types'

export function useProfileTabsAdmin() {
  return useQuery({
    queryKey: ['profile-tabs-admin'],
    queryFn: profileTabsApi.getAllProfileTabs,
  })
}

export function useCreateProfileTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProfileTabInput) => profileTabsApi.createProfileTab(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-tabs-admin'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useUpdateProfileTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProfileTabInput }) =>
      profileTabsApi.updateProfileTab(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-tabs-admin'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useDeleteProfileTab() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => profileTabsApi.deleteProfileTab(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-tabs-admin'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

