import type { UserAuthorization } from './types'

/** Wildcard-aware permission check for client-side UX gating (API is authoritative). */
export function matchPermission(holding: string[], required: string): boolean {
  if (holding.includes('*.*') || holding.includes(required)) return true
  if (required.endsWith('.*')) {
    const prefix = required.slice(0, -1)
    return holding.some((p) => p.startsWith(prefix))
  }
  return holding.some((p) => {
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -1)
      return required.startsWith(prefix)
    }
    return false
  })
}

export function hasPermission(
  authorization: UserAuthorization | undefined,
  slug: string,
): boolean {
  if (!authorization) return false
  if (authorization.isSuperAdmin) return true
  return matchPermission(authorization.permissions, slug)
}

export function hasAnyPermission(
  authorization: UserAuthorization | undefined,
  slugs: string[],
): boolean {
  return slugs.some((s) => hasPermission(authorization, s))
}

export function isSuperAdmin(authorization: UserAuthorization | undefined): boolean {
  return authorization?.isSuperAdmin === true
}

export function hasEditorialAccess(authorization: UserAuthorization | undefined): boolean {
  return hasAnyPermission(authorization, [
    'submissions.review',
    'articles.view',
    'articles.create',
    'permissions.manage',
  ])
}

export function hasArtistAccess(authorization: UserAuthorization | undefined): boolean {
  return hasAnyPermission(authorization, ['artist.view', 'artist.edit'])
}

export function homeDashboardPath(authorization?: UserAuthorization): string {
  if (hasEditorialAccess(authorization)) return '/editor/dashboard'
  if (hasArtistAccess(authorization)) return '/artist/dashboard'
  return '/member/dashboard'
}

export function roleLabel(authorization?: UserAuthorization): string {
  if (isSuperAdmin(authorization)) return 'Super Admin'
  const first = authorization?.roles[0]?.name
  return first ?? 'Member'
}
