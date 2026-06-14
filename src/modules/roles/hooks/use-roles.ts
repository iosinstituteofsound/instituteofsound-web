import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as roleApi from '@/modules/roles/api/role.api'
import type { CreateRoleInput, UpdateRoleInput } from '@/modules/roles/api/role.api'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoleInput) => roleApi.createRole(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      roleApi.updateRole(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}
