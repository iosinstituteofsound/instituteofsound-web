import type { ReactNode } from 'react'
import { usePermission, useAnyPermission } from '@/hooks/usePermission'

type Props = {
  permission?: string
  anyPermission?: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, anyPermission, children, fallback = null }: Props) {
  const single = usePermission(permission ?? '')
  const any = useAnyPermission(anyPermission ?? [])

  const allowed = permission ? single : anyPermission ? any : false
  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}
