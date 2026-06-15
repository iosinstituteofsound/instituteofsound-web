import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentsSection } from '@/modules/feed/components/feed-comments-section'
import { useSetFeedReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { buildFeedPostPageMeta } from '@/modules/feed/lib/feed-post-meta'
import { FEED_REACTION_OPTIONS, feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedItemDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { env } from '@/shared/config/env'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

interface FeedEngagementProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
}

export function FeedEngagement({ item, defaultCommentsOpen = false }: FeedEngagementProps) {
  const userId = useAuthStore((s) => s.userId)
  const engagement = getEngagement(item)
  const [commentsExpanded, setCommentsExpanded] = useState(defaultCommentsOpen)
  const [pickerOpen, setPickerOpen] = useState(false)
  const reactRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
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
    setPickerOpen(true)
  }

  const scheduleClosePicker = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPickerOpen(false), 200)
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

  const focusComments = () => {
    setCommentsExpanded(true)
    window.setTimeout(() => commentInputRef.current?.focus(), 0)
  }

  const sharePost = async () => {
    const origin = (typeof window !== 'undefined' ? window.location.origin : env.siteUrl).replace(/\/+$/, '')
    const url = `${origin}/feed/${item.id}`
    const meta = buildFeedPostPageMeta(item)
    const shareTitle = meta.title.replace(/ · Institute of Sound$/, '')

    try {
      if (navigator.share) {
        await navigator.share({
          url,
          title: shareTitle,
          text: meta.description,
        })
        toast.success('Post shared')
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      } catch {
        toast.error('Could not share post')
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 py-1 sm:px-3">
        <div className="flex items-center">
          {userId ? (
            <div
              ref={reactRef}
              className="relative"
              onMouseEnter={openPicker}
              onMouseLeave={scheduleClosePicker}
            >
              {pickerOpen ? (
                <div
                  className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border bg-card px-2 py-1.5 shadow-lg"
                  onMouseEnter={openPicker}
                  onMouseLeave={scheduleClosePicker}
                >
                  {FEED_REACTION_OPTIONS.map((r) => (
                    <button
                      key={r.kind}
                      type="button"
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125',
                        engagement.myReaction === r.kind && 'bg-muted',
                      )}
                      title={r.label}
                      disabled={setReaction.isPending}
                      onClick={() => react(r.kind)}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted/70',
                  myReaction?.activeClass,
                )}
                aria-label={myReaction ? myReaction.label : 'Like'}
                disabled={setReaction.isPending}
                onClick={onQuickLike}
              >
                {myReaction ? (
                  <span className="text-lg" aria-hidden>
                    {myReaction.emoji}
                  </span>
                ) : (
                  <ThumbsUp className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70"
              aria-label="Like"
            >
              <ThumbsUp className="h-5 w-5" />
            </Link>
          )}

          <button
            type="button"
            className="flex h-9 items-center justify-center gap-1 rounded-full px-2 text-muted-foreground transition-colors hover:bg-muted/70"
            aria-label="Comment"
            onClick={focusComments}
          >
            <MessageCircle className="h-5 w-5" />
            {engagement.commentCount > 0 ? (
              <span className="min-w-[1ch] text-sm font-medium text-foreground">{engagement.commentCount}</span>
            ) : null}
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70"
            aria-label="Share"
            onClick={() => void sharePost()}
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {engagement.reactionTotal > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted/50"
          >
            <span className="inline-flex -space-x-1">
              {activeKinds.slice(0, 3).map((r) => (
                <span
                  key={r.kind}
                  className={cn(
                    'inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-card text-[10px] leading-none',
                    r.bubbleClass,
                  )}
                  aria-hidden
                >
                  {r.emoji}
                </span>
              ))}
            </span>
            <span>{engagement.reactionTotal}</span>
          </button>
        ) : null}
      </div>

      <FeedCommentsSection
        feedItemId={item.id}
        expanded={commentsExpanded}
        onExpand={() => setCommentsExpanded(true)}
        inputRef={commentInputRef}
      />
    </div>
  )
}
