import { memo } from 'react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import {
  formatMessengerTime,
  getThreadAvatarUrl,
  getThreadDisplayName,
} from '@/modules/messenger/lib/messenger-utils'
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
  const isDirect = thread.kind === 'direct' || !thread.isGroup
  const displayName = getThreadDisplayName(thread)

  return (
    <button
      type="button"
      className={cn('messenger-thread-item', active && 'is-active', thread.unreadCount > 0 && 'has-unread')}
      onClick={() => onSelect(thread.threadId)}
    >
      <div className="relative shrink-0">
        {isDirect ? (
          <FeedUserAvatar
            name={displayName}
            avatarUrl={getThreadAvatarUrl(thread)}
            className="h-[52px] w-[52px]"
          />
        ) : (
          <GroupAvatarStack
            members={thread.memberPreview}
            title={displayName}
            avatarUrl={thread.avatarUrl}
            size="md"
          />
        )}
        {isDirect && thread.otherIsOnline ? (
          <span className="messenger-online-dot" aria-label="Online" />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="messenger-thread-item__name">{displayName}</div>
        <div className="messenger-thread-item__preview">
          {thread.subtitle && !isDirect ? `${thread.subtitle} · ` : ''}
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
