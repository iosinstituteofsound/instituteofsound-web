import type { LucideIcon } from 'lucide-react'
import { Circle, CircleHelp, Lightbulb, MessageCircleMore, Undo2 } from 'lucide-react'
import type { TypingPeerPhase } from '@/modules/messenger/store/messenger-live-store'

/**
 * Industry-standard presence / activity colors (Discord / Slack / Teams style).
 * Keep in sync with mobile `messenger-status-visuals.ts`.
 */
export const MESSENGER_STATUS_COLORS = {
  online: '#23A55A',
  idle: '#F0B232',
  reply: '#3B82F6',
  alert: '#F97316',
  offline: '#80848E',
} as const

export type MessengerPresenceStatus =
  | 'typing'
  | 'replying'
  | 'thinking'
  | 'confused'
  | 'active'
  | 'inactive'

export function resolveMessengerPresenceStatus(
  isPeerTyping: boolean,
  phase?: TypingPeerPhase | null,
  isOnline = false,
): MessengerPresenceStatus {
  if (isPeerTyping && phase) return phase
  if (isOnline) return 'active'
  return 'inactive'
}

export function getMessengerStatusLabel(
  status: MessengerPresenceStatus,
  options?: { lastSeenAt?: string | null },
): string {
  if (status === 'typing') return 'typing…'
  if (status === 'replying') return 'replying…'
  if (status === 'thinking') return 'thinking…'
  if (status === 'confused') return 'confused…'
  if (status === 'active') return 'Online'
  return formatMessengerLastSeen(options?.lastSeenAt)
}

/** WhatsApp-style last seen label. */
export function formatMessengerLastSeen(iso?: string | null): string {
  if (!iso) return 'Offline'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Offline'

  const now = new Date()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDiff = Math.round((startOfToday - startOfThatDay) / 86_400_000)

  if (dayDiff === 0) return `last seen today at ${time}`
  if (dayDiff === 1) return `last seen yesterday at ${time}`
  if (dayDiff > 1 && dayDiff < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' })
    return `last seen ${weekday} at ${time}`
  }

  const dateLabel = date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(now.getFullYear() === date.getFullYear() ? {} : { year: 'numeric' as const }),
  })
  return `last seen ${dateLabel}`
}

export function getMessengerStatusIcon(status: MessengerPresenceStatus): LucideIcon {
  if (status === 'typing') return MessageCircleMore
  if (status === 'replying') return Undo2
  if (status === 'thinking') return Lightbulb
  if (status === 'confused') return CircleHelp
  return Circle
}

export function getMessengerStatusColor(status: MessengerPresenceStatus): string {
  if (status === 'typing' || status === 'active') return MESSENGER_STATUS_COLORS.online
  if (status === 'replying') return MESSENGER_STATUS_COLORS.reply
  if (status === 'thinking') return MESSENGER_STATUS_COLORS.idle
  if (status === 'confused') return MESSENGER_STATUS_COLORS.alert
  return MESSENGER_STATUS_COLORS.offline
}

export function getMessengerStatusTone(
  status: MessengerPresenceStatus,
): 'online' | 'reply' | 'idle' | 'alert' | 'offline' {
  if (status === 'typing' || status === 'active') return 'online'
  if (status === 'replying') return 'reply'
  if (status === 'thinking') return 'idle'
  if (status === 'confused') return 'alert'
  return 'offline'
}
