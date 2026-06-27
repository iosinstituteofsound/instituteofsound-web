import { memo, useMemo } from 'react'
import { ReactionPickerIcon } from '@/shared/components/reactions'
import { groupReactionsByEmoji } from '@/shared/lib/reactions/group-reactions'
import { reactionKindForEmoji } from '@/shared/lib/reactions/reaction-options'
import type { DmReaction } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageReactionBadgeProps = {
  reactions: DmReaction[]
  isOutgoing: boolean
  onReact: (emoji: string) => void
}

export const MessageReactionBadge = memo(function MessageReactionBadge({
  reactions,
  isOutgoing,
  onReact,
}: MessageReactionBadgeProps) {
  const grouped = useMemo(() => groupReactionsByEmoji(reactions), [reactions])
  if (!grouped.length) return null

  const totalCount = reactions.length
  const displayEmojis = grouped.slice(0, 3)

  return (
    <div
      className={cn('messenger-reaction-badge', isOutgoing && 'is-outgoing')}
      aria-label={`${totalCount} reaction${totalCount === 1 ? '' : 's'}`}
    >
      {displayEmojis.map(([emoji]) => {
        const kind = reactionKindForEmoji(emoji)

        return (
          <button
            key={emoji}
            type="button"
            className="messenger-reaction-badge__emoji"
            aria-label={`React ${emoji}`}
            onClick={() => onReact(emoji)}
          >
            {kind ? (
              <ReactionPickerIcon kind={kind} label={emoji} size="inline" />
            ) : (
              emoji
            )}
          </button>
        )
      })}
      {totalCount > 1 ? <span className="messenger-reaction-badge__count">{totalCount}</span> : null}
    </div>
  )
})
