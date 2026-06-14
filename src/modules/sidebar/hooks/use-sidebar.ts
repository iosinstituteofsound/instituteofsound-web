import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePermissionStore } from '@/app/stores/permission-store'
import * as sidebarApi from '@/modules/sidebar/api/sidebar.api'
import type {
  CreateSidebarItemInput,
  UpdateSidebarItemInput,
} from '@/shared/types/sidebar.types'

export function useSidebar() {
  const syncFromSidebarItems = usePermissionStore((s) => s.syncFromSidebarItems)

  return useQuery({
    queryKey: ['sidebar'],
    queryFn: async () => {
      const items = await sidebarApi.getSidebarItems()
      syncFromSidebarItems(items)
      return items
    },
    staleTime: 0,
  })
}

export function useSidebarItemsAdmin() {
  return useQuery({
    queryKey: ['sidebar-items-admin'],
    queryFn: sidebarApi.getAllSidebarItems,
  })
}

export function useCreateSidebarItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSidebarItemInput) => sidebarApi.createSidebarItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar'] })
      queryClient.invalidateQueries({ queryKey: ['sidebar-items-admin'] })
    },
  })
}

export function useUpdateSidebarItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSidebarItemInput }) =>
      sidebarApi.updateSidebarItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar'] })
      queryClient.invalidateQueries({ queryKey: ['sidebar-items-admin'] })
    },
  })
}

export function useDeleteSidebarItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sidebarApi.deleteSidebarItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar'] })
      queryClient.invalidateQueries({ queryKey: ['sidebar-items-admin'] })
    },
  })
}
