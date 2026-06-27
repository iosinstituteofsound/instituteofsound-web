import { memo } from 'react'
import { ThreadRowAvatar } from '@/modules/messenger/components/thread-row-avatar'
import {
  formatMessengerTime,
  getThreadDisplayName,
  getThreadPreviewText,
} from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
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
  viewerAvatar,
  onSelect,
}: ThreadListRowProps) {
  const displayName = getThreadDisplayName(thread)
  const sentByViewer = Boolean(viewerId && thread.lastSenderId === viewerId)

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
            <div className="messenger-thread-item__preview">{getThreadPreviewText(thread)}</div>
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
            {sentByViewer && viewerAvatar ? (
              <img src={viewerAvatar} alt="" className="ios-messenger-popover__read-avatar" />
            ) : thread.unreadCount > 0 ? (
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
