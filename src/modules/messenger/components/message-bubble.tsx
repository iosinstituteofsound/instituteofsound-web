import { memo } from 'react'
import { Link } from 'react-router-dom'
import '@/modules/messenger/styles/messenger.css'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { MessageActionsMenu } from '@/modules/messenger/components/message-actions-menu'
import { useMessageBubbleActions } from '@/modules/messenger/hooks/use-message-bubble-actions'
import { formatMessageClockTime } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageBubbleProps = {
  message: DmMessage
  threadId: string
  isOutgoing: boolean
  senderName?: string
  senderAvatar?: string
  compact?: boolean
  showAvatar?: boolean
  isTail?: boolean
  isStacked?: boolean
}

export const MessageBubble = memo(function MessageBubble({
  message,
  threadId,
  isOutgoing,
  senderName,
  senderAvatar,
  compact = false,
  showAvatar = false,
  isTail = true,
  isStacked = false,
}: MessageBubbleProps) {
  const { onReply, onForward, onEdit, onDelete, onReact } = useMessageBubbleActions(message, threadId)

  if (message.type === 'system') {
    return <p className="messenger-system-message">{message.body}</p>
  }

  if (message.deletedAt) {
    return (
      <div className={cn('messenger-message-row', compact && 'messenger-message-row--compact', isOutgoing && 'is-outgoing')}>
        <div className="messenger-bubble is-incoming opacity-70 italic">Message removed</div>
      </div>
    )
  }

  const actions = (
    <MessageActionsMenu
      message={message}
      isOutgoing={isOutgoing}
      compact={compact}
      onReply={onReply}
      onForward={onForward}
      onEdit={onEdit}
      onDelete={() => void onDelete()}
      onReact={(emoji) => void onReact(emoji)}
    />
  )

  const bubble = (
    <div
      className={cn(
        'messenger-bubble text-left',
        isOutgoing ? 'is-outgoing' : 'is-incoming',
        compact && 'messenger-bubble--compact',
        compact && isTail && (isOutgoing ? 'is-tail-out' : 'is-tail-in'),
        compact && isStacked && 'is-stacked',
      )}
      onDoubleClick={onReply}
      role="presentation"
    >
      {!isOutgoing && !compact && senderName ? (
        <div className="mb-0.5 text-[11px] font-semibold opacity-80">{senderName}</div>
      ) : null}

      {message.replyPreview ? (
        <div className="messenger-bubble__reply">
          <div className="font-semibold">Reply</div>
          <div>{message.replyPreview.body || 'Attachment'}</div>
        </div>
      ) : null}

      {message.forwardFromId ? (
        <div className="messenger-bubble__reply mb-1 text-[11px] opacity-80">Forwarded</div>
      ) : null}

      {message.type === 'share_card' && message.shareData ? (
        <Link to={message.shareData.href ?? '#'} className="messenger-share-card block">
          {message.shareData.imageUrl ? (
            <img src={message.shareData.imageUrl} alt="" className="messenger-share-card__img" />
          ) : null}
          <div className="messenger-share-card__title">{message.shareData.title ?? 'Shared link'}</div>
        </Link>
      ) : null}

      {message.linkPreview ? (
        <a href={message.linkPreview.url} target="_blank" rel="noreferrer" className="messenger-link-preview block">
          {message.linkPreview.title ?? message.linkPreview.url}
        </a>
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

      {message.body && message.type !== 'share_card' ? <div>{message.body}</div> : null}

      {message.reactions.length ? (
        <div className={cn('flex flex-wrap gap-1 text-sm', compact ? 'mt-0.5' : 'mt-1')}>
          {message.reactions.map((reaction) => (
            <button
              key={`${reaction.userId}-${reaction.emoji}`}
              type="button"
              className="rounded-full bg-black/10 px-1.5 py-0.5"
              onClick={() => void onReact(reaction.emoji)}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      ) : null}

      {!compact ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] opacity-70">
          <time dateTime={message.createdAt}>{formatMessageClockTime(message.createdAt)}</time>
          {message.editedAt ? <span>Edited</span> : null}
          {message.optimistic ? <span>Sending…</span> : null}
          {message.failed ? <span className="text-red-300">Failed to send</span> : null}
        </div>
      ) : null}
    </div>
  )

  if (compact) {
    return (
      <div
        className={cn(
          'messenger-message-row messenger-message-row--compact group',
          isOutgoing && 'is-outgoing',
          isStacked && 'is-stacked',
        )}
      >
        {!isOutgoing ? (
          showAvatar ? (
            <FeedUserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-7 w-7 shrink-0 self-end" />
          ) : (
            <span className="h-7 w-7 shrink-0" aria-hidden />
          )
        ) : null}

        <div className="messenger-message-row__bubble-wrap">{bubble}</div>

        {!isOutgoing ? actions : null}
        {isOutgoing ? actions : null}
      </div>
    )
  }

  return (
    <div className={cn('messenger-message-row group', isOutgoing && 'is-outgoing')}>
      {!isOutgoing ? (
        <FeedUserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-7 w-7 self-end" />
      ) : null}

      <div className="relative min-w-0 max-w-[min(100%,520px)]">
        {bubble}
        {actions}
      </div>
    </div>
  )
})
