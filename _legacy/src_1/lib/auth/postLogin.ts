import type { User } from './types'
import { hasArtistAccess, hasEditorialAccess, homeDashboardPath, isSuperAdmin } from './roles'
import type { EditorApplication } from '@/lib/editor-applications/types'

export type OAuthIntent = 'member' | 'artist' | 'desk' | 'editor_apply' | null

export function resolvePostLoginPath(
  user: User,
  intent: OAuthIntent,
  application: EditorApplication | null,
): string {
  const auth = user.authorization

  if (isSuperAdmin(auth) || hasEditorialAccess(auth)) return '/editor/dashboard'

  if (intent === 'desk') return '/desk'

  if (intent === 'editor_apply' || application?.status === 'pending') {
    return '/editor/apply'
  }

  if (application?.status === 'rejected') return '/editor/apply'

  if (intent === 'artist' && !hasArtistAccess(auth)) {
    return '/member/upgrade'
  }

  return homeDashboardPath(auth)
}
