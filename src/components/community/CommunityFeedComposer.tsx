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

type PostMode = 'drop' | 'spin'

interface CommunityFeedComposerProps {
  onPosted: () => void
}

export function CommunityFeedComposer({ onPosted }: CommunityFeedComposerProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const { genres } = useCommunityGenres()
  const fileRef = useRef<HTMLInputElement>(null)

  const [postMode, setPostMode] = useState<PostMode>('drop')
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
    if (pending) {
      setPostMode('drop')
      setText(pending.body)
    }
  }, [])

  if (!user || !stats) {
    return (
      <div className="community-feed-composer community-feed-composer-guest ios-card">
        <p className="font-display font-bold">Transmit on the network</p>
        <p className="text-sm text-muted mt-2">
          Sign in to post Spins, Drops, photos, or music links.
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

  const firstName = stats.name.split(' ')[0]
  const hasMusic = spotify.trim().length > 0 || youtube.trim().length > 0
  const isSpin = postMode === 'spin'

  const canPost =
    !saving &&
    !uploading &&
    (isSpin ? hasMusic : text.trim().length > 0 || Boolean(imageUrl))

  const selectDrop = () => {
    setPostMode('drop')
    setShowMusic(false)
    setSpotify('')
    setYoutube('')
    setTrackTitle('')
    setError(null)
  }

  const selectSpin = () => {
    setPostMode('spin')
    setShowMusic(true)
    setError(null)
  }

  const toggleMusic = () => {
    if (isSpin && showMusic) {
      setShowMusic(false)
      return
    }
    selectSpin()
  }

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
    setPostMode('drop')
  }

  const submit = async () => {
    if (!canPost) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (isSpin) {
        await createSpinPost({
          ...author,
          spotifyRaw: spotify,
          youtubeRaw: youtube,
          caption: text,
          trackTitle,
          imageUrl: imageUrl || undefined,
        })
        setSuccess(`Spin live · +${DB_REWARDS.spin_post} dB`)
      } else {
        await createDropPost({ ...author, text, imageUrl: imageUrl || undefined })
        setSuccess(`Drop live · +${DB_REWARDS.drop_post} dB`)
      }
      reset()
      onPosted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.')
    } finally {
      setSaving(false)
    }
  }

  const textareaPlaceholder = isSpin
    ? showMusic
      ? 'Caption for your spin (optional)…'
      : `Share a track, ${firstName}…`
    : `What's on your mind, ${firstName}?`

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
          placeholder={textareaPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={saving}
          maxLength={280}
        />
      </div>

      <p className="community-composer-mode-hint">
        {isSpin ? (
          <>
            <span className="community-composer-mode-label community-composer-mode-spin">Spin</span>
            <span className="text-muted"> — share a track link · +{DB_REWARDS.spin_post} dB</span>
          </>
        ) : (
          <>
            <span className="community-composer-mode-label community-composer-mode-drop">Drop</span>
            <span className="text-muted"> — short transmission · +{DB_REWARDS.drop_post} dB</span>
          </>
        )}
      </p>

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

      {isSpin && showMusic && (
        <div className="community-composer-music">
          <p className="community-composer-music-label">Track links</p>
          <input
            type="url"
            className="community-feed-input"
            placeholder="Spotify link"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            disabled={saving}
          />
          <input
            type="url"
            className="community-feed-input"
            placeholder="YouTube link"
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
          {!hasMusic && (
            <p className="community-composer-music-hint">Add Spotify or YouTube to post a Spin.</p>
          )}
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
            <span>{uploading ? '…' : 'Photo'}</span>
          </button>
          <button
            type="button"
            className={clsx(
              'community-composer-action',
              isSpin && showMusic && 'community-composer-action-music-active'
            )}
            onClick={toggleMusic}
            disabled={saving}
          >
            <MusicIcon />
            <span>Music</span>
          </button>
          <button
            type="button"
            className={clsx(
              'community-composer-action community-composer-action-spin',
              isSpin && 'community-composer-action-spin-active'
            )}
            onClick={selectSpin}
            disabled={saving}
          >
            <SpinIcon />
            <span>Spin</span>
          </button>
          <button
            type="button"
            className={clsx(
              'community-composer-action community-composer-action-drop',
              !isSpin && 'community-composer-action-drop-active'
            )}
            onClick={selectDrop}
            disabled={saving}
          >
            <DropIcon />
            <span>Drop</span>
          </button>
        </div>
        <Button
          type="button"
          variant="primary"
          className="community-composer-submit shrink-0"
          disabled={!canPost}
          onClick={() => void submit()}
        >
          {saving ? '…' : isSpin ? 'Post Spin' : 'Post Drop'}
        </Button>
      </div>
    </div>
  )
}

function PhotoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M9 19V6l12-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

function SpinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="2.5" strokeWidth={1.6} />
      <path strokeLinecap="round" strokeWidth={1.6} d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  )
}

function DropIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"
      />
    </svg>
  )
}
