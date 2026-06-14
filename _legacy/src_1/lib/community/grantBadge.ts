import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GrantBadge } from '@/api/v1Phase5Client'
import { localGrantBadge } from '@/lib/community/localCommunity'
import type { CommunityBadgeSlug } from '@/lib/community/badges'

export const COMMUNITY_BADGE_EVENT = 'ios-community-badge-change'

export async function tryGrantBadge(slug: CommunityBadgeSlug): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const granted = localGrantBadge(slug)
    if (granted) window.dispatchEvent(new Event(COMMUNITY_BADGE_EVENT))
    return granted
  }

  const { granted: ok } = await v1GrantBadge(slug)
  if (ok) window.dispatchEvent(new Event(COMMUNITY_BADGE_EVENT))
  return ok
}
