import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Reply } from 'lucide-react'
import '@/modules/messenger/styles/messenger.css'
import '@/modules/messenger/styles/messenger-voice.css'
import { UserAvatar } from '@/shared/components/user'
import { LinkPreviewCard } from '@/shared/components/link-preview'
import { toLinkPreview } from '@/shared/lib/link-preview/dm-link-preview'
import { MessageCallBubble } from '@/modules/messenger/components/message-call-bubble'
import { MessageActionsMenu } from '@/modules/messenger/components/message-actions-menu'
import { MessageBubbleMeta } from '@/modules/messenger/components/message-bubble-meta'
import { MessageMediaBubble } from '@/modules/messenger/components/message-media-bubble'
import { MessageReactionBadge } from '@/modules/messenger/components/message-reaction-badge'
import { MessageVoiceBubble } from '@/modules/messenger/components/message-voice-bubble'
import { useMessageBubbleActions } from '@/modules/messenger/hooks/use-message-bubble-actions'
import { getReplyHeaderLabel, getReplyPreviewText, isLikeMessage, isStandaloneEmojiMessage } from '@/modules/messenger/lib/messenger-utils'
import {
  isImageMessage,
  isVoiceMessage,
} from '@/modules/messenger/utils/voice-message-utils'
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
  indentForAvatar?: boolean
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
  indentForAvatar = false,
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
  const isLike = isLikeMessage(message)
  const isStandaloneEmoji = isStandaloneEmojiMessage(message) && !useReplyStack
  const isVoice = isVoiceMessage(message)
  const isMedia = isImageMessage(message) && Boolean(message.mediaUrl)

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

  const isCall = message.type === 'call' && Boolean(message.callData)

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

  const reactionBadge =
    message.reactions.length > 0 ? (
      <MessageReactionBadge
        reactions={message.reactions}
        isOutgoing={isOutgoing}
        onReact={(emoji) => void onReact(emoji)}
      />
    ) : null

  const compactAvatarColumn =
    !isOutgoing && showAvatar ? (
      <UserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-7 w-7 shrink-0 self-end" />
    ) : !isOutgoing && indentForAvatar ? (
      <span className="h-7 w-7 shrink-0 self-end" aria-hidden />
    ) : null

  const fullAvatarColumn =
    !isOutgoing && showAvatar ? (
      <UserAvatar name={senderName ?? 'User'} avatarUrl={senderAvatar} className="h-8 w-8 shrink-0 self-end" />
    ) : !isOutgoing && indentForAvatar ? (
      <span className="h-8 w-8 shrink-0 self-end" aria-hidden />
    ) : null

  if (isVoice && message.mediaUrl) {
    const voiceBubble = (
      <MessageVoiceBubble
        message={message}
        messageId={message.id}
        mediaUrl={message.mediaUrl}
        isOutgoing={isOutgoing}
        isTail={isTail}
        isStacked={isStacked}
      />
    )

    const renderedVoice = useReplyStack ? (
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
        {voiceBubble}
      </div>
    ) : (
      voiceBubble
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
          {compactAvatarColumn}
          <div className="messenger-message-row__bubble-wrap">
            {renderedVoice}
            {actions}
            {reactionBadge}
          </div>
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
        {fullAvatarColumn}
        <div className="messenger-message-row__content">
          <div className="messenger-message-row__bubble-wrap">
            {renderedVoice}
            {actions}
            {reactionBadge}
          </div>
        </div>
      </div>
    )
  }

  if (isMedia && message.mediaUrl) {
    const mediaBubble = (
      <div className="messenger-media-bubble-wrap">
        <MessageMediaBubble
          mediaUrl={message.mediaUrl}
          isOutgoing={isOutgoing}
          caption={message.body?.trim() || undefined}
          isTail={isTail}
          isStacked={isStacked}
        />
        <MessageBubbleMeta message={message} isOutgoing={isOutgoing} />
      </div>
    )

    const renderedMedia = useReplyStack ? (
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
        {mediaBubble}
      </div>
    ) : (
      mediaBubble
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
          {compactAvatarColumn}
          <div className="messenger-message-row__bubble-wrap">
            {renderedMedia}
            {actions}
            {reactionBadge}
          </div>
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
        {fullAvatarColumn}
        <div className="messenger-message-row__content">
          <div className="messenger-message-row__bubble-wrap">
            {renderedMedia}
            {actions}
            {reactionBadge}
          </div>
        </div>
      </div>
    )
  }

  const embeddedQuote = useReplyStack ? (
    <div className="messenger-bubble__embedded-quote">{quotedPreviewText}</div>
  ) : null

  const bubble = isStandaloneEmoji ? (
    <div
      className="messenger-like-sticker"
      onDoubleClick={onReply}
      role="presentation"
      aria-label={isLike ? 'Like' : 'Emoji'}
    >
      {message.body.trim()}
    </div>
  ) : (
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
      {embeddedQuote}

      {!isOutgoing && !compact && showSenderLabel && senderName ? (
        <div className="messenger-bubble__sender">{senderName}</div>
      ) : null}

      {message.forwardFromId ? (
        <div className="messenger-bubble__reply mb-1 text-[11px] opacity-80">Forwarded</div>
      ) : null}

      {isCall ? (
        <MessageCallBubble message={message} isOutgoing={isOutgoing} viewerId={viewerId} />
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
        <LinkPreviewCard preview={toLinkPreview(message.linkPreview)} compact className="messenger-link-preview" />
      ) : null}

      {message.type === 'image' && message.mediaUrl ? (
        <a href={message.mediaUrl} target="_blank" rel="noreferrer">
          <img src={message.mediaUrl} alt="" className="messenger-bubble__media" loading="lazy" />
        </a>
      ) : null}

      {message.type === 'video' && message.mediaUrl ? (
        <video src={message.mediaUrl} controls className="messenger-bubble__media" preload="metadata" />
      ) : null}

      {message.type === 'file' && message.mediaUrl && !isVoiceMessage(message) ? (
        <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="underline">
          {message.mediaFileName ?? 'Download file'}
        </a>
      ) : null}

      {message.body && message.type !== 'share_card' && !isCall ? (
        <div className={cn(!compact && 'messenger-bubble__text')}>{message.body}</div>
      ) : null}

      {!isStandaloneEmoji ? (
        <MessageBubbleMeta message={message} isOutgoing={isOutgoing} />
      ) : null}
    </div>
  )

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
          isStandaloneEmoji && 'is-like',
          message.reactions.length > 0 && 'has-reactions',
        )}
      >
        {compactAvatarColumn}

        <div className="messenger-message-row__bubble-wrap">
          {renderedBubble}
          {actions}
          {reactionBadge}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'messenger-message-row group',
        isOutgoing && 'is-outgoing',
        isStacked && 'is-stacked',
        isStandaloneEmoji && 'is-like',
        message.reactions.length > 0 && 'has-reactions',
      )}
    >
      {fullAvatarColumn}

      <div className="messenger-message-row__content">
        <div className="messenger-message-row__bubble-wrap">
          {renderedBubble}
          {actions}
          {reactionBadge}
        </div>
      </div>
    </div>
  )
})
