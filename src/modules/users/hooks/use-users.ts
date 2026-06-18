import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as userApi from '@/modules/users/api/user.api'

export function useUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'detail'],
    queryFn: () => userApi.getUser(userId),
    enabled: Boolean(userId) && enabled,
  })
}

export function useUsers(q?: string) {
  const trimmed = q?.trim() ?? ''
  return useQuery({
    queryKey: ['users', trimmed || '__all__'],
    queryFn: () => userApi.listUsers(trimmed || undefined),
    enabled: !trimmed || trimmed.length >= 2,
  })
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'roles'],
    queryFn: () => userApi.getUserRoles(userId),
    enabled: Boolean(userId),
  })
}

export function useAssignUserRole(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => userApi.assignUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'detail'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useRevokeUserRole(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => userApi.revokeUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'detail'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useSetUserVerified(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isVerified: boolean) => userApi.setUserVerified(userId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'detail'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
