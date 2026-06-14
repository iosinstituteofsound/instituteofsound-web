import { create } from 'zustand'
import type { UserAuthorization } from '@/shared/types/auth.types'
import type { SidebarMenuItemDto } from '@/shared/types/sidebar.types'
import { toPermissionSlug, type PermissionAction } from '@/shared/services/permission/permission.service'

interface PermissionState {
  permissions: string[]
  resourceNames: string[]
  sidebarPaths: string[]
  isSuperAdmin: boolean
  hydrated: boolean
  sidebarSynced: boolean
  hydrate: (authorization: UserAuthorization) => void
  syncFromSidebarItems: (items: SidebarMenuItemDto[]) => void
  reset: () => void
}

const initialState = {
  permissions: [] as string[],
  resourceNames: [] as string[],
  sidebarPaths: [] as string[],
  isSuperAdmin: false,
  hydrated: false,
  sidebarSynced: false,
}

export const usePermissionStore = create<PermissionState>((set) => ({
  ...initialState,
  hydrate: (authorization) =>
    set({
      permissions: authorization.permissions ?? [],
      resourceNames: authorization.resourceNames ?? [],
      sidebarPaths: [],
      isSuperAdmin: authorization.isSuperAdmin ?? false,
      hydrated: true,
      sidebarSynced: false,
    }),
  syncFromSidebarItems: (items) =>
    set((state) => {
      const resourceNames = items
        .map((item) => item.resourceName)
        .filter((name): name is string => Boolean(name))
      const permissions = items.flatMap((item) => {
        if (!item.permissionResource || !item.permissionAction) return []
        return [toPermissionSlug(item.permissionResource, item.permissionAction as PermissionAction)]
      })
      const sidebarPaths = items.map((item) => item.path)

      return {
        resourceNames: [...new Set([...state.resourceNames, ...resourceNames])],
        permissions: [...new Set([...state.permissions, ...permissions])],
        sidebarPaths,
        sidebarSynced: true,
      }
    }),
  reset: () => set({ ...initialState }),
}))