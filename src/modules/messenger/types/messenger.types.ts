export type DmThreadStatus = 'pending' | 'accepted' | 'declined'

export type DmMessageType = 'text' | 'image' | 'video' | 'file' | 'system'

export type MessengerFilter = 'all' | 'unread' | 'groups' | 'communities'

export type DmReaction = {
  userId: string
  emoji: string
}

export type DmMessage = {
  id: string
  threadId: string
  senderId: string
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
  status: DmThreadStatus
  isRequester: boolean
  otherUserId: string
  otherName: string
  otherHandle?: string
  otherAvatarUrl?: string
  otherAvatarThumbnailUrl?: string
  otherIsOnline?: boolean
  lastMessageBody?: string
  lastMessageAt?: string
  lastSenderId?: string
  unreadCount: number
  isGroup: boolean
}

export type DmThreadHeader = {
  threadId: string
  status: DmThreadStatus
  isRequester: boolean
  otherUserId: string
  otherName: string
  otherHandle?: string
  otherAvatarUrl?: string
  otherAvatarThumbnailUrl?: string
  otherIsOnline?: boolean
}

export const MESSENGER_MESSAGE_EVENT = 'messenger:message'
export const MESSENGER_MESSAGE_UPDATED_EVENT = 'messenger:message:updated'
export const MESSENGER_TYPING_EVENT = 'messenger:typing'
export const MESSENGER_READ_EVENT = 'messenger:read'
export const MESSENGER_THREAD_EVENT = 'messenger:thread:updated'
export const MESSENGER_PRESENCE_EVENT = 'messenger:presence'

export type MessengerTypingPayload = {
  threadId: string
  userId: string
  isTyping: boolean
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
}
