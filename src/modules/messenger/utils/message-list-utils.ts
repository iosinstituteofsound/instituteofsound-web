import { formatMessageDaySeparator } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export type MessageListRow =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'system'; id: string; body: string }
  | {
      kind: 'message'
      id: string
      message: DmMessage
      isStacked: boolean
      isTail: boolean
      showAvatar: boolean
    }

export function getMessageReceiptLabel(message: DmMessage): string {
  if (message.optimistic) return 'Sending…'
  if (message.failed) return 'Failed'
  if (message.readAt) return 'Seen'
  if (message.deliveredAt) return 'Delivered'
  return 'Sent'
}

export function buildMessageListRows(
  messages: DmMessage[],
  viewerId?: string | null,
): MessageListRow[] {
  const rows: MessageListRow[] = []
  let lastDayKey = ''

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index]!
    const dayKey = message.createdAt.slice(0, 10)

    if (dayKey !== lastDayKey) {
      lastDayKey = dayKey
      rows.push({
        kind: 'day',
        id: `day-${dayKey}-${index}`,
        label: formatMessageDaySeparator(message.createdAt),
      })
    }

    if (message.type === 'system') {
      rows.push({ kind: 'system', id: message.id, body: message.body })
      continue
    }

    const prev = index > 0 ? messages[index - 1] : null
    const next = index < messages.length - 1 ? messages[index + 1] : null
    const isOutgoing = message.senderId === viewerId
    const isStacked = Boolean(
      prev &&
        prev.type !== 'system' &&
        prev.senderId === message.senderId &&
        prev.createdAt.slice(0, 10) === dayKey &&
        prev.reactions.length === 0,
    )
    const isTail =
      !next ||
      next.type === 'system' ||
      next.senderId !== message.senderId ||
      next.createdAt.slice(0, 10) !== dayKey
    const showAvatar = !isOutgoing && !isStacked

    rows.push({
      kind: 'message',
      id: message.id,
      message,
      isStacked,
      isTail,
      showAvatar,
    })
  }

  return rows
}

export function getLastOutgoingMessageId(
  messages: DmMessage[],
  viewerId?: string | null,
): string | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message && message.senderId === viewerId && message.type !== 'system') {
      return message.id
    }
  }
  return undefined
}
