import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  localIsFollowing,
  localListFollowing,
  localToggleFollow,
} from '@/lib/community/localFollow'
import {
  localAddNotification,
  type NotificationKind,
} from '@/lib/community/localNotifications'

export const COMMUNITY_FOLLOW_EVENT = 'ios-community-follow-change'

function notifyFollow() {
  window.dispatchEvent(new Event(COMMUNITY_FOLLOW_EVENT))
}

export function getLocalFollowingIds(): string[] {
  return localListFollowing()
}

export async function toggleFollow(targetUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const following = localToggleFollow(targetUserId)
    if (following) {
      localAddNotification({
        kind: 'follow' as NotificationKind,
        title: 'New follower (demo)',
        body: 'Follow saved locally',
        href: '/community',
      })
    }
    notifyFollow()
    return following
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_toggle_follow', {
    p_target_user_id: targetUserId,
  })

  if (error) throw new Error(error.message)
  notifyFollow()
  return Boolean(data)
}

export async function isFollowingUser(targetUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return localIsFollowing(targetUserId)

  const supabase = getSupabase()
  const { data: session } = await supabase.auth.getSession()
  const uid = session.session?.user?.id
  if (!uid) return false

  const { data, error } = await supabase
    .from('community_follows')
    .select('follower_id')
    .eq('follower_id', uid)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (error) {
    console.warn('[community] follow check', error.message)
    return false
  }
  return Boolean(data)
}
