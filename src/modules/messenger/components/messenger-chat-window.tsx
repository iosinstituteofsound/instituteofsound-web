import { memo, useMemo } from 'react'
import { ChevronDown, Minus, Phone, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/shared/components/user'
import { IconButton } from '@/shared/components/ui/icon-button'
import { ConversationBody } from '@/modules/messenger/components/conversation-body'
import { GroupAvatarStack } from '@/shared/components/user'
import { useConversationThread } from '@/modules/messenger/hooks/use-conversation-thread'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { getThreadAvatarUrl, getThreadPresenceLabel } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { cn } from '@/shared/lib/cn'
import '@/modules/messenger/styles/messenger-chat-window.css'

type MessengerChatWindowProps = {
  threadId: string
  minimized: boolean
}

export const MessengerChatWindow = memo(function MessengerChatWindow({
  threadId,
  minimized,
}: MessengerChatWindowProps) {
  const { threads } = useMessengerThreads()
  const closeChat = useMessengerPopupStore((s) => s.closeChat)
  const toggleMinimize = useMessengerPopupStore((s) => s.toggleMinimize)
  const focusChat = useMessengerPopupStore((s) => s.focusChat)

  const thread = useMemo(
    () => threads.find((entry) => entry.threadId === threadId) ?? null,
    [threadId, threads],
  )

  const threadState = useConversationThread({
    threadId,
    thread,
    markReadEnabled: !minimized,
  })

  const { isDirect, displayName, typingUsers } = threadState

  const presenceLabel = getThreadPresenceLabel(thread, typingUsers.length)

  return (
    <div
      className={cn('messenger-chat-window', minimized && 'messenger-chat-window--minimized')}
      onMouseDown={() => focusChat(threadId)}
    >
      <header className="messenger-chat-window__head">
        <Link
          to={thread?.otherUserId ? `/profile/${thread.otherUserId}` : '#'}
          className="messenger-chat-window__who"
          onClick={(event) => {
            if (!thread?.otherUserId) event.preventDefault()
          }}
        >
          <span className="messenger-chat-window__avatar-wrap">
            {isDirect ? (
              <UserAvatar
                name={displayName}
                avatarUrl={getThreadAvatarUrl(thread)}
                className="h-8 w-8"
              />
            ) : (
              <GroupAvatarStack
                members={thread?.memberPreview}
                title={displayName}
                avatarUrl={thread?.avatarUrl}
                size="sm"
              />
            )}
            {isDirect && thread?.otherIsOnline ? <span className="messenger-chat-window__online" /> : null}
          </span>
          <span className="messenger-chat-window__meta">
            <span className="messenger-chat-window__name-row">
              <span className="messenger-chat-window__name">{displayName}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            </span>
            <span className="messenger-chat-window__status">
              {!typingUsers.length && isDirect && thread?.otherIsOnline ? (
                <span className="messenger-chat-window__status-dot" />
              ) : null}
              {presenceLabel}
            </span>
          </span>
        </Link>

        <div
          className="messenger-chat-window__actions"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <IconButton className="messenger-chat-window__icon" aria-label="Voice call">
            <Phone className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton className="messenger-chat-window__icon" aria-label="Video call">
            <Video className="h-3.5 w-3.5" />
          </IconButton>
          <button
            type="button"
            className="messenger-chat-window__icon"
            aria-label="Minimize"
            onClick={() => toggleMinimize(threadId)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="messenger-chat-window__icon"
            aria-label="Close"
            onClick={() => closeChat(threadId)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {!minimized ? (
        <ConversationBody
          conversation={{ ...threadState, threadId, thread }}
          showInlineTyping
          className="messenger-chat-window__body"
        />
      ) : null}
    </div>
  )
})
