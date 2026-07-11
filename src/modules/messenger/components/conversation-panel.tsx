import { memo } from 'react'
import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/shared/components/user'
import { EmptyState } from '@/shared/components/feedback/states'
import { IconButton } from '@/shared/components/ui/icon-button'
import { ConversationBody } from '@/modules/messenger/components/conversation-body'
import { MessengerCallActions } from '@/modules/messenger/components/messenger-call-actions'
import { GroupAvatarStack } from '@/shared/components/user'
import { MessengerAvatarStatusBadge } from '@/modules/messenger/components/messenger-avatar-status-badge'
import { MessengerThreadStatus } from '@/modules/messenger/components/messenger-thread-status'
import { useConversationThread } from '@/modules/messenger/hooks/use-conversation-thread'
import { getThreadAvatarUrl, isDirectThread } from '@/modules/messenger/lib/messenger-utils'
import { resolveMessengerPresenceStatus } from '@/modules/messenger/lib/messenger-status-visuals'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

type ConversationPanelProps = {
  thread?: DmThreadSummary | null
  className?: string
}

export const ConversationPanel = memo(function ConversationPanel({
  thread,
  className,
}: ConversationPanelProps) {
  const setShowInfoPanel = useMessengerUiStore((s) => s.setShowInfoPanel)

  const threadState = useConversationThread({
    threadId: thread?.threadId,
    thread,
  })

  if (!thread) {
    return (
      <section className={className}>
        <div className="messenger-empty">
          <EmptyState
            title="Select a chat"
            description="Choose a conversation to start messaging."
            className="py-0"
          />
        </div>
      </section>
    )
  }

  const { isDirect, displayName, isPeerTyping, typingPhase } = threadState
  const avatarStatus = resolveMessengerPresenceStatus(
    isPeerTyping,
    typingPhase,
    Boolean(thread.otherIsOnline),
  )
  const showAvatarBadge = isDirectThread(thread) || isPeerTyping

  const profileHref = thread.otherUserId ? `/profile/${thread.otherUserId}` : undefined

  return (
    <section className={className}>
      <div className="messenger-conversation">
        <header className="messenger-conversation__header">
          <div className="flex min-w-0 items-center gap-3">
            {profileHref && isDirect ? (
              <Link to={profileHref} className="relative shrink-0">
                <UserAvatar
                  name={displayName}
                  avatarUrl={getThreadAvatarUrl(thread)}
                  className="h-10 w-10 border border-primary"
                />
                {showAvatarBadge ? <MessengerAvatarStatusBadge status={avatarStatus} /> : null}
              </Link>
            ) : isDirect ? (
              <div className="relative shrink-0">
                <UserAvatar
                  name={displayName}
                  avatarUrl={getThreadAvatarUrl(thread)}
                  className="h-10 w-10 border border-primary"
                />
                {showAvatarBadge ? <MessengerAvatarStatusBadge status={avatarStatus} /> : null}
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
              <MessengerThreadStatus
                thread={thread}
                isPeerTyping={isPeerTyping}
                phase={typingPhase}
              />
            </div>
          </div>

          <div className="messenger-conversation__actions">
            <MessengerCallActions
              thread={thread}
              className="flex items-center gap-1"
              iconClassName="messenger-icon-btn"
            />
            <IconButton
              className="messenger-icon-btn"
              aria-label="Conversation info"
              onClick={() => setShowInfoPanel(true)}
            >
              <Info className="h-5 w-5" />
            </IconButton>
          </div>
        </header>

        <ConversationBody
          conversation={{ ...threadState, threadId: thread.threadId, thread }}
          showSenderName={!isDirect}
        />
      </div>
    </section>
  )
})
