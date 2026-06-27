import { usePermissionStore } from '@/app/stores/permission-store'
import {
  canAccess,
  canAccessAll,
  canAccessAny,
  type PermissionAction,
} from '@/shared/services/permission/permission.service'
import {
  hasAnyResource,
  hasResource,
} from '@/shared/services/permission/resource.service'
import type { ResourceType } from '@/shared/lib/resource-registry'

export function usePermission() {
  const permissions = usePermissionStore((s) => s.permissions)
  const resourceNames = usePermissionStore((s) => s.resourceNames)
  const sidebarPaths = usePermissionStore((s) => s.sidebarPaths)
  const isSuperAdmin = usePermissionStore((s) => s.isSuperAdmin)
  const hydrated = usePermissionStore((s) => s.hydrated)
  const sidebarSynced = usePermissionStore((s) => s.sidebarSynced)

  return {
    hydrated,
    sidebarSynced,
    isSuperAdmin,
    sidebarPaths,
    can: (resource: string, action: PermissionAction) =>
      canAccess(permissions, isSuperAdmin, resource, action),
    canAny: (checks: Array<[string, PermissionAction]>) =>
      canAccessAny(permissions, isSuperAdmin, checks),
    canAll: (checks: Array<[string, PermissionAction]>) =>
      canAccessAll(permissions, isSuperAdmin, checks),
    hasResource: (name: string, type: ResourceType = 'PAGE') =>
      hasResource(resourceNames, isSuperAdmin, name, type),
    hasAnyResource: (names: string[], type: ResourceType = 'PAGE') =>
      hasAnyResource(resourceNames, isSuperAdmin, names, type),
    canAccessPath: (path: string) =>
      sidebarPaths.some(
        (itemPath) => path === itemPath || path.startsWith(`${itemPath}/`),
      ),
  }
}