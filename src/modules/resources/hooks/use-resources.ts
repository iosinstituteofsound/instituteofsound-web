import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as resourceApi from '@/modules/resources/api/resource.api'
import type { CreateResourceInput, UpdateResourceInput } from '@/modules/resources/api/resource.api'

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: resourceApi.getResources,
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateResourceInput) => resourceApi.createResource(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResourceInput }) =>
      resourceApi.updateResource(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourceApi.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}
