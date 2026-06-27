import { memo } from 'react'
import { X } from 'lucide-react'
import { GroupAvatarStack } from '@/shared/components/user'
import { UserAvatar } from '@/shared/components/user'
import { useForwardMessageModal } from '@/modules/messenger/hooks/use-forward-message-modal'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { IconButton } from '@/shared/components/ui/icon-button'
import { cn } from '@/shared/lib/cn'

type ForwardMessageModalProps = {
  message: DmMessage | null
  onClose: () => void
}

export const ForwardMessageModal = memo(function ForwardMessageModal({
  message,
  onClose,
}: ForwardMessageModalProps) {
  const { threads, busy, forwardToThread } = useForwardMessageModal(message, onClose)

  if (!message) return null

  return (
    <div className="messenger-new-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="messenger-new-modal"
        role="dialog"
        aria-label="Forward message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="messenger-new-modal__head">
          <h2 className="text-lg font-semibold">Forward message</h2>
          <IconButton className="messenger-icon-btn" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <p className="mb-3 text-sm text-[var(--messenger-muted)]">
          {message.body || message.mediaFileName || 'Attachment'}
        </p>

        <div className="messenger-new-modal__body">
          {threads.map((thread) => (
            <button
              key={thread.threadId}
              type="button"
              className={cn('messenger-thread-item w-full', busy && 'opacity-60')}
              disabled={busy || thread.threadId === message.threadId}
              onClick={() => void forwardToThread(thread.threadId)}
            >
              {thread.kind === 'direct' ? (
                <UserAvatar
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
              <div className="min-w-0 text-left">
                <div className="messenger-thread-item__name">{thread.title}</div>
                <div className="messenger-thread-item__preview">{thread.lastMessageBody || 'Chat'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})
