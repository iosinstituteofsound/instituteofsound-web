import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
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

  const granted = await viaV1Api(
    async () => {
      const { granted: ok } = await v1GrantBadge(slug)
      return ok
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('community_grant_badge', {
        p_badge_slug: slug,
      })

      if (error) {
        console.warn('[community] grantBadge', slug, error.message)
        return false
      }

      return data === true
    },
  )

  if (granted) {
    window.dispatchEvent(new Event(COMMUNITY_BADGE_EVENT))
  }

  return granted
}
