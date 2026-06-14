export type DmThreadStatus = 'pending' | 'accepted' | 'declined'

export interface DmThreadSummary {
  threadId: string
  status: DmThreadStatus
  /** True when the signed-in user opened this thread (request sender). */
  isRequester: boolean
  otherUserId: string
  otherName: string
  otherHandle: string
  otherAvatarUrl?: string
  lastMessageBody?: string
  lastMessageAt?: string
  lastSenderId?: string
  unreadCount: number
}

export interface DmThreadHeader {
  threadId: string
  status: DmThreadStatus
  isRequester: boolean
  otherUserId: string
  otherName: string
  otherHandle: string
  otherAvatarUrl?: string
}

export interface DmMessage {
  id: string
  senderId: string
  body: string
  createdAt: string
  readAt?: string
}
