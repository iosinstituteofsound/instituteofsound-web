import { memo } from 'react'
import { Info, Phone, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/shared/components/user'
import { EmptyState } from '@/shared/components/feedback/states'
import { IconButton } from '@/shared/components/ui/icon-button'
import { ConversationBody } from '@/modules/messenger/components/conversation-body'
import { GroupAvatarStack } from '@/modules/messenger/components/group-avatar-stack'
import { useConversationThread } from '@/modules/messenger/hooks/use-conversation-thread'
import { getThreadAvatarUrl, getThreadPresenceLabel } from '@/modules/messenger/lib/messenger-utils'
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

  const { isDirect, displayName, typingUsers } = threadState

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

  const profileHref = thread.otherUserId ? `/profile/${thread.otherUserId}` : undefined
  const presenceLabel = getThreadPresenceLabel(thread, typingUsers.length)

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
                  className="h-10 w-10"
                />
                {thread.otherIsOnline ? <span className="messenger-online-dot" aria-label="Online" /> : null}
              </Link>
            ) : isDirect ? (
              <div className="relative shrink-0">
                <UserAvatar
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
              <div className="text-xs text-[var(--messenger-muted)]">{presenceLabel}</div>
            </div>
          </div>

          <div className="messenger-conversation__actions">
            <IconButton className="messenger-icon-btn" aria-label="Voice call">
              <Phone className="h-5 w-5" />
            </IconButton>
            <IconButton className="messenger-icon-btn" aria-label="Video call">
              <Video className="h-5 w-5" />
            </IconButton>
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
