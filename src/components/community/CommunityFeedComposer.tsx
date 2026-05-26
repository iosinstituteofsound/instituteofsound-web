import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import { createDropPost, createSpinPost } from '@/lib/community/feedService'
import { DB_REWARDS } from '@/lib/community/dbRewards'
import { Button } from '@/components/ui/Button'

type ComposeTab = 'spin' | 'drop'

interface CommunityFeedComposerProps {
  onPosted: () => void
}

export function CommunityFeedComposer({ onPosted }: CommunityFeedComposerProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const { genres } = useCommunityGenres()
  const [tab, setTab] = useState<ComposeTab>('spin')
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [caption, setCaption] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [dropText, setDropText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!user || !stats) {
    return (
      <div className="community-feed-composer community-feed-composer-guest ios-card">
        <p className="font-display font-bold">Transmit on the network</p>
        <p className="text-sm text-muted mt-2">
          Sign in to post Spins (music links) and Drops (short scene transmissions).
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

  const submit = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (tab === 'spin') {
        await createSpinPost({
          ...author,
          spotifyRaw: spotify,
          youtubeRaw: youtube,
          caption,
          trackTitle,
        })
        setSpotify('')
        setYoutube('')
        setCaption('')
        setTrackTitle('')
        setSuccess(`Spin live · +${DB_REWARDS.spin_post} dB`)
      } else {
        await createDropPost({ ...author, text: dropText })
        setDropText('')
        setSuccess(`Drop live · +${DB_REWARDS.drop_post} dB`)
      }
      onPosted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="community-feed-composer ios-card">
      <div className="community-feed-composer-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'spin'}
          className={clsx('community-feed-tab', tab === 'spin' && 'community-feed-tab-active')}
          onClick={() => setTab('spin')}
        >
          Spin
          <span className="community-feed-tab-hint">Music link</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'drop'}
          className={clsx('community-feed-tab', tab === 'drop' && 'community-feed-tab-active')}
          onClick={() => setTab('drop')}
        >
          Drop
          <span className="community-feed-tab-hint">Transmission</span>
        </button>
      </div>

      {tab === 'spin' ? (
        <div className="community-feed-form">
          <label className="community-feed-label">
            Spotify URL
            <input
              type="url"
              className="community-feed-input"
              placeholder="https://open.spotify.com/track/…"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="community-feed-label">
            YouTube URL
            <input
              type="url"
              className="community-feed-input"
              placeholder="https://youtube.com/watch?v=…"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="community-feed-label">
            Track title <span className="text-muted">(optional)</span>
            <input
              type="text"
              className="community-feed-input"
              placeholder="What are you spinning?"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              disabled={saving}
              maxLength={120}
            />
          </label>
          <label className="community-feed-label">
            Caption <span className="text-muted">(optional)</span>
            <textarea
              className="community-feed-textarea"
              rows={2}
              placeholder="Why this track matters…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={saving}
              maxLength={280}
            />
          </label>
        </div>
      ) : (
        <div className="community-feed-form">
          <label className="community-feed-label">
            Your drop
            <textarea
              className="community-feed-textarea"
              rows={4}
              placeholder="Scene report, hot take, release day energy — music culture only."
              value={dropText}
              onChange={(e) => setDropText(e.target.value)}
              disabled={saving}
              maxLength={280}
            />
          </label>
          <p className="community-feed-char">{dropText.length}/280</p>
        </div>
      )}

      {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
      {success && <p className="text-sm text-muted mt-3">{success}</p>}

      <Button
        type="button"
        variant="primary"
        className="mt-4"
        disabled={saving}
        onClick={() => void submit()}
      >
        {saving ? 'Broadcasting…' : tab === 'spin' ? 'Post Spin' : 'Post Drop'}
      </Button>
    </div>
  )
}
