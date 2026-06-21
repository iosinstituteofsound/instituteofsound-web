import type { UserAuthorization } from '@/shared/types/auth.types'

export const SUPER_ADMIN_SLUG = 'super_admin'

export function resolveIsSuperAdmin(
  authorization: Pick<UserAuthorization, 'isSuperAdmin' | 'assignedRoles' | 'roles' | 'permissions'>,
): boolean {
  if (authorization.isSuperAdmin) return true
  if (authorization.permissions?.includes('*.*')) return true
  if (authorization.assignedRoles?.some((role) => role.slug === SUPER_ADMIN_SLUG)) return true
  if (authorization.roles?.some((role) => role.slug === SUPER_ADMIN_SLUG)) return true
  return false
}
