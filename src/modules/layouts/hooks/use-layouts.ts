import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as layoutApi from '@/modules/layouts/api/layout.api'
import type { LayoutDto } from '@/shared/types/layout.types'

export const layoutsQueryKey = ['layouts'] as const

export function useLayouts() {
  return useQuery({
    queryKey: layoutsQueryKey,
    queryFn: layoutApi.listLayouts,
  })
}

export function useCreateLayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: layoutApi.createLayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: layoutsQueryKey }),
  })
}

export function useUpdateLayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof layoutApi.updateLayout>[1]) =>
      layoutApi.updateLayout(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutsQueryKey })
    },
  })
}

export function useDeleteLayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: layoutApi.deleteLayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: layoutsQueryKey }),
  })
}

export type { LayoutDto }
