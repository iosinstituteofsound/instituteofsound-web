import type { UserAuthorization } from './types'
import { matchPermission } from './roles'

export function hasResource(
  authorization: UserAuthorization | undefined,
  resourceSlug: string,
): boolean {
  if (!authorization) return false
  if (authorization.isSuperAdmin) return true
  return authorization.resourceSlugs?.includes(resourceSlug) ?? false
}

export function hasAnyResource(
  authorization: UserAuthorization | undefined,
  slugs: string[],
): boolean {
  return slugs.some((s) => hasResource(authorization, s))
}

export function hasScope(
  authorization: UserAuthorization | undefined,
  scopeSlug: string,
): boolean {
  if (!authorization) return false
  if (authorization.isSuperAdmin) return true
  if (authorization.scopeSlugs?.includes(scopeSlug)) return true
  return matchPermission(authorization.permissions, scopeSlug)
}

export { hasPermission, hasAnyPermission, isSuperAdmin, hasEditorialAccess, hasArtistAccess } from './roles'
