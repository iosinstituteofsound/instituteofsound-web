import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentDialog } from '@/modules/feed/components/feed-comment-dialog'
import { FeedShareDialog } from '@/modules/feed/components/feed-share-dialog'
import { useSetFeedReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { reactionMeta } from '@/shared/lib/reactions/reaction-options'
import type { FeedItemDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import {
  EngagementActionBar,
  EngagementActionButton,
  EngagementActionSlot,
  EngagementStatsRow,
} from '@/shared/components/engagement'
import { ReactionHoverPickerSlot, ReactionPickerIcon } from '@/shared/components/reactions'
import { unlockReactionSounds } from '@/shared/lib/reactions/reaction-sounds'
import { useReactionHoverPicker } from '@/shared/hooks/use-reaction-hover-picker'
import { cn } from '@/shared/lib/cn'
import '@/shared/components/engagement/engagement-action-bar.css'

import { ENGAGEMENT_REACTION_STATE_CLASS, reactionStateClass } from '@/shared/lib/reactions/reaction-state-classes'

interface FeedEngagementProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
  variant?: 'default' | 'social'
  trailingAction?: ReactNode
}

export function FeedEngagement({
  item,
  defaultCommentsOpen = false,
  variant = 'default',
  trailingAction,
}: FeedEngagementProps) {
  const userId = useAuthStore((s) => s.userId)
  const engagement = getEngagement(item)
  const [commentDialogOpen, setCommentDialogOpen] = useState(defaultCommentsOpen)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const {
    pickerOpen,
    setPickerOpen,
    likeButtonRef,
    containerRef,
    openPicker,
    scheduleClosePicker,
  } = useReactionHoverPicker({ unlockSounds: unlockReactionSounds })

  const setReaction = useSetFeedReaction()

  const myReaction = engagement.myReaction ? reactionMeta(engagement.myReaction) : null

  const react = (kind: FeedReactionKind) => {
    if (!userId || setReaction.isPending) return
    setPickerOpen(false)
    setReaction.mutate({ feedItemId: item.id, kind })
  }

  const onQuickLike = () => {
    if (!userId) return
    react(engagement.myReaction ?? 'like')
  }

  const openComments = () => {
    setCommentDialogOpen(true)
  }

  const openShare = () => {
    setShareDialogOpen(true)
  }

  const likeButtonInner = myReaction ? (
    <ReactionPickerIcon kind={myReaction.kind} label={myReaction.label} size="inline" />
  ) : (
    <ThumbsUp className="h-5 w-5" />
  )

  const likeButton = userId ? (
    <button
      ref={likeButtonRef}
      type="button"
      className={cn(
        'ios-engagement-action-bar__btn',
        engagement.myReaction && reactionStateClass(engagement.myReaction, ENGAGEMENT_REACTION_STATE_CLASS),
      )}
      aria-label={myReaction ? myReaction.label : 'Like'}
      disabled={setReaction.isPending}
      onClick={onQuickLike}
    >
      {likeButtonInner}
      <span>Like</span>
    </button>
  ) : (
    <Link to="/auth/login" className="ios-engagement-action-bar__btn" aria-label="Like">
      <ThumbsUp className="h-5 w-5" />
      <span>Like</span>
    </Link>
  )

  if (variant === 'social') {
    return (
      <>
        <div className="feed-social-card__engagement">
          <EngagementStatsRow
            variant="social"
            reactionTotal={engagement.reactionTotal}
            commentCount={engagement.commentCount}
            reactions={engagement.reactions}
            onCommentsClick={openComments}
          />

          <div className="feed-social-card__divider" />

          <EngagementActionBar>
            <ReactionHoverPickerSlot
              pickerOpen={pickerOpen}
              anchorRef={likeButtonRef}
              containerRef={containerRef}
              myReaction={engagement.myReaction}
              disabled={setReaction.isPending}
              onSelect={react}
              onMouseEnter={openPicker}
              onMouseLeave={scheduleClosePicker}
              className="ios-engagement-action-bar__slot"
            >
              {likeButton}
            </ReactionHoverPickerSlot>

            <EngagementActionSlot>
              <EngagementActionButton aria-label="Comment" onClick={openComments}>
                <MessageCircle className="h-5 w-5" />
                <span>Comment</span>
              </EngagementActionButton>
            </EngagementActionSlot>

            <EngagementActionSlot>
              <EngagementActionButton aria-label="Share" onClick={openShare}>
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </EngagementActionButton>
            </EngagementActionSlot>

            {trailingAction ? (
              <EngagementActionSlot trailing>{trailingAction}</EngagementActionSlot>
            ) : null}
          </EngagementActionBar>
        </div>

        <FeedCommentDialog item={item} open={commentDialogOpen} onOpenChange={setCommentDialogOpen} />
        <FeedShareDialog item={item} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      </>
    )
  }

  return (
    <>
      <div>
        <EngagementActionBar>
          <EngagementActionSlot>{likeButton}</EngagementActionSlot>
          <EngagementActionSlot>
            <EngagementActionButton onClick={openComments}>
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </EngagementActionButton>
          </EngagementActionSlot>
          <EngagementActionSlot>
            <EngagementActionButton onClick={openShare}>
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </EngagementActionButton>
          </EngagementActionSlot>
        </EngagementActionBar>
      </div>

      <FeedCommentDialog item={item} open={commentDialogOpen} onOpenChange={setCommentDialogOpen} />
      <FeedShareDialog item={item} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </>
  )
}
