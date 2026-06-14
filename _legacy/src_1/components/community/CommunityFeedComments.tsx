import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import {
  addPostComment,
  COMMENT_EVENT,
  deletePostComment,
  listPostComments,
} from '@/lib/community/commentService'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import {
  buildCommentThread,
  type CommentThreadNode,
  type PostComment,
} from '@/lib/community/commentTypes'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'

interface CommunityFeedCommentsProps {
  postId: string
  postOwnerUserId: string
  onChanged?: () => void
}

type ReplyTarget = {
  parentId: string
  parentAuthorUserId: string
  parentDisplayName: string
  parentHandle: string
}

interface CommentItemProps {
  node: CommentThreadNode
  depth: number
  userId?: string
  onReply: (target: ReplyTarget) => void
  onDelete: (comment: PostComment) => void
}

function CommentItem({ node, depth, userId, onReply, onDelete }: CommentItemProps) {
  const c = node.comment
  const profilePath = networkProfilePath(c.handle)
  const isOwner = userId === c.userId

  return (
    <li
      className={clsx(
        'community-feed-comment',
        depth > 0 && 'community-feed-comment-reply',
        depth > 0 && `community-feed-comment-depth-${Math.min(depth, 3)}`
      )}
    >
      <div className="community-feed-comment-row">
        <Link to={profilePath} className="community-feed-comment-avatar" aria-hidden tabIndex={-1}>
          {c.avatarUrl ? (
            <IOSImage src={c.avatarUrl} alt="" width={36} className="w-full h-full object-cover" />
          ) : (
            <span>{c.displayName.charAt(0).toUpperCase()}</span>
          )}
        </Link>
        <div className="community-feed-comment-body">
          <p className="community-feed-comment-meta">
            <Link to={profilePath} className="community-feed-comment-name">
              {c.displayName}
            </Link>
            <span className="community-feed-comment-handle">{c.handle}</span>
            <time dateTime={c.createdAt}>{formatRelativeTime(c.createdAt)}</time>
          </p>
          <p className="community-feed-comment-text">{c.body}</p>
          <div className="community-feed-comment-actions">
            {userId && (
              <button
                type="button"
                className="community-feed-comment-reply-btn"
                onClick={() =>
                  onReply({
                    parentId: c.id,
                    parentAuthorUserId: c.userId,
                    parentDisplayName: c.displayName,
                    parentHandle: c.handle,
                  })
                }
              >
                Reply
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                className="community-feed-comment-delete"
                onClick={() => void onDelete(c)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {node.replies.length > 0 && (
        <ul className="community-feed-comments-replies">
          {node.replies.map((child) => (
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
      )}
    </li>
  )
}

export function CommunityFeedComments({
  postId,
  postOwnerUserId,
  onChanged,
}: CommunityFeedCommentsProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setComments(await listPostComments(postId))
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onChange = () => void load()
    window.addEventListener(COMMENT_EVENT, onChange)
    return () => window.removeEventListener(COMMENT_EVENT, onChange)
  }, [load])

  const thread = buildCommentThread(comments)

  const submit = async () => {
    if (!user || !stats) return
    setSaving(true)
    setError(null)
    try {
      await addPostComment({
        postId,
        body: draft,
        parentId: replyTo?.parentId,
        parentAuthorUserId: replyTo?.parentAuthorUserId,
        authorUserId: user.id,
        authorDisplayName: stats.name,
        authorHandle: stats.handle,
        authorAvatarUrl: stats.avatarUrl,
        postOwnerUserId,
      })
      setDraft('')
      setReplyTo(null)
      await load()
      onChanged?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post comment.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (comment: PostComment) => {
    if (!user || user.id !== comment.userId) return
    if (!confirm('Delete this comment? Replies will be removed too.')) return
    try {
      await deletePostComment(postId, comment.id, user.id)
      if (replyTo?.parentId === comment.id) setReplyTo(null)
      await load()
      onChanged?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete comment.')
    }
  }

  return (
    <div className="community-feed-comments">
      {loading && comments.length === 0 && (
        <p className="community-feed-comments-empty text-sm text-muted">Loading comments…</p>
      )}

      {!loading && comments.length === 0 && (
        <p className="community-feed-comments-empty text-sm text-muted">
          No comments yet. Start the conversation.
        </p>
      )}

      <ul className="community-feed-comments-list">
        {thread.map((node) => (
          <CommentItem
            key={node.comment.id}
            node={node}
            depth={0}
            userId={user?.id}
            onReply={setReplyTo}
            onDelete={(c) => void remove(c)}
          />
        ))}
      </ul>

      {user && stats ? (
        <div className="community-feed-comment-compose">
          {replyTo && (
            <div className="community-feed-comment-replying">
              <span className="text-sm text-muted">
                Replying to <strong className="text-foreground">{replyTo.parentDisplayName}</strong>
              </span>
              <button
                type="button"
                className="community-feed-comment-reply-cancel"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            className="community-feed-textarea"
            rows={2}
            placeholder={
              replyTo ? `Reply to ${replyTo.parentDisplayName}…` : 'Write a comment…'
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={saving}
            maxLength={500}
          />
          {error && <p className="text-sm text-mh-red mt-2">{error}</p>}
          <Button
            type="button"
            variant="primary"
            className="mt-2 !py-2 !text-xs"
            disabled={saving || !draft.trim()}
            onClick={() => void submit()}
          >
            {saving ? 'Posting…' : replyTo ? 'Reply' : 'Comment'}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted mt-3">
          <Link to="/login" className="text-mh-red hover:underline">
            Sign in
          </Link>{' '}
          to comment.
        </p>
      )}
    </div>
  )
}
