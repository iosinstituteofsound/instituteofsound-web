import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { ReactionPickerIcon } from '@/shared/components/reactions'
import { formatEngagementCount } from '@/shared/lib/format-count'
import { REACTION_OPTIONS, type ReactionKind } from '@/shared/lib/reactions/reaction-options'

type ReactionsBreakdown = Partial<Record<ReactionKind, number>>

function getActiveReactionKinds(reactions: ReactionsBreakdown) {
  return REACTION_OPTIONS.filter((option) => (reactions[option.kind] ?? 0) > 0).sort(
    (a, b) => (reactions[b.kind] ?? 0) - (reactions[a.kind] ?? 0),
  )
}

interface EngagementStatsRowProps {
  variant: 'social' | 'compact'
  reactionTotal: number
  commentCount: number
  reactions: ReactionsBreakdown
  onCommentsClick?: () => void
  showShareMetric?: boolean
}

export function EngagementStatsRow({
  variant,
  reactionTotal,
  commentCount,
  reactions,
  onCommentsClick,
  showShareMetric = false,
}: EngagementStatsRowProps) {
  const activeKinds = getActiveReactionKinds(reactions)

  if (variant === 'social') {
    return (
      <div className="feed-social-card__stats">
        <div className="feed-social-card__stats-left">
          {reactionTotal > 0 ? (
            <span className="feed-social-card__reaction-stack" aria-hidden>
              {activeKinds.slice(0, 3).map((reaction) => (
                <span key={reaction.kind} className="feed-social-card__reaction-bubble">
                  <ReactionPickerIcon kind={reaction.kind} label={reaction.label} size="inline" />
                </span>
              ))}
            </span>
          ) : null}
          <span className="feed-social-card__stats-count">{formatEngagementCount(reactionTotal)}</span>
        </div>
        <div className="feed-social-card__stats-right">
          <button type="button" className="feed-social-card__stats-link" onClick={onCommentsClick}>
            {formatEngagementCount(commentCount)} comments
          </button>
        </div>
      </div>
    )
  }

  if (reactionTotal === 0 && commentCount === 0) {
    return null
  }

  return (
    <div className="feed-engagement-stats-bar">
      <div className="feed-engagement-stats-bar__left">
        {reactionTotal > 0 ? (
          <span className="feed-engagement-stats-bar__metric">
            <ThumbsUp className="h-4 w-4" />
            {formatEngagementCount(reactionTotal)}
          </span>
        ) : null}
        {commentCount > 0 ? (
          <span className="feed-engagement-stats-bar__metric">
            <MessageCircle className="h-4 w-4" />
            {formatEngagementCount(commentCount)}
          </span>
        ) : null}
        {showShareMetric ? (
          <span className="feed-engagement-stats-bar__metric">
            <Share2 className="h-4 w-4" />
            0
          </span>
        ) : null}
      </div>
      {reactionTotal > 0 ? (
        <div className="feed-engagement-stats-bar__reactions" aria-hidden>
          {activeKinds.slice(0, 3).map((reaction) => (
            <span key={reaction.kind} className="feed-engagement-stats-bar__reaction-bubble">
              <ReactionPickerIcon kind={reaction.kind} label={reaction.label} size="inline" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
