import { memo } from 'react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { getThreadAvatarUrl, getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'

type MessengerDockStackProps = {
  threadIds: string[]
}

export const MessengerDockStack = memo(function MessengerDockStack({ threadIds }: MessengerDockStackProps) {
  const { threads } = useMessengerThreads()
  const promoteFromStack = useMessengerPopupStore((s) => s.promoteFromStack)
  const closeChat = useMessengerPopupStore((s) => s.closeChat)

  if (!threadIds.length) return null

  return (
    <div className="messenger-dock-stack" aria-label="More conversations">
      {threadIds.map((threadId, index) => {
        const thread = threads.find((entry) => entry.threadId === threadId)
        const name = getThreadDisplayName(thread)
        const avatar = getThreadAvatarUrl(thread)

        return (
          <button
            key={threadId}
            type="button"
            className="messenger-dock-stack__item"
            style={{ zIndex: threadIds.length - index }}
            aria-label={`Open chat with ${name}`}
            onClick={() => promoteFromStack(threadId)}
            onContextMenu={(event) => {
              event.preventDefault()
              closeChat(threadId)
            }}
          >
            <FeedUserAvatar name={name} avatarUrl={avatar} className="h-12 w-12" />
            {thread?.unreadCount ? (
              <span className="messenger-dock-stack__badge">
                {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
              </span>
            ) : null}
            {thread?.otherIsOnline ? <span className="messenger-dock-stack__online" /> : null}
          </button>
        )
      })}
    </div>
  )
})
