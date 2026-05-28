import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
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

type NotificationRow = {
  id: string
  kind: string
  title: string
  body: string | null
  href: string | null
  actor_id: string | null
  actor_name: string | null
  actor_handle: string | null
  actor_avatar_url: string | null
  read_at: string | null
  created_at: string
}

function mapRow(row: NotificationRow): CommunityNotification {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body ?? undefined,
    href: row.href ?? undefined,
    actorId: row.actor_id ?? undefined,
    actorName: row.actor_name ?? undefined,
    actorHandle: row.actor_handle ?? undefined,
    actorAvatarUrl: row.actor_avatar_url ?? undefined,
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchNotifications(limit = 40): Promise<CommunityNotification[]> {
  if (!isSupabaseConfigured()) return localListNotifications(limit)

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_notifications_list', { lim: limit })

  if (error) {
    console.warn('[community] notifications', error.message)
    return []
  }

  return (data ?? []).map(mapRow)
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  if (!isSupabaseConfigured()) return localUnreadCount()

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_notifications_unread_count')

  if (error) {
    console.warn('[community] unread', error.message)
    return 0
  }

  return Number(data ?? 0)
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    localMarkNotificationsRead(ids)
    notifyChange()
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_notifications_mark_read', {
    p_ids: ids?.length ? ids : null,
  })

  if (error) throw new Error(error.message)
  notifyChange()
}

export function notificationActorPath(n: CommunityNotification): string | null {
  if (n.href?.startsWith('/editor/')) return n.href
  if (!n.actorHandle) return null
  const h = n.actorHandle.replace(/^@/, '')
  return `/network/${h}`
}
