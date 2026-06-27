import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { graphemeSegments, isEmojiGrapheme } from '@/shared/lib/emoji/animated-emoji'

export const LIKE_MESSAGE_EMOJI = '👍'

export function isDirectThread(thread?: Pick<DmThreadSummary, 'kind' | 'isGroup'> | null) {
  return thread?.kind === 'direct' || !thread?.isGroup
}

export function getThreadDisplayName(thread?: Pick<DmThreadSummary, 'title' | 'otherName'> | null) {
  return thread?.title ?? thread?.otherName ?? 'Chat'
}

export function getThreadAvatarUrl(
  thread?: Pick<DmThreadSummary, 'avatarUrl' | 'otherAvatarThumbnailUrl' | 'otherAvatarUrl'> | null,
) {
  return thread?.otherAvatarThumbnailUrl ?? thread?.otherAvatarUrl ?? thread?.avatarUrl
}

export function getThreadPreviewText(thread: DmThreadSummary) {
  const prefix = thread.subtitle && !isDirectThread(thread) ? `${thread.subtitle} · ` : ''
  return `${prefix}${thread.lastMessageBody || 'Start a conversation'}`
}

export function getThreadPresenceLabel(
  thread: Pick<DmThreadSummary, 'subtitle' | 'memberCount' | 'otherIsOnline' | 'kind' | 'isGroup'> | null | undefined,
  typingCount: number,
) {
  const isDirect = isDirectThread(thread)

  if (typingCount > 0) return 'Typing…'
  if (isDirect && thread?.otherIsOnline) return 'Active now'
  return thread?.subtitle ?? (isDirect ? 'Offline' : `${thread?.memberCount ?? 0} members`)
}

export function formatMessengerTime(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatMessageDaySeparator(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function createClientMessageId() {
  return crypto.randomUUID()
}

export function isStandaloneEmojiMessage(
  message: Pick<DmMessage, 'type' | 'body' | 'mediaUrl' | 'forwardFromId' | 'shareData' | 'linkPreview'>,
) {
  if (
    message.type !== 'text' ||
    !message.body.trim() ||
    message.mediaUrl ||
    message.forwardFromId ||
    message.shareData ||
    message.linkPreview
  ) {
    return false
  }

  const segments = graphemeSegments(message.body.trim())
  return segments.length === 1 && isEmojiGrapheme(segments[0]!)
}

export function isLikeMessage(
  message: Pick<DmMessage, 'type' | 'body' | 'mediaUrl' | 'forwardFromId' | 'shareData' | 'linkPreview'>,
) {
  return isStandaloneEmojiMessage(message) && message.body.trim() === LIKE_MESSAGE_EMOJI
}

export function getReplyPreviewText(preview: { body: string; type: string }) {
  if (preview.type === 'image') return 'Photo'
  if (preview.type === 'video') return 'Video'
  if (preview.type === 'file') return 'Attachment'
  return preview.body || 'Message'
}

export function getReplyHeaderLabel(options: {
  isOutgoing: boolean
  viewerId?: string | null
  otherName?: string
  senderName?: string
  quotedSenderId?: string
}) {
  const { isOutgoing, viewerId, otherName, senderName, quotedSenderId } = options
  if (!quotedSenderId) return 'Reply'

  const otherLabel = otherName ?? 'them'
  const senderLabel = senderName ?? otherName ?? 'User'

  if (isOutgoing) {
    if (quotedSenderId === viewerId) return 'You replied to yourself'
    return `You replied to ${otherLabel}`
  }

  if (quotedSenderId === viewerId) return `${senderLabel} replied to you`
  return `${senderLabel} replied to ${otherLabel}`
}
