import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetNetworkProfileArtist } from '@/api/v1Client'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'

/** Published artist page slug for a profile owner, if any. */
export async function fetchArtistSlugForUserId(userId: string): Promise<string | null> {
  const meta = await fetchPublishedArtistMetaForUserId(userId)
  return meta?.slug ?? null
}

async function directFetchPublishedArtistMetaForUserId(
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id, slug')
    .eq('user_id', userId)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.warn('[artist] profile lookup', error.message)
    return null
  }
  const slug = data?.slug?.trim()
  if (!data?.id || !slug) return null
  return { id: String(data.id), slug }
}

/** Published artist profile id + slug for releases and artist page links. */
export async function fetchPublishedArtistMetaForUserId(
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  if (!isSupabaseConfigured()) return null
  return viaV1Api(
    async () => {
      const { artist } = await v1GetNetworkProfileArtist(userId)
      return artist
    },
    () => directFetchPublishedArtistMetaForUserId(userId),
  )
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
