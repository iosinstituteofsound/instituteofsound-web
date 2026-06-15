import { useMemo, useState, type RefObject } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  useAddFeedComment,
  useDeleteFeedComment,
  useFeedComments,
} from '@/modules/feed/hooks/use-feed-engagement'
import { formatCommentTimestamp } from '@/modules/feed/lib/feed-time'
import type { FeedCommentDto } from '@/modules/feed/types/feed.types'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
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
  inputRef?: RefObject<HTMLTextAreaElement | null>
}

export function FeedCommentsSection({
  feedItemId,
  expanded = false,
  onExpand,
  inputRef,
}: FeedCommentsSectionProps) {
  const userId = useAuthStore((s) => s.userId)
  const { data: me } = useMe(Boolean(userId))
  const { data: commentsData, isLoading } = useFeedComments(feedItemId, true)
  const comments = Array.isArray(commentsData) ? commentsData : []
  const addComment = useAddFeedComment()
  const deleteComment = useDeleteFeedComment()
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<FeedCommentDto | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})

  const thread = useMemo(() => buildCommentThread(comments), [comments])
  const hiddenCount = Math.max(0, thread.length - PREVIEW_COMMENT_LIMIT)
  const visibleRoots = expanded ? thread : thread.slice(0, PREVIEW_COMMENT_LIMIT)

  const submit = async () => {
    const body = draft.trim()
    if (!body || !userId || addComment.isPending) return

    await addComment.mutateAsync({
      feedItemId,
      body,
      parentId: replyTo?.id,
    })
    setDraft('')
    setReplyTo(null)
    onExpand?.()
  }

  if (isLoading) {
    return (
      <div className="border-t px-3 py-2 sm:px-4">
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      </div>
    )
  }

  return (
    <div className="border-t px-3 py-2 sm:px-4">
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
              userId={userId}
              expanded={expanded}
              expandedReplies={expandedReplies}
              onToggleReplies={(commentId) =>
                setExpandedReplies((current) => ({ ...current, [commentId]: !current[commentId] }))
              }
              onReply={(comment) => {
                setReplyTo(comment)
                onExpand?.()
                window.setTimeout(() => inputRef?.current?.focus(), 0)
              }}
              onDelete={(comment) => deleteComment.mutate({ feedItemId, commentId: comment.id })}
            />
          ))}
        </ul>
      ) : null}

      {userId ? (
        <div className="flex gap-2 border-t border-border/50 pt-3">
          <FeedUserAvatar
            name={me?.user.name ?? 'You'}
            avatarUrl={me?.user.avatarUrl}
            className="h-8 w-8 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-2">
            {replyTo ? (
              <p className="text-xs text-muted-foreground">
                Replying to <span className="font-medium text-foreground">{replyTo.author.name}</span>
                <button
                  type="button"
                  className="ml-2 font-semibold text-primary hover:underline"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
              </p>
            ) : null}
            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Comment as ${me?.user.name?.split(' ')[0] ?? 'you'}`}
              rows={1}
              className="min-h-9 resize-none rounded-full border-muted-foreground/20 bg-muted/40 px-4 py-2 text-sm"
              onFocus={onExpand}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void submit()
                }
              }}
            />
            {draft.trim() ? (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="rounded-lg"
                  disabled={addComment.isPending}
                  onClick={() => void submit()}
                >
                  {addComment.isPending ? 'Posting…' : 'Post'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CommentItem({
  node,
  depth,
  userId,
  expanded,
  expandedReplies,
  onToggleReplies,
  onReply,
  onDelete,
}: {
  node: CommentNode
  depth: number
  userId: string | null
  expanded: boolean
  expandedReplies: Record<string, boolean>
  onToggleReplies: (commentId: string) => void
  onReply: (comment: FeedCommentDto) => void
  onDelete: (comment: FeedCommentDto) => void
}) {
  const { comment, replies } = node
  const isOwner = userId === comment.author.id
  const repliesExpanded = expanded || expandedReplies[comment.id]
  const hiddenReplies = Math.max(0, replies.length - PREVIEW_REPLY_LIMIT)
  const visibleReplies = repliesExpanded ? replies : replies.slice(0, PREVIEW_REPLY_LIMIT)

  return (
    <li>
      <div className={cn('flex gap-2', depth > 0 && 'relative ml-9')}>
        {depth > 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -left-5 top-0 h-4 w-5 rounded-bl-lg border-b-2 border-l-2 border-muted-foreground/25"
          />
        ) : null}
        <FeedUserAvatar
          name={comment.author.name}
          avatarUrl={comment.author.avatarUrl}
          className={cn('shrink-0', depth > 0 ? 'h-7 w-7' : 'h-8 w-8')}
        />
        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-muted/70 px-3 py-2">
            <p className="text-[13px] font-semibold leading-tight">{comment.author.name}</p>
            <p className="whitespace-pre-wrap text-[15px] leading-snug">{comment.body}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-xs font-semibold text-muted-foreground">
            <span>{formatCommentTimestamp(comment.createdAt)}</span>
            {userId ? (
              <button type="button" className="hover:underline">
                Like
              </button>
            ) : null}
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
              View {hiddenReplies} more {hiddenReplies === 1 ? 'reply' : 'replies'}
            </button>
          ) : null}
          <ul className="space-y-2">
            {visibleReplies.map((child) => (
              <CommentItem
                key={child.comment.id}
                node={child}
                depth={depth + 1}
                userId={userId}
                expanded={expanded}
                expandedReplies={expandedReplies}
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
