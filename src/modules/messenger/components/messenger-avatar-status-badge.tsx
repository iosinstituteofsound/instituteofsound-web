import { memo } from 'react'
import {
  getMessengerStatusColor,
  getMessengerStatusIcon,
  type MessengerPresenceStatus,
} from '@/modules/messenger/lib/messenger-status-visuals'
import { cn } from '@/shared/lib/cn'

type MessengerAvatarStatusBadgeProps = {
  status: MessengerPresenceStatus
  className?: string
}

/** Presence / activity indicator on the chat avatar only. */
export const MessengerAvatarStatusBadge = memo(function MessengerAvatarStatusBadge({
  status,
  className,
}: MessengerAvatarStatusBadgeProps) {
  const Icon = getMessengerStatusIcon(status)
  const color = getMessengerStatusColor(status)
  const isPresenceOnly = status === 'active' || status === 'inactive'

  return (
    <span
      className={cn(
        'messenger-avatar-status',
        isPresenceOnly && 'messenger-avatar-status--dot',
        status === 'inactive' && 'messenger-avatar-status--inactive',
        className,
      )}
      style={{ backgroundColor: color }}
      aria-label={status}
    >
      {isPresenceOnly ? null : <Icon className="messenger-avatar-status__icon" aria-hidden />}
    </span>
  )
})
