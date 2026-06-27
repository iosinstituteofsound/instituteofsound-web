import { memo, useEffect, useMemo } from 'react'
import { Info, Phone, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageListVirtual } from '@/modules/messenger/components/message-list-virtual'
import {
  isComposerBlockedByRequest,
  MessageRequestBanner,
} from '@/modules/messenger/components/message-request-banner'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import { messengerThreadsQueryKey } from '@/modules/messenger/hooks/use-messenger-threads'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { getThreadAvatarUrl, getThreadDisplayName } from '@/modules/messenger/lib/messenger-utils'
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
  const queryClient = useQueryClient()
  const setShowInfoPanel = useMessengerUiStore((s) => s.setShowInfoPanel)
  const forwardFrom = useMessengerUiStore((s) => s.forwardFrom)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
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
  const isDirect = thread?.kind === 'direct' || !thread?.isGroup
  const displayName = getThreadDisplayName(thread)

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

  const profileHref = thread.otherUserId ? `/profile/${thread.otherUserId}` : undefined

  return (
    <section className={className}>
      <div className="messenger-conversation">
        <header className="messenger-conversation__header">
          <div className="flex min-w-0 items-center gap-3">
            {profileHref && isDirect ? (
              <Link to={profileHref} className="relative shrink-0">
                <FeedUserAvatar
                  name={displayName}
                  avatarUrl={getThreadAvatarUrl(thread)}
                  className="h-10 w-10"
                />
                {thread.otherIsOnline ? <span className="messenger-online-dot" aria-label="Online" /> : null}
              </Link>
            ) : isDirect ? (
              <div className="relative shrink-0">
                <FeedUserAvatar
                  name={displayName}
                  avatarUrl={getThreadAvatarUrl(thread)}
                  className="h-10 w-10"
                />
                {thread.otherIsOnline ? <span className="messenger-online-dot" aria-label="Online" /> : null}
              </div>
            ) : (
              <GroupAvatarStack
                members={thread.memberPreview}
                title={displayName}
                avatarUrl={thread.avatarUrl}
                size="sm"
              />
            )}
            <div className="min-w-0">
              {profileHref && isDirect ? (
                <Link to={profileHref} className="truncate text-base font-bold hover:underline">
                  {displayName}
                </Link>
              ) : (
                <div className="truncate text-base font-bold">{displayName}</div>
              )}
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
          otherName={displayName}
          otherAvatar={getThreadAvatarUrl(thread)}
          showSenderName={!isDirect}
        />

        {!composerBlocked && thread.status !== 'declined' ? (
          <MessageComposer threadId={thread.threadId} />
        ) : thread.status === 'declined' ? (
          <p className="px-3 py-2 text-xs text-[var(--messenger-muted)]">This conversation was declined.</p>
        ) : null}
      </div>

      <ForwardMessageModal message={forwardFrom} onClose={() => setForwardFrom(null)} />
    </section>
  )
})
