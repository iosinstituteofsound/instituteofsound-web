import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentDialog } from '@/modules/feed/components/feed-comment-dialog'
import { FeedShareDialog } from '@/modules/feed/components/feed-share-dialog'
import { ReactionPickerIcon } from '@/modules/feed/components/feed-reaction-icons'
import { FeedReactionPicker } from '@/modules/feed/components/feed-reaction-picker'
import { useSetFeedReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { formatEngagementCount } from '@/modules/feed/lib/format-engagement-count'
import { FEED_REACTION_OPTIONS, feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import { unlockReactionSounds } from '@/modules/feed/lib/feed-reaction-sounds'
import type { FeedItemDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { cn } from '@/shared/lib/cn'

interface FeedEngagementProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
  variant?: 'default' | 'social'
  trailingAction?: ReactNode
}

const REACTION_STATE_CLASS: Record<FeedReactionKind, string> = {
  like: 'is-active',
  love: 'is-loved',
  haha: 'is-haha',
  wow: 'is-wow',
  sad: 'is-sad',
  angry: 'is-angry',
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const reactRef = useRef<HTMLDivElement>(null)
  const likeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setReaction = useSetFeedReaction()

  const activeKinds = FEED_REACTION_OPTIONS.filter((r) => engagement.reactions[r.kind] > 0).sort(
    (a, b) => engagement.reactions[b.kind] - engagement.reactions[a.kind],
  )
  const myReaction = engagement.myReaction ? feedReactionMeta(engagement.myReaction) : null

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
        'feed-social-card__action-btn',
        engagement.myReaction && REACTION_STATE_CLASS[engagement.myReaction],
      )}
      aria-label={myReaction ? myReaction.label : 'Like'}
      disabled={setReaction.isPending}
      onClick={onQuickLike}
    >
      {likeButtonInner}
      <span>Like</span>
    </button>
  ) : (
    <Link to="/auth/login" className="feed-social-card__action-btn" aria-label="Like">
      <ThumbsUp className="h-5 w-5" />
      <span>Like</span>
    </Link>
  )

  if (variant === 'social') {
    return (
      <>
        <div className="feed-social-card__engagement">
          <div className="feed-social-card__stats">
            <div className="feed-social-card__stats-left">
              {engagement.reactionTotal > 0 ? (
                <span className="feed-social-card__reaction-stack" aria-hidden>
                  {activeKinds.slice(0, 3).map((reaction) => (
                    <span key={reaction.kind} className="feed-social-card__reaction-bubble">
                      <ReactionPickerIcon kind={reaction.kind} label={reaction.label} size="inline" />
                    </span>
                  ))}
                </span>
              ) : null}
              <span className="feed-social-card__stats-count">
                {formatEngagementCount(engagement.reactionTotal)}
              </span>
            </div>
            <div className="feed-social-card__stats-right">
              <button
                type="button"
                className="feed-social-card__stats-link"
                onClick={openComments}
              >
                {formatEngagementCount(engagement.commentCount)} comments
              </button>
            </div>
          </div>

          <div className="feed-social-card__divider" />

          <div className="feed-social-card__action-bar">
            <div
              ref={reactRef}
              className="feed-social-card__action-slot"
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

            <div className="feed-social-card__action-slot">
              <button
                type="button"
                className="feed-social-card__action-btn"
                aria-label="Comment"
                onClick={openComments}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Comment</span>
              </button>
            </div>

            <div className="feed-social-card__action-slot">
              <button
                type="button"
                className="feed-social-card__action-btn"
                aria-label="Share"
                onClick={openShare}
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

            {trailingAction ? (
              <div className="feed-social-card__action-slot feed-social-card__action-slot--trailing">
                {trailingAction}
              </div>
            ) : null}
          </div>
        </div>

        <FeedCommentDialog item={item} open={commentDialogOpen} onOpenChange={setCommentDialogOpen} />
        <FeedShareDialog item={item} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      </>
    )
  }

  return (
    <>
      <div>
        <div className="feed-social-card__action-bar">
          <div className="feed-social-card__action-slot">{likeButton}</div>
          <div className="feed-social-card__action-slot">
            <button type="button" className="feed-social-card__action-btn" onClick={openComments}>
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
          </div>
          <div className="feed-social-card__action-slot">
            <button type="button" className="feed-social-card__action-btn" onClick={openShare}>
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      <FeedCommentDialog item={item} open={commentDialogOpen} onOpenChange={setCommentDialogOpen} />
      <FeedShareDialog item={item} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </>
  )
}
