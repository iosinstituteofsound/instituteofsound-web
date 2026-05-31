import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import { normalizeHandle } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { RankBadge } from '@/components/ui/RankBadge'
import { Input, FieldLabel } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { updateUserProfile } from '@/lib/auth/profile'
import { useAuth } from '@/context/AuthContext'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface NetworkProfileAboutCardProps {
  profile: PublicMemberProfile
  isYou: boolean
  editing?: boolean
  onEditingChange?: (editing: boolean) => void
  onSaved?: () => void | Promise<void>
}

export function NetworkProfileAboutCard({
  profile,
  isYou,
  editing = false,
  onEditingChange,
  onSaved,
}: NetworkProfileAboutCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const handleSlug = profile.handle.replace(/^@/, '')

  const [name, setName] = useState(profile.displayName)
  const [username, setUsername] = useState(handleSlug)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setName(profile.displayName)
    setUsername(handleSlug)
    setBio(profile.bio ?? '')
    setAvatarUrl(profile.avatarUrl ?? '')
  }, [profile.displayName, profile.bio, profile.avatarUrl, handleSlug])

  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const setEditing = (next: boolean) => {
    onEditingChange?.(next)
    if (!next) {
      setError('')
      setSuccess('')
      setName(profile.displayName)
      setUsername(handleSlug)
      setBio(profile.bio ?? '')
      setAvatarUrl(profile.avatarUrl ?? '')
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateUserProfile(user.id, {
        name: name.trim(),
        username: username.trim().replace(/^@/, ''),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      })
      setSuccess('Saved.')
      setEditing(false)
      const nextHandle = normalizeHandle(username)
      if (nextHandle !== handleSlug) {
        navigate(networkProfilePath(nextHandle))
      } else {
        await onSaved?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="np-card np-about-dossier">
      <div className="np-about-dossier__head">
        <p className="np-about-dossier__kicker">About</p>
        {isYou && !editing && (
          <button type="button" className="np-about-dossier__edit" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form className="np-about-dossier__form" onSubmit={save}>
          <FieldLabel htmlFor="np-about-name">Display name</FieldLabel>
          <Input
            id="np-about-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FieldLabel htmlFor="np-about-handle">Handle</FieldLabel>
          <Input
            id="np-about-handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourhandle"
            required
          />

          <FieldLabel htmlFor="np-about-bio">Bio</FieldLabel>
          <textarea
            id="np-about-bio"
            className="ios-input min-h-[88px] w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            placeholder="Tell the network what you do."
          />
          <p className="np-about-dossier__count">{bio.length}/280</p>

          <ImageUpload
            label="Avatar"
            folder="ios/artists"
            value={avatarUrl}
            onChange={setAvatarUrl}
            hint="Shown on your profile and posts."
          />

          {error && <p className="np-about-dossier__msg np-about-dossier__msg--err">{error}</p>}
          {success && <p className="np-about-dossier__msg np-about-dossier__msg--ok">{success}</p>}

          <div className="np-about-dossier__actions">
            <button type="submit" className="np-btn np-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="np-btn np-btn--outline"
              disabled={saving}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="np-about-dossier__name">{profile.displayName}</h2>
          <p className="np-about-dossier__handle">@{handleSlug}</p>

          {profile.bio ? (
            <p className="np-about-dossier__bio">{profile.bio}</p>
          ) : (
            <p className="np-about-dossier__bio np-about-dossier__bio--empty">No bio on file.</p>
          )}

          <dl className="np-about-dossier__meta">
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
            <div>
              <dt>Reputation</dt>
              <dd className="np-about-dossier__rep">
                <RankBadge rank={profile.rank} size="sm" />
                <span>{profile.totalDb.toLocaleString()} dB</span>
              </dd>
            </div>
            {profile.primaryGenreSlug && (
              <div>
                <dt>Primary scene</dt>
                <dd>{formatGenre(profile.primaryGenreSlug)}</dd>
              </div>
            )}
            <div>
              <dt>Posts</dt>
              <dd>{profile.postCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Connections</dt>
              <dd>{profile.connectionCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Followers</dt>
              <dd>{profile.followerCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Following</dt>
              <dd>{profile.followingCount.toLocaleString()}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  )
}
