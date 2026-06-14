import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasPermission, hasAnyPermission } from '@/lib/auth/permissions'

export function usePermission(slug: string): boolean {
  const { authorization } = useAuth()
  return useMemo(() => hasPermission(authorization, slug), [authorization, slug])
}

export function useAnyPermission(slugs: string[]): boolean {
  const { authorization } = useAuth()
  return useMemo(() => hasAnyPermission(authorization, slugs), [authorization, slugs])
}
