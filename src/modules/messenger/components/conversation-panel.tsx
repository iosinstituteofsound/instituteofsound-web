import { memo, useEffect, useMemo } from 'react'
import { ArrowLeft, Info, Phone, Video } from 'lucide-react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { ChatSearchBar } from '@/modules/messenger/components/chat-search-bar'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageListVirtual } from '@/modules/messenger/components/message-list-virtual'
import {
  isComposerBlockedByRequest,
  MessageRequestBanner,
} from '@/modules/messenger/components/message-request-banner'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'
import { useQueryClient } from '@tanstack/react-query'
import { messengerThreadsQueryKey } from '@/modules/messenger/hooks/use-messenger-threads'

type ConversationPanelProps = {
  thread?: DmThreadSummary | null
  className?: string
  showBack?: boolean
  onBack?: () => void
}

export const ConversationPanel = memo(function ConversationPanel({
  thread,
  className,
  showBack,
  onBack,
}: ConversationPanelProps) {
  const viewerId = useAuthStore((s) => s.userId)
  const queryClient = useQueryClient()
  const setShowInfoPanel = useMessengerUiStore((s) => s.setShowInfoPanel)
  const showChatSearch = useMessengerUiStore((s) => s.showChatSearch)
  const forwardFrom = useMessengerUiStore((s) => s.forwardFrom)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
  const setHighlightedMessageId = useMessengerUiStore((s) => s.setHighlightedMessageId)
  const typingByThread = useMessengerUiStore((s) => s.typingByThread)

  const messagesQuery = useMessengerMessages(thread?.threadId)
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [messagesQuery.data?.pages],
  )

  const myMessageCount = useMemo(
    () => messages.filter((m) => m.senderId === viewerId && m.type !== 'system').length,
    [messages, viewerId],
  )

  const typingUsers = thread ? (typingByThread[thread.threadId] ?? []).filter((id) => id !== viewerId) : []
  const composerBlocked = thread ? isComposerBlockedByRequest(thread, myMessageCount) : false

  useEffect(() => {
    if (!thread?.threadId || !messages.length) return
    const last = messages[messages.length - 1]
    if (!last || last.senderId === viewerId) return
    void messengerApi.markThreadRead(thread.threadId, last.id)
  }, [messages, thread?.threadId, viewerId])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    void messagesQuery.refetch()
  }

  if (!thread) {
    return (
      <section className={className}>
        <div className="messenger-empty">
          <div>
            <p className="text-lg font-semibold text-[var(--messenger-text)]">Select a chat</p>
            <p className="mt-1 text-sm">Choose a conversation to start messaging.</p>
          </div>
        </div>
      </section>
    )
  }

  const isDirect = thread.kind === 'direct'

  return (
    <section className={className}>
      <div className="messenger-conversation">
        <header className="messenger-conversation__header">
          <div className="flex min-w-0 items-center gap-3">
            {showBack ? (
              <button type="button" className="messenger-icon-btn lg:hidden" aria-label="Back" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            {isDirect ? (
              <FeedUserAvatar
                name={thread.title}
                avatarUrl={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl ?? thread.avatarUrl}
                className="h-10 w-10"
              />
            ) : (
              <GroupAvatarStack
                members={thread.memberPreview}
                title={thread.title}
                avatarUrl={thread.avatarUrl}
                size="sm"
              />
            )}
            <div className="min-w-0">
              <div className="truncate text-base font-bold">{thread.title}</div>
              <div className="text-xs text-[var(--messenger-muted)]">
                {typingUsers.length
                  ? 'Typing…'
                  : isDirect && thread.otherIsOnline
                    ? 'Active now'
                    : thread.subtitle ?? (isDirect ? 'Offline' : `${thread.memberCount ?? 0} members`)}
              </div>
            </div>
          </div>

          <div className="messenger-conversation__actions">
            <button type="button" className="messenger-icon-btn messenger-icon-btn--stub" aria-label="Voice call" disabled title="Coming soon">
              <Phone className="h-5 w-5" />
            </button>
            <button type="button" className="messenger-icon-btn messenger-icon-btn--stub" aria-label="Video call" disabled title="Coming soon">
              <Video className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="messenger-icon-btn"
              aria-label="Conversation info"
              onClick={() => setShowInfoPanel(true)}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </header>

        {showChatSearch ? (
          <ChatSearchBar
            messages={messages}
            onJumpToMessage={(messageId) => setHighlightedMessageId(messageId)}
          />
        ) : null}

        <MessageRequestBanner
          thread={thread}
          viewerId={viewerId}
          myMessageCount={myMessageCount}
          onChanged={invalidate}
        />

        <MessageListVirtual
          threadId={thread.threadId}
          messages={messages}
          viewerId={viewerId}
          otherName={thread.title}
          otherAvatar={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl ?? thread.avatarUrl}
          showSenderName={!isDirect}
        />

        {!composerBlocked && thread.status !== 'declined' ? (
          <MessageComposer threadId={thread.threadId} />
        ) : thread.status === 'declined' ? (
          <p className="px-4 py-3 text-sm text-[var(--messenger-muted)]">This conversation was declined.</p>
        ) : null}
      </div>

      <ForwardMessageModal message={forwardFrom} onClose={() => setForwardFrom(null)} />
    </section>
  )
})
