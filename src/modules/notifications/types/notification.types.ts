/** Mirror instituteofsound-api notification types — keep in sync. */

export type NotificationKind =
  | 'track_listen'
  | 'track_like'
  | 'track_qualified'
  | 'follow'
  | 'post_comment'
  | 'comment_reply'
  | 'mention'
  | 'dm_message'

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
    actorUsername?: string
    actorAvatarUrl?: string
    trackTitle?: string
    feedItemId?: string
    commentId?: string
    threadId?: string
    messageId?: string
  }
}

export type NotificationListDto = {
  items: NotificationDto[]
  unreadCount: number
}

export const REALTIME_NOTIFICATION_EVENT = 'notification:new' as const
