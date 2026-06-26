import { memo, useEffect, useMemo } from 'react'
import { Info, Phone, Video } from 'lucide-react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageListVirtual } from '@/modules/messenger/components/message-list-virtual'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'

type ConversationPanelProps = {
  thread?: DmThreadSummary | null
  className?: string
}

export const ConversationPanel = memo(function ConversationPanel({
  thread,
  className,
}: ConversationPanelProps) {
  const viewerId = useAuthStore((s) => s.userId)
  const setReplyTo = useMessengerUiStore((s) => s.setReplyTo)
  const setShowInfoPanel = useMessengerUiStore((s) => s.setShowInfoPanel)
  const typingByThread = useMessengerUiStore((s) => s.typingByThread)

  const messagesQuery = useMessengerMessages(thread?.threadId)
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [messagesQuery.data?.pages],
  )

  const typingUsers = thread ? (typingByThread[thread.threadId] ?? []).filter((id) => id !== viewerId) : []

  useEffect(() => {
    if (!thread?.threadId || !messages.length) return
    const last = messages[messages.length - 1]
    if (!last || last.senderId === viewerId) return
    void messengerApi.markThreadRead(thread.threadId, last.id)
  }, [messages, thread?.threadId, viewerId])

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

  return (
    <section className={className}>
      <div className="messenger-conversation">
        <header className="messenger-conversation__header">
          <div className="flex min-w-0 items-center gap-3">
            <FeedUserAvatar
              name={thread.otherName}
              avatarUrl={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl}
              className="h-10 w-10"
            />
            <div className="min-w-0">
              <div className="truncate text-base font-bold">{thread.otherName}</div>
              <div className="text-xs text-[var(--messenger-muted)]">
                {typingUsers.length
                  ? 'Typing…'
                  : thread.otherIsOnline
                    ? 'Active now'
                    : 'Offline'}
              </div>
            </div>
          </div>

          <div className="messenger-conversation__actions">
            <button type="button" className="messenger-icon-btn" aria-label="Voice call">
              <Phone className="h-5 w-5" />
            </button>
            <button type="button" className="messenger-icon-btn" aria-label="Video call">
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

        <MessageListVirtual
          messages={messages}
          viewerId={viewerId}
          otherName={thread.otherName}
          otherAvatar={thread.otherAvatarThumbnailUrl ?? thread.otherAvatarUrl}
          onReply={setReplyTo}
        />

        <MessageComposer threadId={thread.threadId} />
      </div>
    </section>
  )
})
