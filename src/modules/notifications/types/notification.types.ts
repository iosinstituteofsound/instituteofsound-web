/** Mirror instituteofsound-api notification types — keep in sync. */

export type NotificationKind = 'track_listen' | 'track_like' | 'track_qualified'

export type NotificationDto = {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body: string
  readAt: string | null
  createdAt: string
  data: {
    trackId?: string
    releaseId?: string
    artistProfileId?: string
    actorUserId?: string
    actorName?: string
    trackTitle?: string
  }
}

export type NotificationListDto = {
  items: NotificationDto[]
  unreadCount: number
}

export const REALTIME_NOTIFICATION_EVENT = 'notification:new' as const
