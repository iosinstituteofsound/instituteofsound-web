import type { UserRole } from './types'

/** Blocked for regular editors; super editors can claim (e.g. @ios for the desk) */
const RESERVED = new Set([
  'admin',
  'editor',
  'ios',
  'institute',
  'support',
  'help',
  'api',
  'www',
  'desk',
  'artist',
  'discover',
])

export function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32)
}

export function validateUsername(
  username: string,
  options?: { role?: UserRole }
): string | null {
  const u = normalizeUsername(username)
  if (u.length < 3) return 'Username must be at least 3 characters (letters, numbers, underscore).'
  if (RESERVED.has(u) && options?.role !== 'super_editor') {
    return 'This username is reserved. IOS Support staff can claim brand handles like @ios.'
  }
  return null
}

export function suggestUsernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'editor'
  const base = normalizeUsername(local) || 'editor'
  return base.length >= 3 ? base : `${base}ios`.slice(0, 32)
}
