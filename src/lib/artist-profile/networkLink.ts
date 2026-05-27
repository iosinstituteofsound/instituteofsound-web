import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'

/** Published artist page slug for a profile owner, if any. */
export async function fetchArtistSlugForUserId(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('slug')
    .eq('user_id', userId)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.warn('[artist] slug lookup', error.message)
    return null
  }
  return data?.slug?.trim() || null
}

/** Network handle for artist page owner. */
export async function fetchNetworkHandleForUserId(
  userId: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return memberHandleFromUser({
    username: data.username ?? undefined,
    email: data.email ?? '',
  })
}

export function artistPagePath(slug: string): string {
  return `/artist/${encodeURIComponent(slug)}`
}

export function networkPathForUser(
  handle: string | null | undefined,
  user?: { username?: string; email: string }
): string | null {
  if (handle) return networkProfilePath(handle)
  if (user) return networkProfilePath(memberHandleFromUser(user))
  return null
}
