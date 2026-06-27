import { memo } from 'react'
import { ForwardMessageModal } from '@/modules/messenger/components/forward-message-modal'
import { MessageComposer } from '@/modules/messenger/components/message-composer'
import { MessageList } from '@/modules/messenger/components/message-list'
import { MessageRequestBanner } from '@/modules/messenger/components/message-request-banner'
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
  showInlineTyping = false,
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
    typingUsers,
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
        messages={messages}
        viewerId={viewerId}
        otherName={displayName}
        otherAvatar={avatarUrl}
        showSenderName={showSenderName}
        hero={{
          name: displayName,
          avatarUrl,
          isDirect,
          memberPreview: thread?.memberPreview,
          groupAvatarUrl: thread?.avatarUrl,
        }}
      />

      {showInlineTyping && typingUsers.length ? (
        <p className="messenger-chat-window__typing">{displayName} is typing…</p>
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
