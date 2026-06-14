import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1IsFollowing, v1ToggleFollow } from '@/api/v1Phase4Client'
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

  const { following } = await v1ToggleFollow(targetUserId)
  notifyFollow()
  return following
}

export async function isFollowingUser(targetUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return localIsFollowing(targetUserId)
  const { following } = await v1IsFollowing(targetUserId)
  return following
}
