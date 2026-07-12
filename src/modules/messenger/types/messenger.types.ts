/** Mirror instituteofsound-api messaging types — keep in sync. */

export type DmThreadStatus = 'pending' | 'accepted' | 'declined'

export type ThreadKind = 'direct' | 'group' | 'community' | 'alliance'

export type DmMessageType = 'text' | 'image' | 'video' | 'file' | 'system' | 'share_card' | 'call'

export type DmCallLogStatus =
  | 'completed'
  | 'missed'
  | 'declined'
  | 'cancelled'
  | 'busy'
  | 'failed'

export type DmCallData = {
  callId: string
  mediaMode: 'voice' | 'video'
  initiatorId: string
  status: DmCallLogStatus
  durationSec?: number
}

export type MessengerFilter = 'all' | 'unread' | 'groups' | 'communities' | 'alliances' | 'requests'

export type DmReaction = {
  userId: string
  emoji: string
}

export type DmLinkPreview = {
  url: string
  title?: string
  imageUrl?: string
  description?: string
}

export type DmShareData = {
  releaseId?: string
  trackId?: string
  profileId?: string
  title?: string
  imageUrl?: string
  href?: string
}

export type ThreadMemberPreview = {
  userId: string
  name: string
  avatarUrl?: string
  avatarThumbnailUrl?: string
}

export type DmMessage = {
  id: string
  threadId: string
  senderId: string
  senderName?: string
  type: DmMessageType
  body: string
  mediaUrl?: string
  mediaMimeType?: string
  mediaFileName?: string
  replyToId?: string
  replyPreview?: {
    id: string
    senderId: string
    body: string
    type: DmMessageType
  }
  forwardFromId?: string
  linkPreview?: DmLinkPreview
  shareData?: DmShareData
  callData?: DmCallData
  reactions: DmReaction[]
  clientMessageId?: string
  deliveredAt?: string
  readAt?: string
  editedAt?: string
  deletedAt?: string
  createdAt: string
  optimistic?: boolean
  failed?: boolean
}

export type DmThreadSummary = {
  threadId: string
  kind: ThreadKind
  title: string
  subtitle?: string
  avatarUrl?: string
  memberPreview?: ThreadMemberPreview[]
  memberCount?: number
  unreadCount: number
  lastMessageBody?: string
  lastMessageAt?: string
  lastSenderId?: string
  lastSenderName?: string
  isPendingRequest?: boolean
  isArchived?: boolean
  isMuted?: boolean
  isGroup: boolean
  status?: DmThreadStatus
  isRequester?: boolean
  otherUserId?: string
  otherName?: string
  otherHandle?: string
  otherAvatarUrl?: string
  otherAvatarThumbnailUrl?: string
  otherIsOnline?: boolean
  /** ISO — peer last seen when offline. */
  otherLastSeenAt?: string
  communitySlug?: string
  tribeId?: string
  otherLastReadAt?: string
}

export const MESSENGER_MESSAGE_EVENT = 'messenger:message'
export const MESSENGER_MESSAGE_UPDATED_EVENT = 'messenger:message:updated'
export const MESSENGER_TYPING_EVENT = 'messenger:typing'
export const MESSENGER_READ_EVENT = 'messenger:read'
export const MESSENGER_THREAD_EVENT = 'messenger:thread:updated'
export const MESSENGER_PRESENCE_EVENT = 'messenger:presence'
export const MESSENGER_PRESENCE_SYNC_EVENT = 'messenger:presence:sync'
export const PRESENCE_HEARTBEAT_EVENT = 'presence:heartbeat'

export type MessengerTypingMode = 'typing' | 'replying'

export type MessengerTypingPayload = {
  threadId: string
  userId: string
  isTyping: boolean
  mode?: MessengerTypingMode
  isReplying?: boolean
}

export type MessengerReadPayload = {
  threadId: string
  userId: string
  readAt: string
  lastReadMessageId?: string
}

export type MessengerPresencePayload = {
  userId: string
  isOnline: boolean
  lastSeenAt?: string
}

export type MessengerPresenceSyncPayload = {
  users: MessengerPresencePayload[]
}

export type DmThreadListBucket = 'inbox' | 'requests' | 'archived'
