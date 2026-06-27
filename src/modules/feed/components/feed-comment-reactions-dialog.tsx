import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ReactionPickerIcon } from '@/shared/components/reactions'
import { FeedAuthorProfileLink } from '@/modules/feed/components/feed-author-profile-link'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { useFeedCommentReactions } from '@/modules/feed/hooks/use-feed-engagement'
import { formatEngagementCount } from '@/modules/feed/lib/format-engagement-count'
import { FEED_REACTION_OPTIONS, feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedCommentEngagementSummary, FeedReactionKind } from '@/modules/feed/types/feed.types'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { cn } from '@/shared/lib/cn'
import './feed-comment-reactions-dialog.css'

type ReactionFilter = 'all' | FeedReactionKind

interface FeedCommentReactionsDialogProps {
  feedItemId: string
  commentId: string
  engagement?: FeedCommentEngagementSummary
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedCommentReactionsDialog({
  feedItemId,
  commentId,
  engagement,
  open,
  onOpenChange,
}: FeedCommentReactionsDialogProps) {
  const [filter, setFilter] = useState<ReactionFilter>('all')
  const { data, isLoading } = useFeedCommentReactions(feedItemId, commentId, open)

  const reactions = Array.isArray(data) ? data : []
  const activeKinds = FEED_REACTION_OPTIONS.filter((option) => (engagement?.reactions[option.kind] ?? 0) > 0)

  const filteredReactions = useMemo(() => {
    if (filter === 'all') return reactions
    return reactions.filter((entry) => entry.kind === filter)
  }, [filter, reactions])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setFilter('all')
    onOpenChange(nextOpen)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="feed-comment-reactions-dialog__overlay" />
        <DialogPrimitive.Content
          className="feed-comment-reactions-dialog"
          aria-describedby={undefined}
        >
          <header className="feed-comment-reactions-dialog__header">
            <DialogPrimitive.Title className="feed-comment-reactions-dialog__title">
              Reactions
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="feed-comment-reactions-dialog__close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </header>

          {activeKinds.length > 1 ? (
            <div className="feed-comment-reactions-dialog__tabs" role="tablist" aria-label="Filter reactions">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                className={cn('feed-comment-reactions-dialog__tab', filter === 'all' && 'is-active')}
                onClick={() => setFilter('all')}
              >
                All
                <span className="feed-comment-reactions-dialog__tab-count">
                  {formatEngagementCount(engagement?.reactionTotal ?? reactions.length)}
                </span>
              </button>
              {activeKinds.map((option) => (
                <button
                  key={option.kind}
                  type="button"
                  role="tab"
                  aria-selected={filter === option.kind}
                  className={cn(
                    'feed-comment-reactions-dialog__tab',
                    filter === option.kind && 'is-active',
                  )}
                  onClick={() => setFilter(option.kind)}
                >
                  <ReactionPickerIcon kind={option.kind} label={option.label} size="inline" />
                  <span className="feed-comment-reactions-dialog__tab-count">
                    {formatEngagementCount(engagement?.reactions[option.kind] ?? 0)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="feed-comment-reactions-dialog__list">
            {isLoading ? (
              <p className="feed-comment-reactions-dialog__loading">Loading reactions…</p>
            ) : filteredReactions.length === 0 ? (
              <p className="feed-comment-reactions-dialog__empty">No reactions yet.</p>
            ) : (
              filteredReactions.map((entry) => {
                const meta = feedReactionMeta(entry.kind)
                return (
                  <div key={`${entry.user.id}-${entry.kind}-${entry.createdAt}`} className="feed-comment-reactions-dialog__item">
                    <FeedAuthorProfileLink author={entry.user} variant="avatar" className="shrink-0">
                      <FeedUserAvatar
                        name={entry.user.name}
                        avatarUrl={entry.user.avatarUrl}
                        className="h-8 w-8"
                      />
                    </FeedAuthorProfileLink>
                    <FeedAuthorProfileLink author={entry.user} variant="name" className="min-w-0 flex-1">
                      <VerifiedUserName
                        name={entry.user.name}
                        isVerified={entry.user.isVerified}
                        className="feed-comment-reactions-dialog__item-name"
                      />
                    </FeedAuthorProfileLink>
                    <span className="feed-comment-reactions-dialog__item-reaction">
                      <ReactionPickerIcon kind={meta.kind} label={meta.label} size="inline" />
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
