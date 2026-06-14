import { useQuery } from '@tanstack/react-query'
import * as permissionApi from '@/modules/permissions/api/permission.api'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: permissionApi.getPermissions,
  })
}

export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: () => permissionApi.getAuditLogs(limit),
  })
}

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: permissionApi.getCatalog,
  })
}
