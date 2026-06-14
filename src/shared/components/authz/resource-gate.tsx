import type { ResourceType } from '@/shared/lib/resource-registry'
import { usePermission } from '@/shared/hooks/use-permission'

interface ResourceGateProps {
  name: string
  type?: ResourceType
  children: React.ReactNode
  fallback?: React.ReactNode
}

/** Show children only when the user has the resource and it matches a registered web component. */
export function ResourceGate({ name, type = 'PAGE', children, fallback = null }: ResourceGateProps) {
  const { hasResource } = usePermission()
  if (!hasResource(name, type)) return <>{fallback}</>
  return <>{children}</>
}

interface ResourceAnyGateProps {
  names: string[]
  type?: ResourceType
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ResourceAnyGate({ names, type = 'PAGE', children, fallback = null }: ResourceAnyGateProps) {
  const { hasAnyResource } = usePermission()
  if (!hasAnyResource(names, type)) return <>{fallback}</>
  return <>{children}</>
}
