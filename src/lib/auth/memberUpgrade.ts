import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchUserProfile } from '@/lib/auth/profile'
import type { User } from '@/lib/auth/types'
import { getUsers, saveUsers } from '@/lib/auth/storage'

export interface UpgradeToArtistInput {
  displayName: string
  slug?: string
}

export async function upgradeToArtist(
  user: User,
  input: UpgradeToArtistInput
): Promise<User> {
  const displayName = input.displayName.trim()
  if (!displayName) throw new Error('Artist / project name is required')

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.rpc('upgrade_to_artist', {
      p_display_name: displayName,
      p_slug: input.slug?.trim() || null,
    })
    if (error) throw new Error(error.message)
    return fetchUserProfile(user.id)
  }

  const users = getUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx < 0) throw new Error('User not found')
  users[idx] = {
    ...users[idx],
    role: 'artist',
    name: displayName,
  }
  saveUsers(users)
  const { passwordHash: _, ...publicUser } = users[idx]
  return publicUser
}
