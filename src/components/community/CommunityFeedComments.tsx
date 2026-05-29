import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import type { PostComment } from '@/lib/community/commentTypes'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'

interface CommunityFeedCommentsProps {
  postId: string
  postOwnerUserId: string
  onChanged?: () => void
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

  const submit = async () => {
    if (!user || !stats) return
    setSaving(true)
    setError(null)
    try {
      await addPostComment({
        postId,
        body: draft,
        authorUserId: user.id,
        authorDisplayName: stats.name,
        authorHandle: stats.handle,
        authorAvatarUrl: stats.avatarUrl,
        postOwnerUserId,
      })
      setDraft('')
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
    if (!confirm('Delete this comment?')) return
    try {
      await deletePostComment(postId, comment.id, user.id)
      await load()
      onChanged?.()
    } catch {
      /* ignore */
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
        {comments.map((c) => {
          const profilePath = networkProfilePath(c.handle)
          return (
            <li key={c.id} className="community-feed-comment">
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
                {user?.id === c.userId && (
                  <button
                    type="button"
                    className="community-feed-comment-delete"
                    onClick={() => void remove(c)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {user && stats ? (
        <div className="community-feed-comment-compose">
          <textarea
            className="community-feed-textarea"
            rows={2}
            placeholder="Write a comment…"
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
            {saving ? 'Posting…' : 'Comment'}
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
