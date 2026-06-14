import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'
import { hasResource, hasAnyResource } from '@/lib/auth/permissions'

interface ResourceGateProps {
  resource?: string
  anyResource?: string[]
  children: ReactNode
  fallback?: ReactNode
}

/** Show children only when user has the UI resource slug from Mongo RBAC. */
export function ResourceGate({ resource, anyResource, children, fallback = null }: ResourceGateProps) {
  const { authorization } = useAuth()
  const allowed = resource
    ? hasResource(authorization, resource)
    : anyResource
      ? hasAnyResource(authorization, anyResource)
      : true
  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}
