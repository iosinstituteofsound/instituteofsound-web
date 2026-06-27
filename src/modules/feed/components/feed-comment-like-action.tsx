import { useState } from 'react'
import { FeedCommentReactionsDialog } from '@/modules/feed/components/feed-comment-reactions-dialog'
import { useSetFeedCommentReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedCommentDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { ReactionHoverPickerSlot, ReactionPickerIcon } from '@/shared/components/reactions'
import { formatEngagementCount } from '@/shared/lib/format-count'
import { unlockReactionSounds } from '@/shared/lib/reactions/reaction-sounds'
import { useReactionHoverPicker } from '@/shared/hooks/use-reaction-hover-picker'
import { cn } from '@/shared/lib/cn'

const COMMENT_REACTION_STATE_CLASS: Record<FeedReactionKind, string> = {
  like: 'text-primary',
  love: 'text-rose-500',
  haha: 'text-amber-500',
  wow: 'text-amber-400',
  sad: 'text-sky-400',
  angry: 'text-orange-500',
}

interface FeedCommentLikeActionProps {
  feedItemId: string
  comment: FeedCommentDto
}

export function FeedCommentLikeAction({ feedItemId, comment }: FeedCommentLikeActionProps) {
  const setReaction = useSetFeedCommentReaction()
  const [reactionsDialogOpen, setReactionsDialogOpen] = useState(false)
  const {
    pickerOpen,
    setPickerOpen,
    likeButtonRef,
    containerRef,
    openPicker,
    scheduleClosePicker,
  } = useReactionHoverPicker({ unlockSounds: unlockReactionSounds })

  const engagement = comment.engagement
  const myReaction = engagement?.myReaction ? feedReactionMeta(engagement.myReaction) : null
  const reactionTotal = engagement?.reactionTotal ?? 0

  const react = (kind: FeedReactionKind) => {
    if (setReaction.isPending) return
    setPickerOpen(false)
    setReaction.mutate({ feedItemId, commentId: comment.id, kind })
  }

  const onQuickLike = () => {
    react(engagement?.myReaction ?? 'like')
  }

  const openReactionsDialog = () => {
    if (reactionTotal <= 0) return
    setPickerOpen(false)
    setReactionsDialogOpen(true)
  }

  return (
    <>
      <ReactionHoverPickerSlot
        pickerOpen={pickerOpen}
        anchorRef={likeButtonRef}
        containerRef={containerRef}
        myReaction={engagement?.myReaction ?? null}
        disabled={setReaction.isPending}
        size="compact"
        onSelect={react}
        onMouseEnter={openPicker}
        onMouseLeave={scheduleClosePicker}
        className="relative inline-flex items-center gap-1.5"
      >
        <button
          ref={likeButtonRef}
          type="button"
          className={cn(
            'inline-flex items-center gap-1 hover:underline',
            myReaction && COMMENT_REACTION_STATE_CLASS[myReaction.kind],
          )}
          aria-label={myReaction ? myReaction.label : 'Like'}
          disabled={setReaction.isPending}
          onClick={onQuickLike}
        >
          {myReaction ? (
            <>
              <ReactionPickerIcon kind={myReaction.kind} label={myReaction.label} size="inline" />
              <span>{myReaction.label}</span>
            </>
          ) : (
            'Like'
          )}
        </button>
        {reactionTotal > 0 ? (
          <button
            type="button"
            className="font-semibold tabular-nums text-muted-foreground/90 hover:underline"
            aria-label={`${reactionTotal} reactions`}
            onClick={openReactionsDialog}
          >
            {formatEngagementCount(reactionTotal)}
          </button>
        ) : null}
      </ReactionHoverPickerSlot>
      <FeedCommentReactionsDialog
        feedItemId={feedItemId}
        commentId={comment.id}
        engagement={engagement}
        open={reactionsDialogOpen}
        onOpenChange={setReactionsDialogOpen}
      />
    </>
  )
}
