import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export function getMessageDeliveryStatus(
  message: DmMessage,
  options?: { otherLastReadAt?: string | null },
): MessageDeliveryStatus {
  if (message.failed) return 'failed'
  // Still queued / request in flight — circular pending, not a tick.
  if (message.optimistic) return 'sending'
  if (message.readAt) return 'read'

  if (
    options?.otherLastReadAt &&
    new Date(options.otherLastReadAt).getTime() >= new Date(message.createdAt).getTime()
  ) {
    return 'read'
  }

  if (message.deliveredAt) return 'delivered'
  return 'sent'
}

export function getThreadListDeliveryStatus(
  thread: DmThreadSummary,
  viewerId?: string | null,
): MessageDeliveryStatus | null {
  if (!viewerId || !thread.lastMessageAt || thread.lastSenderId !== viewerId) {
    return null
  }

  if (
    thread.otherLastReadAt &&
    new Date(thread.otherLastReadAt).getTime() >= new Date(thread.lastMessageAt).getTime()
  ) {
    return 'read'
  }

  return 'delivered'
}

export function formatMessageBubbleTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function isGroupChatThread(
  thread?: { kind?: string; isGroup?: boolean } | null,
): boolean {
  if (!thread) return false
  if (thread.isGroup) return true
  return thread.kind != null && thread.kind !== 'direct'
}
