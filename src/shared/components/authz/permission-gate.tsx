import type { PermissionAction } from '@/shared/services/permission/permission.service'
import { usePermission } from '@/shared/hooks/use-permission'

interface PermissionGateProps {
  resource: string
  action: PermissionAction
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ resource, action, children, fallback = null }: PermissionGateProps) {
  const { can } = usePermission()
  if (!can(resource, action)) return <>{fallback}</>
  return <>{children}</>
}
