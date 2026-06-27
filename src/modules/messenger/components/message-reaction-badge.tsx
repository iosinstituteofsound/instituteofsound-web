import { memo, useMemo } from 'react'
import type { DmReaction } from '@/modules/messenger/types/messenger.types'
import { cn } from '@/shared/lib/cn'

type MessageReactionBadgeProps = {
  reactions: DmReaction[]
  isOutgoing: boolean
  onReact: (emoji: string) => void
}

function groupReactions(reactions: DmReaction[]) {
  const groups = new Map<string, number>()
  for (const reaction of reactions) {
    groups.set(reaction.emoji, (groups.get(reaction.emoji) ?? 0) + 1)
  }
  return [...groups.entries()]
}

export const MessageReactionBadge = memo(function MessageReactionBadge({
  reactions,
  isOutgoing,
  onReact,
}: MessageReactionBadgeProps) {
  const grouped = useMemo(() => groupReactions(reactions), [reactions])
  if (!grouped.length) return null

  const totalCount = reactions.length
  const displayEmojis = grouped.slice(0, 3)

  return (
    <div
      className={cn('messenger-reaction-badge', isOutgoing && 'is-outgoing')}
      aria-label={`${totalCount} reaction${totalCount === 1 ? '' : 's'}`}
    >
      {displayEmojis.map(([emoji]) => (
        <button
          key={emoji}
          type="button"
          className="messenger-reaction-badge__emoji"
          aria-label={`React ${emoji}`}
          onClick={() => onReact(emoji)}
        >
          {emoji}
        </button>
      ))}
      {totalCount > 1 ? <span className="messenger-reaction-badge__count">{totalCount}</span> : null}
    </div>
  )
})
