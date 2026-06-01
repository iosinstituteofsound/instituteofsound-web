import { isSupabaseConfigured } from '@/lib/supabase/client'
import { v1UpgradeToArtist } from '@/api/v1Phase4Client'
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
    const { user: updated } = await v1UpgradeToArtist({
      displayName,
      slug: input.slug?.trim() || undefined,
    })
    return updated
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
