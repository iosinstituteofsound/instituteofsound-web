import type { User } from './types'
import { homeDashboardPath, isEditorStaff, isSuperEditor } from './roles'
import type { EditorApplication } from '@/lib/editor-applications/types'

export type OAuthIntent = 'member' | 'artist' | 'desk' | 'editor_apply' | null

export function resolvePostLoginPath(
  user: User,
  intent: OAuthIntent,
  application: EditorApplication | null
): string {
  if (isSuperEditor(user.role)) return '/editor/dashboard'
  if (isEditorStaff(user.role)) return '/editor/dashboard'

  if (intent === 'desk') return '/desk'

  if (intent === 'editor_apply' || application?.status === 'pending') {
    return '/editor/apply'
  }

  if (application?.status === 'rejected') return '/editor/apply'

  if (intent === 'artist' && user.role === 'member') {
    return '/member/upgrade'
  }

  return homeDashboardPath(user.role)
}
