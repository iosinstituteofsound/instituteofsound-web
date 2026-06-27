import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentDialog } from '@/modules/feed/components/feed-comment-dialog'
import { FeedShareDialog } from '@/modules/feed/components/feed-share-dialog'
import { ReactionPickerIcon } from '@/modules/feed/components/feed-reaction-icons'
import { FeedReactionPicker } from '@/modules/feed/components/feed-reaction-picker'
import { useSetFeedReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { formatEngagementCount } from '@/modules/feed/lib/format-engagement-count'
import { feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedItemDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { cn } from '@/shared/lib/cn'

interface ReelActionsProps {
  item: FeedItemDto
}

const ICON_PROPS = {
  className: 'reel-actions__icon',
  strokeWidth: 2.5,
} as const

const REACTION_STATE_CLASS: Record<FeedReactionKind, string> = {
  like: 'reel-actions__btn--liked',
  love: 'reel-actions__btn--loved',
  haha: 'reel-actions__btn--haha',
  wow: 'reel-actions__btn--wow',
  sad: 'reel-actions__btn--sad',
  angry: 'reel-actions__btn--angry',
}

function ReelActionButton({
  label,
  count,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string
  count?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn('reel-actions__btn', className)}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      {children}
      {count ? <span className="reel-actions__count">{count}</span> : null}
    </button>
  )
}

/** Vertical engagement bar — Facebook Reels style. */
export function ReelActions({ item }: ReelActionsProps) {
  const userId = useAuthStore((s) => s.userId)
  const engagement = getEngagement(item)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const likeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const setReaction = useSetFeedReaction()

  const myReaction = engagement.myReaction ? feedReactionMeta(engagement.myReaction) : null
  const likeCount = formatEngagementCount(engagement.reactionTotal)
  const commentCount = formatEngagementCount(engagement.commentCount)

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openPicker = () => {
    clearCloseTimer()
    setPickerOpen(true)
  }

  const scheduleClosePicker = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPickerOpen(false), 280)
  }

  const react = (kind: FeedReactionKind) => {
    if (!userId || setReaction.isPending) return
    setPickerOpen(false)
    setReaction.mutate({ feedItemId: item.id, kind })
  }

  const onQuickLike = () => {
    if (!userId) return
    react(engagement.myReaction ?? 'like')
  }

  const likeButton = userId ? (
    <button
      ref={likeButtonRef}
      type="button"
      className={cn(
        'reel-actions__btn',
        engagement.myReaction && REACTION_STATE_CLASS[engagement.myReaction],
      )}
      aria-label={myReaction ? myReaction.label : 'Like'}
      disabled={setReaction.isPending}
      onClick={(event) => {
        event.stopPropagation()
        onQuickLike()
      }}
    >
      {myReaction && myReaction.kind === 'like' ? (
        <ThumbsUp {...ICON_PROPS} fill="currentColor" className="reel-actions__icon reel-actions__icon--active" />
      ) : myReaction ? (
        <ReactionPickerIcon kind={myReaction.kind} label={myReaction.label} size="inline" />
      ) : (
        <ThumbsUp {...ICON_PROPS} />
      )}
      <span className="reel-actions__count">{likeCount}</span>
    </button>
  ) : (
    <Link
      to="/auth/login"
      className="reel-actions__btn"
      aria-label="Like"
      onClick={(event) => event.stopPropagation()}
    >
      <ThumbsUp {...ICON_PROPS} />
      <span className="reel-actions__count">{likeCount}</span>
    </Link>
  )

  return (
    <>
      <div className="reel-actions" onClick={(event) => event.stopPropagation()}>
        <div
          className="reel-actions__slot"
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClosePicker}
        >
          {pickerOpen ? (
            <FeedReactionPicker
              open={pickerOpen}
              anchorRef={likeButtonRef}
              myReaction={engagement.myReaction}
              disabled={setReaction.isPending}
              onSelect={react}
              onMouseEnter={openPicker}
              onMouseLeave={scheduleClosePicker}
            />
          ) : null}
          {likeButton}
        </div>

        <ReelActionButton
          label="Comment"
          count={commentCount}
          onClick={() => setCommentDialogOpen(true)}
        >
          <MessageCircle {...ICON_PROPS} />
        </ReelActionButton>

        <ReelActionButton label="Share" onClick={() => setShareDialogOpen(true)}>
          <Share2 {...ICON_PROPS} />
        </ReelActionButton>

        <ReelActionButton label="More options">
          <MoreHorizontal {...ICON_PROPS} />
        </ReelActionButton>
      </div>

      <FeedCommentDialog item={item} open={commentDialogOpen} onOpenChange={setCommentDialogOpen} />
      <FeedShareDialog item={item} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </>
  )
}
