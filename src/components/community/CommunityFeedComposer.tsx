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

/** One option at a time — switching clears the previous mode's fields. */
type ComposerOption = 'photo' | 'music' | 'spin' | 'drop'

interface CommunityFeedComposerProps {
  onPosted: () => void
}

export function CommunityFeedComposer({ onPosted }: CommunityFeedComposerProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const { genres } = useCommunityGenres()
  const fileRef = useRef<HTMLInputElement>(null)

  const [selected, setSelected] = useState<ComposerOption | null>(null)
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const pending = consumePendingToolDrop()
    if (pending) {
      setSelected('drop')
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
  const isTrackPost = selected === 'music' || selected === 'spin'

  const clearFields = () => {
    setImageUrl('')
    setSpotify('')
    setYoutube('')
    setTrackTitle('')
  }

  const pickOption = (option: ComposerOption) => {
    if (selected !== option) {
      clearFields()
      setSelected(option)
      setError(null)
    }
  }

  const canPost = (() => {
    if (!selected || saving || uploading) return false
    switch (selected) {
      case 'drop':
        return text.trim().length > 0
      case 'photo':
        return Boolean(imageUrl)
      case 'music':
      case 'spin':
        return hasMusic
      default:
        return false
    }
  })()

  const selectPhoto = () => {
    pickOption('photo')
    window.setTimeout(() => fileRef.current?.click(), 0)
  }

  const selectMusic = () => pickOption('music')
  const selectSpin = () => pickOption('spin')
  const selectDrop = () => pickOption('drop')

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
      setSelected('photo')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setText('')
    clearFields()
    setSelected(null)
    setError(null)
  }

  const submit = async () => {
    if (!canPost || !selected) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (isTrackPost) {
        await createSpinPost({
          ...author,
          spotifyRaw: spotify,
          youtubeRaw: youtube,
          caption: text,
          trackTitle,
        })
        setSuccess(`Spin live · +${DB_REWARDS.spin_post} dB`)
      } else {
        await createDropPost({
          ...author,
          text,
          imageUrl: imageUrl || undefined,
        })
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

  const textareaPlaceholder = (() => {
    if (!selected) return `Pick Photo, Music, Spin, or Drop — then post, ${firstName}.`
    switch (selected) {
      case 'photo':
        return 'Caption for your photo (optional)…'
      case 'music':
      case 'spin':
        return 'Caption for your spin (optional)…'
      default:
        return `What's on your mind, ${firstName}?`
    }
  })()

  const submitLabel = (() => {
    if (saving) return '…'
    if (!selected) return 'Post'
    if (isTrackPost) return 'Post Spin'
    if (selected === 'photo') return 'Post Photo'
    return 'Post Drop'
  })()

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
          disabled={saving || !selected}
          maxLength={280}
        />
      </div>

      {selected && (
        <p className="community-composer-mode-hint">
          {selected === 'drop' && (
            <>
              <span className="community-composer-mode-label community-composer-mode-drop">Drop</span>
              <span className="text-muted"> — write a transmission · +{DB_REWARDS.drop_post} dB</span>
            </>
          )}
          {selected === 'photo' && (
            <>
              <span className="community-composer-mode-label community-composer-mode-photo">Photo</span>
              <span className="text-muted"> — image post · +{DB_REWARDS.drop_post} dB</span>
            </>
          )}
          {(selected === 'music' || selected === 'spin') && (
            <>
              <span className="community-composer-mode-label community-composer-mode-spin">Spin</span>
              <span className="text-muted"> — share a track link · +{DB_REWARDS.spin_post} dB</span>
            </>
          )}
        </p>
      )}

      {selected === 'photo' && imageUrl && (
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

      {isTrackPost && (
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
            <p className="community-composer-music-hint">Add Spotify or YouTube to post.</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
      {success && <p className="text-sm text-muted mt-3">{success}</p>}

      <div className="community-composer-bar">
        <div className="community-composer-actions" role="radiogroup" aria-label="Post type">
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
            role="radio"
            aria-checked={selected === 'photo'}
            className={clsx(
              'community-composer-action community-composer-action-photo',
              selected === 'photo' && 'community-composer-action-photo-active'
            )}
            onClick={selectPhoto}
            disabled={uploading || saving}
          >
            <PhotoIcon />
            <span>{uploading ? '…' : 'Photo'}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selected === 'music'}
            className={clsx(
              'community-composer-action community-composer-action-music',
              selected === 'music' && 'community-composer-action-music-active'
            )}
            onClick={selectMusic}
            disabled={saving}
          >
            <MusicIcon />
            <span>Music</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selected === 'spin'}
            className={clsx(
              'community-composer-action community-composer-action-spin',
              selected === 'spin' && 'community-composer-action-spin-active'
            )}
            onClick={selectSpin}
            disabled={saving}
          >
            <SpinIcon />
            <span>Spin</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selected === 'drop'}
            className={clsx(
              'community-composer-action community-composer-action-drop',
              selected === 'drop' && 'community-composer-action-drop-active'
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
          {submitLabel}
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
