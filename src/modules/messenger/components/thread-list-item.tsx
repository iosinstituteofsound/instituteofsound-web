import { memo } from 'react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { formatMessengerTime } from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type ThreadListItemProps = {
  thread: DmThreadSummary
  active: boolean
  onSelect: (threadId: string) => void
}

export const ThreadListItem = memo(function ThreadListItem({
  thread,
  active,
  onSelect,
}: ThreadListItemProps) {
  return (
    <button
      type="button"
      className={cn('messenger-thread-item', active && 'is-active')}
      onClick={() => onSelect(thread.threadId)}
    >
      <FeedUserAvatar
        name={thread.otherName}
        avatarUrl={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl}
        className="h-[52px] w-[52px]"
      />
      <div className="min-w-0">
        <div className="messenger-thread-item__name">{thread.otherName}</div>
        <div className="messenger-thread-item__preview">
          {thread.lastMessageBody || 'Start a conversation'}
        </div>
      </div>
      <div className="messenger-thread-item__meta">
        <span>{formatMessengerTime(thread.lastMessageAt)}</span>
        {thread.unreadCount > 0 ? <span className="messenger-unread-dot" aria-label="Unread" /> : null}
      </div>
    </button>
  )
})
