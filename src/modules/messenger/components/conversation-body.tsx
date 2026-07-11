import { memo } from 'react'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageList } from '@/modules/messenger/components/message-list'
import { MessageRequestBanner } from '@/modules/messenger/components/message-request-banner'
import { TypingIndicatorBubble } from '@/modules/messenger/components/typing-indicator-bubble'
import type { ConversationThreadView } from '@/modules/messenger/hooks/use-conversation-thread'
import { getThreadAvatarUrl } from '@/modules/messenger/lib/messenger-utils'
import { cn } from '@/shared/lib/cn'

type ConversationBodyProps = {
  conversation: ConversationThreadView
  showSenderName?: boolean
  showInlineTyping?: boolean
  className?: string
}

export const ConversationBody = memo(function ConversationBody({
  conversation,
  showSenderName = false,
  showInlineTyping = true,
  className,
}: ConversationBodyProps) {
  const {
    threadId,
    thread,
    messages,
    viewerId,
    myMessageCount,
    composerBlocked,
    isDirect,
    displayName,
    forwardFrom,
    setForwardFrom,
    invalidate,
    isPeerTyping,
    typingPhase,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = conversation

  const avatarUrl = getThreadAvatarUrl(thread)

  return (
    <div className={cn('messenger-conversation__body', className)}>
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
        thread={thread}
        messages={messages}
        viewerId={viewerId}
        otherName={displayName}
        otherAvatar={avatarUrl}
        showSenderName={showSenderName}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={() => void fetchNextPage()}
        hero={{
          name: displayName,
          avatarUrl,
          isDirect,
          memberPreview: thread?.memberPreview,
          groupAvatarUrl: thread?.avatarUrl,
        }}
      />

      {showInlineTyping && isPeerTyping ? (
        <div className="messenger-typing-row">
          <TypingIndicatorBubble phase={typingPhase} />
        </div>
      ) : null}

      {!composerBlocked && thread?.status !== 'declined' ? (
        <MessageComposer threadId={threadId} />
      ) : thread?.status === 'declined' ? (
        <p className="px-3 py-2 text-xs text-[var(--messenger-muted)]">This conversation was declined.</p>
      ) : null}

      <ForwardMessageModal message={forwardFrom} onClose={() => setForwardFrom(null)} />
    </div>
  )
})
