import { memo } from 'react'
import { ThreadRowAvatar } from '@/modules/messenger/components/thread-row-avatar'
import { ThreadListDeliveryTicks } from '@/modules/messenger/components/thread-list-delivery-ticks'
import {
  formatMessengerTime,
  getThreadDisplayName,
  getThreadPreviewText,
} from '@/modules/messenger/lib/messenger-utils'
import { getThreadListDeliveryStatus } from '@/modules/messenger/utils/message-delivery-utils'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'
import { cn } from '@/shared/lib/cn'

type ThreadListRowProps = {
  thread: DmThreadSummary
  variant: 'sidebar' | 'popover'
  active?: boolean
  viewerId?: string
  viewerAvatar?: string
  onSelect: (threadId: string) => void
}

export const ThreadListRow = memo(function ThreadListRow({
  thread,
  variant,
  active = false,
  viewerId,
  onSelect,
}: ThreadListRowProps) {
  const authViewerId = useAuthStore((state) => state.userId)
  const resolvedViewerId = viewerId ?? authViewerId
  const displayName = getThreadDisplayName(thread)
  const deliveryStatus = getThreadListDeliveryStatus(thread, resolvedViewerId)

  const button = (
    <button
      type="button"
      className={cn(
        variant === 'sidebar' && 'messenger-thread-item',
        variant === 'sidebar' && active && 'is-active',
        variant === 'sidebar' && thread.unreadCount > 0 && 'has-unread',
        variant === 'popover' && 'ios-messenger-popover__item',
        variant === 'popover' && thread.unreadCount > 0 && 'is-unread',
      )}
      onClick={() => onSelect(thread.threadId)}
    >
      <ThreadRowAvatar thread={thread} />

      {variant === 'sidebar' ? (
        <>
          <div className="min-w-0">
            <div className="messenger-thread-item__name">{displayName}</div>
            <div className="messenger-thread-item__preview-row">
              {deliveryStatus ? <ThreadListDeliveryTicks status={deliveryStatus} /> : null}
              <div className="messenger-thread-item__preview">{getThreadPreviewText(thread)}</div>
            </div>
          </div>
          <div className="messenger-thread-item__meta">
            <span>{formatMessengerTime(thread.lastMessageAt)}</span>
            {thread.unreadCount > 0 ? (
              <span className="messenger-unread-dot" aria-label="Unread" />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="ios-messenger-popover__copy">
            <div className="ios-messenger-popover__name">{displayName}</div>
            <div className="ios-messenger-popover__preview-row">
              {deliveryStatus ? <ThreadListDeliveryTicks status={deliveryStatus} /> : null}
              <span className="ios-messenger-popover__preview">
                {thread.lastMessageBody || 'Start a conversation'}
              </span>
              {thread.lastMessageAt ? (
                <span
                  className={cn(
                    'ios-messenger-popover__time',
                    thread.unreadCount > 0 && 'is-unread',
                  )}
                >
                  · {formatMessengerTime(thread.lastMessageAt)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="ios-messenger-popover__side">
            {thread.unreadCount > 0 ? (
              <span className="ios-messenger-popover__unread-dot" aria-label="Unread" />
            ) : null}
          </div>
        </>
      )}
    </button>
  )

  if (variant === 'popover') {
    return <li>{button}</li>
  }

  return button
})
