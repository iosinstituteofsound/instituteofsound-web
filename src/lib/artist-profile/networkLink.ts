import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetNetworkProfileArtist, v1GetNetworkProfileHandle } from '@/api/v1Client'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'

/** Published artist page slug for a profile owner, if any. */
export async function fetchArtistSlugForUserId(userId: string): Promise<string | null> {
  const meta = await fetchPublishedArtistMetaForUserId(userId)
  return meta?.slug ?? null
}

/** Published artist profile id + slug for releases and artist page links. */
export async function fetchPublishedArtistMetaForUserId(
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  if (!isSupabaseConfigured()) return null
  const { artist } = await v1GetNetworkProfileArtist(userId)
  return artist
}

/** Network handle for artist page owner. */
export async function fetchNetworkHandleForUserId(
  userId: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const { handle } = await v1GetNetworkProfileHandle(userId)
  return handle
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
