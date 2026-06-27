import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Reply } from 'lucide-react'
import '@/modules/messenger/styles/messenger.css'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { MessageActionsMenu } from '@/modules/messenger/components/message-actions-menu'
import { MessageReactionBadge } from '@/modules/messenger/components/message-reaction-badge'
import { useMessageBubbleActions } from '@/modules/messenger/hooks/use-message-bubble-actions'
import { getReplyHeaderLabel, getReplyPreviewText } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageBubbleProps = {
  message: DmMessage
  threadId: string
  isOutgoing: boolean
  viewerId?: string | null
  otherName?: string
  senderName?: string
  senderAvatar?: string
  compact?: boolean
  showAvatar?: boolean
  showSenderLabel?: boolean
  isTail?: boolean
  isStacked?: boolean
}

export const MessageBubble = memo(function MessageBubble({
  message,
  threadId,
  isOutgoing,
  viewerId,
  otherName,
  senderName,
  senderAvatar,
  compact = false,
  showAvatar = false,
  showSenderLabel = false,
  isTail = true,
  isStacked = false,
}: MessageBubbleProps) {
  const { onReply, onForward, onEdit, onDelete, onReact } = useMessageBubbleActions(message, threadId)
  const useReplyStack = Boolean(message.replyPreview)
  const replyHeaderLabel = getReplyHeaderLabel({
    isOutgoing,
    viewerId,
    otherName,
    senderName,
    quotedSenderId: message.replyPreview?.senderId,
  })
  const quotedPreviewText = message.replyPreview ? getReplyPreviewText(message.replyPreview) : ''

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
        !compact && isTail && (isOutgoing ? 'is-tail-out' : 'is-tail-in'),
        !compact && isStacked && 'is-stacked',
        message.reactions.length > 0 && 'has-reaction',
      )}
      onDoubleClick={onReply}
      role="presentation"
    >
      {!isOutgoing && !compact && showSenderLabel && senderName ? (
        <div className="messenger-bubble__sender">{senderName}</div>
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

      {message.body && message.type !== 'share_card' ? (
        <div className={cn(!compact && 'messenger-bubble__text')}>{message.body}</div>
      ) : null}
    </div>
  )

  const reactionBadge =
    message.reactions.length > 0 ? (
      <MessageReactionBadge
        reactions={message.reactions}
        isOutgoing={isOutgoing}
        onReact={(emoji) => void onReact(emoji)}
      />
    ) : null

  const renderedBubble = useReplyStack ? (
    <div
      className={cn(
        'messenger-reply-stack',
        isOutgoing && 'is-outgoing',
        compact && 'messenger-reply-stack--compact',
      )}
    >
      <div className="messenger-reply-stack__header">
        <Reply className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{replyHeaderLabel}</span>
      </div>
      <div className="messenger-reply-stack__quoted">{quotedPreviewText}</div>
      {bubble}
    </div>
  ) : (
    bubble
  )

  if (compact) {
    return (
      <div
        className={cn(
          'messenger-message-row messenger-message-row--compact group',
          isOutgoing && 'is-outgoing',
          isStacked && 'is-stacked',
          message.reactions.length > 0 && 'has-reactions',
        )}
      >
        {!isOutgoing ? (
          showAvatar ? (
            <FeedUserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-7 w-7 shrink-0 self-end" />
          ) : (
            <span className="h-7 w-7 shrink-0" aria-hidden />
          )
        ) : null}

        <div className="messenger-message-row__bubble-wrap">
          {renderedBubble}
          {reactionBadge}
        </div>

        {!isOutgoing ? actions : null}
        {isOutgoing ? actions : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'messenger-message-row group',
        isOutgoing && 'is-outgoing',
        isStacked && 'is-stacked',
        message.reactions.length > 0 && 'has-reactions',
      )}
    >
      {!isOutgoing ? (
        showAvatar ? (
          <FeedUserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-8 w-8 shrink-0 self-end" />
        ) : (
          <span className="messenger-message-row__avatar-spacer" aria-hidden />
        )
      ) : null}

      <div className="messenger-message-row__content">
        {isOutgoing ? actions : null}
        <div className="messenger-message-row__bubble-wrap">
          {renderedBubble}
          {reactionBadge}
        </div>
        {!isOutgoing ? actions : null}
      </div>
    </div>
  )
})
