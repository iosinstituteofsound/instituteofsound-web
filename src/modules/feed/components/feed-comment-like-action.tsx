import { useRef, useState } from 'react'
import { FeedCommentReactionsDialog } from '@/modules/feed/components/feed-comment-reactions-dialog'
import { ReactionPickerIcon } from '@/modules/feed/components/feed-reaction-icons'
import { FeedReactionPicker } from '@/modules/feed/components/feed-reaction-picker'
import { useSetFeedCommentReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { formatEngagementCount } from '@/modules/feed/lib/format-engagement-count'
import { feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import { unlockReactionSounds } from '@/modules/feed/lib/feed-reaction-sounds'
import type { FeedCommentDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [reactionsDialogOpen, setReactionsDialogOpen] = useState(false)
  const likeButtonRef = useRef<HTMLButtonElement>(null)
  const reactRef = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const engagement = comment.engagement
  const myReaction = engagement?.myReaction ? feedReactionMeta(engagement.myReaction) : null
  const reactionTotal = engagement?.reactionTotal ?? 0

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openPicker = () => {
    clearCloseTimer()
    unlockReactionSounds()
    setPickerOpen(true)
  }

  const scheduleClosePicker = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPickerOpen(false), 280)
  }

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
      <span
        ref={reactRef}
        className="relative inline-flex items-center gap-1.5"
        onMouseEnter={openPicker}
        onMouseLeave={scheduleClosePicker}
      >
      {pickerOpen ? (
        <FeedReactionPicker
          open={pickerOpen}
          anchorRef={likeButtonRef}
          myReaction={engagement?.myReaction ?? null}
          disabled={setReaction.isPending}
          size="compact"
          onSelect={react}
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClosePicker}
        />
      ) : null}
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
      </span>
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
