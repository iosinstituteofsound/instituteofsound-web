import type { UserRole } from './types'

export function isEditorStaff(role: UserRole): boolean {
  return role === 'editor' || role === 'super_editor'
}

export function isSuperEditor(role: UserRole): boolean {
  return role === 'super_editor'
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'super_editor':
      return 'Super Editor'
    case 'editor':
      return 'Editor'
    case 'artist':
      return 'Artist'
  }
}

export function editorDashboardPath(role: UserRole): string {
  return isEditorStaff(role) ? '/editor/dashboard' : '/artist/dashboard'
}
