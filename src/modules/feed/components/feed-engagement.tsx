import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentsSection } from '@/modules/feed/components/feed-comments-section'
import { useSetFeedReaction } from '@/modules/feed/hooks/use-feed-engagement'
import { getEngagement } from '@/modules/feed/lib/feed-engagement'
import { buildFeedPostPageMeta } from '@/modules/feed/lib/feed-post-meta'
import type { FeedItemDto, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { env } from '@/shared/config/env'
import { cn } from '@/shared/lib/cn'

const REACTIONS: {
  kind: FeedReactionKind
  label: string
  emoji: string
  activeClass: string
}[] = [
  { kind: 'like', label: 'Like', emoji: '👍', activeClass: 'text-blue-600' },
  { kind: 'love', label: 'Love', emoji: '❤️', activeClass: 'text-red-500' },
  { kind: 'haha', label: 'Haha', emoji: '😂', activeClass: 'text-yellow-500' },
  { kind: 'wow', label: 'Wow', emoji: '😮', activeClass: 'text-yellow-600' },
  { kind: 'sad', label: 'Sad', emoji: '😢', activeClass: 'text-yellow-600' },
  { kind: 'angry', label: 'Angry', emoji: '😡', activeClass: 'text-orange-600' },
]

function reactionMeta(kind: FeedReactionKind) {
  return REACTIONS.find((r) => r.kind === kind) ?? REACTIONS[0]!
}

interface FeedEngagementProps {
  item: FeedItemDto
  defaultCommentsOpen?: boolean
}

export function FeedEngagement({ item, defaultCommentsOpen = false }: FeedEngagementProps) {
  const userId = useAuthStore((s) => s.userId)
  const engagement = getEngagement(item)
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share')
  const reactRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setReaction = useSetFeedReaction()

  const activeKinds = REACTIONS.filter((r) => engagement.reactions[r.kind] > 0).sort(
    (a, b) => engagement.reactions[b.kind] - engagement.reactions[a.kind],
  )
  const myReaction = engagement.myReaction ? reactionMeta(engagement.myReaction) : null
  const showStats = engagement.reactionTotal > 0 || engagement.commentCount > 0

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
        setShareLabel('Shared')
      } else {
        await navigator.clipboard.writeText(url)
        setShareLabel('Link copied')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setShareLabel('Link copied')
      } catch {
        setShareLabel('Share failed')
      }
    }
    window.setTimeout(() => setShareLabel('Share'), 2000)
  }

  return (
    <div className="border-t">
      {showStats ? (
        <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
          {engagement.reactionTotal > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex -space-x-1">
                {activeKinds.slice(0, 3).map((r) => (
                  <span
                    key={r.kind}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs"
                    aria-hidden
                  >
                    {r.emoji}
                  </span>
                ))}
              </span>
              <span>{engagement.reactionTotal}</span>
            </span>
          ) : (
            <span />
          )}
          {engagement.commentCount > 0 ? (
            <button
              type="button"
              className="hover:underline"
              onClick={() => setCommentsOpen(true)}
            >
              {engagement.commentCount} comment{engagement.commentCount === 1 ? '' : 's'}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-3 border-t">
        {userId ? (
          <div
            ref={reactRef}
            className="relative"
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClosePicker}
          >
            {pickerOpen ? (
              <div
                className="absolute bottom-full left-1/2 z-20 mb-2 flex -translate-x-1/2 gap-1 rounded-full border bg-card px-2 py-1.5 shadow-lg"
                onMouseEnter={openPicker}
                onMouseLeave={scheduleClosePicker}
              >
                {REACTIONS.map((r) => (
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
                'flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/60',
                myReaction?.activeClass,
              )}
              disabled={setReaction.isPending}
              onClick={onQuickLike}
            >
              {myReaction ? (
                <span className="text-base" aria-hidden>
                  {myReaction.emoji}
                </span>
              ) : (
                <ThumbsUp className="h-[18px] w-[18px]" />
              )}
              {myReaction ? myReaction.label : 'Like'}
            </button>
          </div>
        ) : (
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
          >
            <ThumbsUp className="h-[18px] w-[18px]" />
            Like
          </Link>
        )}

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
          onClick={() => setCommentsOpen((open) => !open)}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          Comment
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
          onClick={() => void sharePost()}
        >
          <Share2 className="h-[18px] w-[18px]" />
          {shareLabel}
        </button>
      </div>

      {commentsOpen ? <FeedCommentsSection feedItemId={item.id} /> : null}
    </div>
  )
}
