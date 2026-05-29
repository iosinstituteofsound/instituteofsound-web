import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { updateDropPost, updateSpinPost } from '@/lib/community/feedService'
import { Button } from '@/components/ui/Button'

interface CommunityFeedEditPostModalProps {
  post: CommunityFeedPost
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function CommunityFeedEditPostModal({
  post,
  open,
  onClose,
  onSaved,
}: CommunityFeedEditPostModalProps) {
  const [body, setBody] = useState(post.body ?? '')
  const [trackTitle, setTrackTitle] = useState(post.trackTitle ?? '')
  const [spotify, setSpotify] = useState(post.spotifyUrl ?? '')
  const [youtube, setYoutube] = useState(post.youtubeUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setBody(post.body ?? '')
    setTrackTitle(post.trackTitle ?? '')
    setSpotify(post.spotifyUrl ?? '')
    setYoutube(post.youtubeUrl ?? '')
    setError(null)
  }, [open, post])

  if (!open) return null

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (post.kind === 'spin') {
        await updateSpinPost({
          postId: post.id,
          userId: post.userId,
          caption: body,
          trackTitle,
          spotifyRaw: spotify,
          youtubeRaw: youtube,
        })
      } else {
        await updateDropPost({
          postId: post.id,
          userId: post.userId,
          text: body,
        })
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="community-feed-edit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-title"
      onClick={onClose}
    >
      <div
        className="community-feed-edit-panel ios-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="community-feed-edit-header">
          <h2 id="edit-post-title" className="font-display text-lg font-bold">
            Edit {post.kind === 'spin' ? 'spin' : 'post'}
          </h2>
          <button type="button" className="community-feed-edit-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {post.kind === 'spin' ? (
          <div className="community-feed-edit-fields">
            <label className="community-feed-edit-label">
              Spotify link
              <input
                type="url"
                className="community-feed-input"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                disabled={saving}
                placeholder="https://open.spotify.com/…"
              />
            </label>
            <label className="community-feed-edit-label">
              YouTube link
              <input
                type="url"
                className="community-feed-input"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                disabled={saving}
                placeholder="https://youtube.com/…"
              />
            </label>
            <label className="community-feed-edit-label">
              Track title
              <input
                type="text"
                className="community-feed-input"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                disabled={saving}
                maxLength={120}
              />
            </label>
            <label className="community-feed-edit-label">
              Caption
              <textarea
                className="community-feed-textarea"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={saving}
                maxLength={280}
              />
            </label>
          </div>
        ) : (
          <div className="community-feed-edit-fields">
            {(post.imageUrl || post.linkUrl) && (
              <p className="text-sm text-muted">
                {post.imageUrl && post.linkUrl
                  ? 'Photo and link preview stay as posted — edit the caption below.'
                  : post.imageUrl
                    ? 'Photo stays as posted — edit the caption below.'
                    : 'Link preview stays as posted — edit the caption below.'}
              </p>
            )}
            <label className="community-feed-edit-label">
              {post.linkUrl ? 'Caption' : post.imageUrl ? 'Caption' : 'Text'}
              <textarea
                className="community-feed-textarea"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={saving}
                maxLength={280}
                placeholder="What's on your mind?"
              />
            </label>
            <p className={clsx('text-xs text-muted text-right', body.length > 200 && 'text-mh-red')}>
              {body.length}/280
            </p>
          </div>
        )}

        {error && <p className="text-sm text-mh-red mt-3">{error}</p>}

        <div className="community-feed-edit-actions">
          <button type="button" className="ios-btn ios-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
