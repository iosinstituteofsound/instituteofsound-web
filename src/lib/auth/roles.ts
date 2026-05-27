import type { UserRole } from './types'

export function isEditorStaff(role: UserRole): boolean {
  return role === 'editor' || role === 'super_editor'
}

export function isSuperEditor(role: UserRole): boolean {
  return role === 'super_editor'
}

export function isMember(role: UserRole): boolean {
  return role === 'member'
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'super_editor':
      return 'Super Editor'
    case 'editor':
      return 'Editor'
    case 'artist':
      return 'Artist'
    case 'member':
      return 'Member'
  }
}

/** Primary home after sign-in for each role */
export function homeDashboardPath(role: UserRole): string {
  if (isEditorStaff(role)) return '/editor/dashboard'
  if (role === 'artist') return '/artist/dashboard'
  return '/member/dashboard'
}

/** @deprecated Use homeDashboardPath */
export function editorDashboardPath(role: UserRole): string {
  return homeDashboardPath(role)
}
