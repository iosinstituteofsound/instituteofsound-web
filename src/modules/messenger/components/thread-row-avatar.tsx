import { memo } from 'react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import {
  getThreadAvatarUrl,
  getThreadDisplayName,
  isDirectThread,
} from '@/modules/messenger/lib/messenger-utils'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

type ThreadRowAvatarProps = {
  thread: DmThreadSummary
  size?: 'md' | 'sm'
  avatarClassName?: string
}

export const ThreadRowAvatar = memo(function ThreadRowAvatar({
  thread,
  size = 'md',
  avatarClassName = 'h-[52px] w-[52px]',
}: ThreadRowAvatarProps) {
  const isDirect = isDirectThread(thread)
  const displayName = getThreadDisplayName(thread)

  return (
    <div className="relative shrink-0">
      {isDirect ? (
        <FeedUserAvatar
          name={displayName}
          avatarUrl={getThreadAvatarUrl(thread)}
          className={avatarClassName}
        />
      ) : (
        <GroupAvatarStack
          members={thread.memberPreview}
          title={displayName}
          avatarUrl={thread.avatarUrl}
          size={size}
        />
      )}
      {isDirect && thread.otherIsOnline ? (
        <span className="messenger-online-dot" aria-label="Online" />
      ) : null}
    </div>
  )
})
