import { useMemo, useState } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  useAddFeedComment,
  useDeleteFeedComment,
  useFeedComments,
} from '@/modules/feed/hooks/use-feed-engagement'
import type { FeedCommentDto } from '@/modules/feed/types/feed.types'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/cn'

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

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
}

export function FeedCommentsSection({ feedItemId }: FeedCommentsSectionProps) {
  const userId = useAuthStore((s) => s.userId)
  const { data: me } = useMe(Boolean(userId))
  const { data: comments = [], isLoading } = useFeedComments(feedItemId, true)
  const addComment = useAddFeedComment()
  const deleteComment = useDeleteFeedComment()
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<FeedCommentDto | null>(null)

  const thread = useMemo(() => buildCommentThread(comments), [comments])

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
  }

  return (
    <div className="space-y-3 border-t bg-muted/20 px-4 py-3">
      {userId ? (
        <div className="flex gap-2">
          <FeedUserAvatar
            name={me?.user.name ?? 'You'}
            avatarUrl={me?.user.avatarUrl}
            className="mt-1 h-8 w-8 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-2">
            {replyTo ? (
              <p className="text-xs text-muted-foreground">
                Replying to <span className="font-medium text-foreground">{replyTo.author.name}</span>
                <button
                  type="button"
                  className="ml-2 text-primary hover:underline"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
              </p>
            ) : null}
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="min-h-[44px] resize-none rounded-xl bg-background text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void submit()
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                className="rounded-lg"
                disabled={!draft.trim() || addComment.isPending}
                onClick={() => void submit()}
              >
                {addComment.isPending ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : thread.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="space-y-3">
          {thread.map((node) => (
            <CommentItem
              key={node.comment.id}
              node={node}
              depth={0}
              userId={userId}
              onReply={setReplyTo}
              onDelete={(comment) =>
                deleteComment.mutate({ feedItemId, commentId: comment.id })
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CommentItem({
  node,
  depth,
  userId,
  onReply,
  onDelete,
}: {
  node: CommentNode
  depth: number
  userId: string | null
  onReply: (comment: FeedCommentDto) => void
  onDelete: (comment: FeedCommentDto) => void
}) {
  const { comment, replies } = node
  const isOwner = userId === comment.author.id

  return (
    <li className={cn(depth > 0 && 'ml-8 border-l border-border pl-3')}>
      <div className="flex gap-2">
        <FeedUserAvatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-muted px-3 py-2">
            <p className="text-sm font-semibold leading-tight">{comment.author.name}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 px-1 text-xs font-semibold text-muted-foreground">
            <span>{formatRelativeTime(comment.createdAt)}</span>
            {userId ? (
              <button type="button" className="hover:text-foreground" onClick={() => onReply(comment)}>
                Reply
              </button>
            ) : null}
            {isOwner ? (
              <button
                type="button"
                className="hover:text-destructive"
                onClick={() => onDelete(comment)}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {replies.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {replies.map((child) => (
            <CommentItem
              key={child.comment.id}
              node={child}
              depth={depth + 1}
              userId={userId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
