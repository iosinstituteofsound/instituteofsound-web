import { memo } from 'react'
import {
  getMessengerStatusColor,
  getMessengerStatusLabel,
  getMessengerStatusTone,
  resolveMessengerPresenceStatus,
} from '@/modules/messenger/lib/messenger-status-visuals'
import { isDirectThread } from '@/modules/messenger/lib/messenger-utils'
import type { TypingPeerPhase } from '@/modules/messenger/store/messenger-live-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessengerThreadStatusProps = {
  thread?: DmThreadSummary | null
  isPeerTyping: boolean
  phase?: TypingPeerPhase | null
  className?: string
}

/** Status label only — visual indicator lives on the avatar badge. */
export const MessengerThreadStatus = memo(function MessengerThreadStatus({
  thread,
  isPeerTyping,
  phase,
  className,
}: MessengerThreadStatusProps) {
  const isDirect = isDirectThread(thread)
  const isOnline = Boolean(thread?.otherIsOnline)
  const status = resolveMessengerPresenceStatus(isPeerTyping, phase, isOnline)

  const resolved =
    !isDirect && (status === 'active' || status === 'inactive')
      ? ('inactive' as const)
      : status

  const label =
    !isDirect && (status === 'active' || status === 'inactive')
      ? thread?.kind === 'community'
        ? 'Community'
        : `${thread?.memberCount ?? 0} members`
      : getMessengerStatusLabel(resolved, {
          lastSeenAt: thread?.otherLastSeenAt,
        })

  const tone = getMessengerStatusTone(resolved)
  const color = isPeerTyping ? getMessengerStatusColor(resolved) : undefined

  return (
    <span
      className={cn(
        'messenger-thread-status',
        !isPeerTyping && 'messenger-thread-status--muted',
        isPeerTyping && `messenger-thread-status--${tone}`,
        className,
      )}
      style={color ? { color } : undefined}
    >
      <span className="messenger-thread-status__label">{label}</span>
    </span>
  )
})
