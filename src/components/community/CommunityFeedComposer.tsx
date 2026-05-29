import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import { createDropPost, createSpinPost } from '@/lib/community/feedService'
import { DB_REWARDS } from '@/lib/community/dbRewards'
import { consumePendingToolDrop } from '@/lib/academy/academyLoop'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary/upload'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'

interface CommunityFeedComposerProps {
  onPosted: () => void
}

export function CommunityFeedComposer({ onPosted }: CommunityFeedComposerProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const { genres } = useCommunityGenres()
  const fileRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showMusic, setShowMusic] = useState(false)
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const pending = consumePendingToolDrop()
    if (pending) setText(pending.body)
  }, [])

  if (!user || !stats) {
    return (
      <div className="community-feed-composer community-feed-composer-guest ios-card">
        <p className="font-display font-bold">Transmit on the network</p>
        <p className="text-sm text-muted mt-2">
          Sign in to post — share a photo, a thought, or a track.
        </p>
        <Link to="/login" className="ios-btn ios-btn-metal inline-block mt-4">
          Sign in →
        </Link>
      </div>
    )
  }

  const primaryGenreId = genres.find((g) => g.slug === stats.primaryGenreSlug)?.id
  const author = {
    userId: user.id,
    displayName: stats.name,
    handle: stats.handle,
    avatarUrl: stats.avatarUrl,
    rank: stats.rank,
    primaryGenreSlug: stats.primaryGenreSlug,
    primaryGenreId,
  }

  const hasMusic = spotify.trim().length > 0 || youtube.trim().length > 0
  const canPost = !saving && !uploading && (text.trim().length > 0 || imageUrl || hasMusic)

  const pickPhoto = () => fileRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'ios/community')
      setImageUrl(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setText('')
    setImageUrl('')
    setSpotify('')
    setYoutube('')
    setTrackTitle('')
    setShowMusic(false)
  }

  const submit = async () => {
    if (!canPost) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (hasMusic) {
        await createSpinPost({
          ...author,
          spotifyRaw: spotify,
          youtubeRaw: youtube,
          caption: text,
          trackTitle,
          imageUrl: imageUrl || undefined,
        })
        setSuccess(`Posted · +${DB_REWARDS.spin_post} dB`)
      } else {
        await createDropPost({ ...author, text, imageUrl: imageUrl || undefined })
        setSuccess(`Posted · +${DB_REWARDS.drop_post} dB`)
      }
      reset()
      onPosted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="community-feed-composer community-feed-composer-fb ios-card">
      <div className="community-composer-top">
        <div className="community-feed-card-avatar community-composer-avatar">
          {stats.avatarUrl ? (
            <IOSImage src={stats.avatarUrl} alt="" width={44} className="w-full h-full object-cover" />
          ) : (
            <span aria-hidden>{stats.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <textarea
          className="community-composer-textarea"
          rows={2}
          placeholder={`What's on your mind, ${stats.name.split(' ')[0]}?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={saving}
          maxLength={280}
        />
      </div>

      {imageUrl && (
        <div className="community-composer-photo">
          <IOSImage src={imageUrl} alt="Attached" width={640} className="community-composer-photo-img" />
          <button
            type="button"
            className="community-composer-photo-remove"
            onClick={() => setImageUrl('')}
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}

      {showMusic && (
        <div className="community-composer-music">
          <input
            type="url"
            className="community-feed-input"
            placeholder="Spotify link (optional)"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            disabled={saving}
          />
          <input
            type="url"
            className="community-feed-input"
            placeholder="YouTube link (optional)"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            disabled={saving}
          />
          <input
            type="text"
            className="community-feed-input"
            placeholder="Track title (optional)"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            disabled={saving}
            maxLength={120}
          />
        </div>
      )}

      {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
      {success && <p className="text-sm text-muted mt-3">{success}</p>}

      <div className="community-composer-bar">
        <div className="community-composer-actions">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Upload photo"
            onChange={(e) => void onFile(e)}
          />
          <button
            type="button"
            className="community-composer-action"
            onClick={pickPhoto}
            disabled={uploading || saving}
          >
            <PhotoIcon />
            <span>{uploading ? 'Uploading…' : 'Photo'}</span>
          </button>
          <button
            type="button"
            className={clsx('community-composer-action', showMusic && 'community-composer-action-active')}
            onClick={() => setShowMusic((v) => !v)}
            disabled={saving}
          >
            <MusicIcon />
            <span>Music</span>
          </button>
        </div>
        <Button type="button" variant="primary" disabled={!canPost} onClick={() => void submit()}>
          {saving ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </div>
  )
}

function PhotoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 19V6l12-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
