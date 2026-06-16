import { useMemo, useState } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedCommentComposer } from '@/modules/feed/components/feed-comment-composer'
import { FeedCommentLikeAction } from '@/modules/feed/components/feed-comment-like-action'
import { FeedAuthorProfileLink } from '@/modules/feed/components/feed-author-profile-link'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  useDeleteFeedComment,
  useFeedComments,
} from '@/modules/feed/hooks/use-feed-engagement'
import { formatCommentTimestamp } from '@/modules/feed/lib/feed-time'
import type { FeedCommentDto } from '@/modules/feed/types/feed.types'
import { cn } from '@/shared/lib/cn'

const PREVIEW_COMMENT_LIMIT = 2
const PREVIEW_REPLY_LIMIT = 1

interface CommentNode {
  comment: FeedCommentDto
  replies: CommentNode[]
}

function buildCommentThread(comments: FeedCommentDto[]): CommentNode[] {
  const byId = new Map(comments.map((c) => [c.id, { comment: c, replies: [] as CommentNode[] }]))
  const roots: CommentNode[] = []

  for (const comment of comments) {
    const node = byId.get(comment.id)!
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

interface FeedCommentsSectionProps {
  feedItemId: string
  expanded?: boolean
  onExpand?: () => void
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  showComposer?: boolean
  variant?: 'inline' | 'modal'
  onReply?: (comment: FeedCommentDto) => void
}

export function FeedCommentsSection({
  feedItemId,
  expanded = false,
  onExpand,
  inputRef,
  showComposer = true,
  variant = 'inline',
  onReply,
}: FeedCommentsSectionProps) {
  const userId = useAuthStore((s) => s.userId)
  const { data: commentsData, isLoading } = useFeedComments(feedItemId, true)
  const comments = Array.isArray(commentsData) ? commentsData : []
  const deleteComment = useDeleteFeedComment()
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})

  const thread = useMemo(() => buildCommentThread(comments), [comments])
  const hiddenCount = Math.max(0, thread.length - PREVIEW_COMMENT_LIMIT)
  const visibleRoots = expanded ? thread : thread.slice(0, PREVIEW_COMMENT_LIMIT)
  const isModal = variant === 'modal'

  const handleReply = (comment: FeedCommentDto) => {
    if (onReply) {
      onReply(comment)
      return
    }
    onExpand?.()
    window.setTimeout(() => inputRef?.current?.focus(), 0)
  }

  if (isLoading) {
    return (
      <div className={cn(isModal && 'feed-comments--modal')}>
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      </div>
    )
  }

  return (
    <div className={cn(isModal && 'feed-comments--modal')}>
      {!expanded && hiddenCount > 0 ? (
        <button
          type="button"
          className="mb-2 text-sm font-semibold text-muted-foreground hover:underline"
          onClick={onExpand}
        >
          View more comments
        </button>
      ) : null}

      {thread.length > 0 ? (
        <ul className="space-y-3 pb-2">
          {visibleRoots.map((node) => (
            <CommentItem
              key={node.comment.id}
              node={node}
              depth={0}
              feedItemId={feedItemId}
              userId={userId}
              expanded={expanded}
              expandedReplies={expandedReplies}
              variant={variant}
              onToggleReplies={(commentId) =>
                setExpandedReplies((current) => ({ ...current, [commentId]: !current[commentId] }))
              }
              onReply={handleReply}
              onDelete={(comment) => deleteComment.mutate({ feedItemId, commentId: comment.id })}
            />
          ))}
        </ul>
      ) : isModal ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No comments yet. Be the first.</p>
      ) : null}

      {showComposer && variant === 'inline' ? (
        <FeedCommentComposer feedItemId={feedItemId} inputRef={inputRef} variant="inline" />
      ) : null}
    </div>
  )
}

function CommentItem({
  node,
  depth,
  feedItemId,
  userId,
  expanded,
  expandedReplies,
  variant,
  onToggleReplies,
  onReply,
  onDelete,
}: {
  node: CommentNode
  depth: number
  feedItemId: string
  userId: string | null
  expanded: boolean
  expandedReplies: Record<string, boolean>
  variant: 'inline' | 'modal'
  onToggleReplies: (commentId: string) => void
  onReply: (comment: FeedCommentDto) => void
  onDelete: (comment: FeedCommentDto) => void
}) {
  const { comment, replies } = node
  const isOwner = userId === comment.author.id
  const repliesExpanded = expanded || expandedReplies[comment.id]
  const hiddenReplies = Math.max(0, replies.length - PREVIEW_REPLY_LIMIT)
  const visibleReplies = repliesExpanded ? replies : replies.slice(0, PREVIEW_REPLY_LIMIT)
  const isModal = variant === 'modal'

  return (
    <li>
      <div className={cn('flex gap-2', depth > 0 && 'relative ml-9')}>
        {depth > 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -left-5 top-0 h-4 w-5 rounded-bl-lg border-b-2 border-l-2 border-muted-foreground/25"
          />
        ) : null}
        <FeedAuthorProfileLink author={comment.author} variant="avatar" className="shrink-0">
          <FeedUserAvatar
            name={comment.author.name}
            avatarUrl={comment.author.avatarUrl}
            className={cn(depth > 0 ? 'h-7 w-7' : 'h-8 w-8')}
          />
        </FeedAuthorProfileLink>
        <div className="min-w-0 flex-1">
          <div className={cn('inline-block max-w-full rounded-2xl px-3 py-2 feed-comment-bubble', isModal ? 'bg-muted/50' : 'bg-muted/70')}>
            <FeedAuthorProfileLink author={comment.author} variant="name" className="inline-block max-w-full">
              <p className="text-[13px] font-semibold leading-tight">{comment.author.name}</p>
            </FeedAuthorProfileLink>
            {comment.body ? (
              <p className="whitespace-pre-wrap text-[15px] leading-snug">{comment.body}</p>
            ) : null}
            {comment.imageUrl ? (
              <img
                src={comment.imageUrl}
                alt={comment.body || 'Photo'}
                loading="lazy"
                decoding="async"
                className={cn(
                  'max-w-full rounded-lg object-cover',
                  comment.body ? 'mt-2' : 'mt-1',
                )}
                style={{ maxHeight: 240 }}
              />
            ) : null}
            {comment.gifUrl ? (
              <img
                src={comment.gifUrl}
                alt={comment.body || 'GIF'}
                loading="lazy"
                decoding="async"
                className={cn(
                  'max-w-full rounded-lg',
                  comment.body || comment.imageUrl ? 'mt-2' : 'mt-1',
                )}
                style={{ maxHeight: 240 }}
              />
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-xs font-semibold text-muted-foreground">
            <span>{formatCommentTimestamp(comment.createdAt)}</span>
            {userId ? <FeedCommentLikeAction feedItemId={feedItemId} comment={comment} /> : null}
            {userId ? (
              <button type="button" className="hover:underline" onClick={() => onReply(comment)}>
                Reply
              </button>
            ) : null}
            {isOwner ? (
              <button type="button" className="hover:text-destructive" onClick={() => onDelete(comment)}>
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {replies.length > 0 ? (
        <div className="mt-2 space-y-2">
          {!repliesExpanded && hiddenReplies > 0 ? (
            <button
              type="button"
              className="ml-11 text-xs font-semibold text-muted-foreground hover:underline"
              onClick={() => onToggleReplies(comment.id)}
            >
              View all {replies.length} replies
            </button>
          ) : null}
          <ul className="space-y-2">
            {visibleReplies.map((child) => (
              <CommentItem
                key={child.comment.id}
                node={child}
                depth={depth + 1}
                feedItemId={feedItemId}
                userId={userId}
                expanded={expanded}
                expandedReplies={expandedReplies}
                variant={variant}
                onToggleReplies={onToggleReplies}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}
