import { memo, useMemo } from 'react'
import { ChevronDown, Minus, Phone, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageList } from '@/modules/messenger/components/message-list'
import {
  isComposerBlockedByRequest,
  MessageRequestBanner,
} from '@/modules/messenger/components/message-request-banner'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import { useMarkThreadReadWhenViewing } from '@/modules/messenger/hooks/use-mark-thread-read-when-viewing'
import { messengerThreadsQueryKey, useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { getThreadAvatarUrl, getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import { useAuthStore } from '@/app/stores/auth-store'
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
  const viewerId = useAuthStore((s) => s.userId)
  const queryClient = useQueryClient()
  const { threads } = useMessengerThreads()
  const closeChat = useMessengerPopupStore((s) => s.closeChat)
  const toggleMinimize = useMessengerPopupStore((s) => s.toggleMinimize)
  const focusChat = useMessengerPopupStore((s) => s.focusChat)
  const forwardFrom = useMessengerUiStore((s) => s.forwardFrom)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
  const typingByThread = useMessengerUiStore((s) => s.typingByThread)

  const thread = useMemo(
    () => threads.find((entry) => entry.threadId === threadId) ?? null,
    [threadId, threads],
  )

  const messagesQuery = useMessengerMessages(threadId)
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [messagesQuery.data?.pages],
  )

  const myMessageCount = useMemo(
    () => messages.filter((m) => m.senderId === viewerId && m.type !== 'system').length,
    [messages, viewerId],
  )

  const composerBlocked = thread ? isComposerBlockedByRequest(thread, myMessageCount) : false
  const isDirect = thread?.kind === 'direct' || !thread?.isGroup
  const displayName = getThreadDisplayName(thread)
  const typingUsers = (typingByThread[threadId] ?? []).filter((id) => id !== viewerId)

  useMarkThreadReadWhenViewing(threadId, messages, viewerId, !minimized)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    void messagesQuery.refetch()
  }

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
              <FeedUserAvatar
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
              {typingUsers.length ? (
                'Typing…'
              ) : isDirect && thread?.otherIsOnline ? (
                <>
                  <span className="messenger-chat-window__status-dot" />
                  Active now
                </>
              ) : (
                thread?.subtitle ?? (isDirect ? 'Offline' : `${thread?.memberCount ?? 0} members`)
              )}
            </span>
          </span>
        </Link>

        <div
          className="messenger-chat-window__actions"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button type="button" className="messenger-chat-window__icon" aria-label="Voice call">
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="messenger-chat-window__icon" aria-label="Video call">
            <Video className="h-3.5 w-3.5" />
          </button>
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
        <>
          <div className="messenger-chat-window__body">
            {thread ? (
              <MessageRequestBanner
                thread={thread}
                viewerId={viewerId}
                myMessageCount={myMessageCount}
                onChanged={invalidate}
              />
            ) : null}

            <MessageList
              threadId={threadId}
              messages={messages}
              viewerId={viewerId}
              otherName={displayName}
              otherAvatar={getThreadAvatarUrl(thread)}
              hero={{
                name: displayName,
                avatarUrl: getThreadAvatarUrl(thread),
                isDirect,
                memberPreview: thread?.memberPreview,
                groupAvatarUrl: thread?.avatarUrl,
              }}
            />

            {typingUsers.length ? (
              <p className="messenger-chat-window__typing">{displayName} is typing…</p>
            ) : null}
          </div>

          {!composerBlocked && thread?.status !== 'declined' ? (
            <MessageComposer threadId={threadId} />
          ) : thread?.status === 'declined' ? (
            <p className="px-3 py-2 text-xs text-[var(--messenger-muted)]">This conversation was declined.</p>
          ) : null}
        </>
      ) : null}

      <ForwardMessageModal message={forwardFrom} onClose={() => setForwardFrom(null)} />
    </div>
  )
})
