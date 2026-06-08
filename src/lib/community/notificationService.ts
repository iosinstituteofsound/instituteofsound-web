import { isSupabaseConfigured } from '@/lib/api/liveMode'
import {
  v1GetNotifications,
  v1GetUnreadNotificationCount,
  v1MarkNotificationsRead,
} from '@/api/v1Phase4Client'
import {
  localListNotifications,
  localMarkNotificationsRead,
  localUnreadCount,
  type CommunityNotification,
  type NotificationKind,
} from '@/lib/community/localNotifications'

export type { CommunityNotification, NotificationKind }

export const COMMUNITY_NOTIFICATION_EVENT = 'ios-community-notification-change'

function notifyChange() {
  window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
}

export async function fetchNotifications(
  limit = 40,
  viewerUserId?: string
): Promise<CommunityNotification[]> {
  if (!isSupabaseConfigured()) return localListNotifications(limit, viewerUserId)

  const { notifications } = await v1GetNotifications(limit)
  return notifications
}

export async function fetchUnreadNotificationCount(viewerUserId?: string): Promise<number> {
  if (!isSupabaseConfigured()) return localUnreadCount(viewerUserId)

  const { count } = await v1GetUnreadNotificationCount()
  return count
}

export async function markNotificationsRead(ids?: string[], viewerUserId?: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localMarkNotificationsRead(ids, viewerUserId)
    notifyChange()
    return
  }

  await v1MarkNotificationsRead(ids)
  notifyChange()
}

export function notificationActorPath(n: CommunityNotification): string | null {
  if (n.href?.startsWith('/editor/')) return n.href
  if (!n.actorHandle) return null
  const h = n.actorHandle.replace(/^@/, '')
  return `/network/${h}`
}

/** Where the bell item should navigate (post detail for comments, etc.). */
export function notificationTargetHref(n: CommunityNotification): string {
  const href = n.href?.trim()
  if (href) return href.startsWith('/') ? href : `/${href}`
  if (n.kind === 'post_comment' || n.kind === 'dm_message') return '/feed'
  const actor = notificationActorPath(n)
  if (actor) return actor
  return '/community'
}
