import { memo } from 'react'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageBubbleProps = {
  message: DmMessage
  isOutgoing: boolean
  senderName?: string
  senderAvatar?: string
  onReply?: (message: DmMessage) => void
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOutgoing,
  senderName,
  senderAvatar,
  onReply,
}: MessageBubbleProps) {
  if (message.deletedAt) {
    return (
      <div className={cn('messenger-message-row', isOutgoing && 'is-outgoing')}>
        <div className="messenger-bubble is-incoming opacity-70 italic">Message removed</div>
      </div>
    )
  }

  return (
    <div className={cn('messenger-message-row', isOutgoing && 'is-outgoing')}>
      {!isOutgoing ? (
        <FeedUserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-7 w-7 self-end" />
      ) : null}
      <button
        type="button"
        className={cn('messenger-bubble text-left', isOutgoing ? 'is-outgoing' : 'is-incoming')}
        onDoubleClick={() => onReply?.(message)}
      >
        {message.replyPreview ? (
          <div className="messenger-bubble__reply">
            <div className="font-semibold">Reply</div>
            <div>{message.replyPreview.body || 'Attachment'}</div>
          </div>
        ) : null}

        {message.type === 'image' && message.mediaUrl ? (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer">
            <img src={message.mediaUrl} alt="" className="messenger-bubble__media" loading="lazy" />
          </a>
        ) : null}

        {message.type === 'video' && message.mediaUrl ? (
          <video src={message.mediaUrl} controls className="messenger-bubble__media" preload="metadata" />
        ) : null}

        {message.type === 'file' && message.mediaUrl ? (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="underline">
            {message.mediaFileName ?? 'Download file'}
          </a>
        ) : null}

        {message.body ? <div>{message.body}</div> : null}

        {message.reactions.length ? (
          <div className="mt-1 flex flex-wrap gap-1 text-sm">
            {message.reactions.map((reaction) => (
              <span key={`${reaction.userId}-${reaction.emoji}`}>{reaction.emoji}</span>
            ))}
          </div>
        ) : null}

        {message.editedAt ? <div className="mt-1 text-[11px] opacity-70">Edited</div> : null}
        {message.optimistic ? <div className="mt-1 text-[11px] opacity-70">Sending…</div> : null}
        {message.failed ? <div className="mt-1 text-[11px] text-red-300">Failed to send</div> : null}
      </button>
    </div>
  )
})
