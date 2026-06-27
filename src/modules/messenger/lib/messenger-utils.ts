import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

export function getThreadDisplayName(thread?: Pick<DmThreadSummary, 'title' | 'otherName'> | null) {
  return thread?.title ?? thread?.otherName ?? 'Chat'
}

export function getThreadAvatarUrl(thread?: Pick<DmThreadSummary, 'avatarUrl' | 'otherAvatarThumbnailUrl' | 'otherAvatarUrl'> | null) {
  return thread?.otherAvatarThumbnailUrl ?? thread?.otherAvatarUrl ?? thread?.avatarUrl
}

export function formatMessageClockTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
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

export function formatMessageFullTimestamp(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

export function formatMessageDateSeparator(iso: string) {
  return formatMessageDaySeparator(iso)
}

export function groupMessagesByDate<T extends { createdAt: string }>(messages: T[]) {
  const groups: Array<{ key: string; label: string; items: T[] }> = []
  for (const message of messages) {
    const key = message.createdAt.slice(0, 10)
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.items.push(message)
    } else {
      groups.push({
        key,
        label: formatMessageDateSeparator(message.createdAt),
        items: [message],
      })
    }
  }
  return groups
}

export function createClientMessageId() {
  return crypto.randomUUID()
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
