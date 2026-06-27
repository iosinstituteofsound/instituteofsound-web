import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { ReactionPickerIcon } from '@/shared/components/reactions'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { formatEngagementCount } from '@/modules/feed/lib/format-engagement-count'
import { FEED_REACTION_OPTIONS } from '@/modules/feed/lib/feed-reactions'

interface FeedEngagementStatsBarProps {
  item: FeedItemDto
}

export function FeedEngagementStatsBar({ item }: FeedEngagementStatsBarProps) {
  const engagement = getEngagement(item)
  const activeKinds = FEED_REACTION_OPTIONS.filter((r) => engagement.reactions[r.kind] > 0).sort(
    (a, b) => engagement.reactions[b.kind] - engagement.reactions[a.kind],
  )

  if (engagement.reactionTotal === 0 && engagement.commentCount === 0) {
    return null
  }

  return (
    <div className="feed-engagement-stats-bar">
      <div className="feed-engagement-stats-bar__left">
        {engagement.reactionTotal > 0 ? (
          <span className="feed-engagement-stats-bar__metric">
            <ThumbsUp className="h-4 w-4" />
            {formatEngagementCount(engagement.reactionTotal)}
          </span>
        ) : null}
        {engagement.commentCount > 0 ? (
          <span className="feed-engagement-stats-bar__metric">
            <MessageCircle className="h-4 w-4" />
            {formatEngagementCount(engagement.commentCount)}
          </span>
        ) : null}
        <span className="feed-engagement-stats-bar__metric">
          <Share2 className="h-4 w-4" />
          0
        </span>
      </div>
      {engagement.reactionTotal > 0 ? (
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
