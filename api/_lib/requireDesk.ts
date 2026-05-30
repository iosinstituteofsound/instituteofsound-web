import type { User } from '../../src/lib/auth/types.js'
import { fetchMemberProfile, type AuthContext } from './auth.js'

export async function requireSuperEditor(
  auth: AuthContext,
): Promise<{ profile: User } | { status: number; error: string }> {
  const profile = await fetchMemberProfile(auth)
  if (profile.role !== 'super_editor') {
    return { status: 403, error: 'IOS Support desk access required' }
  }
  return { profile }
}
