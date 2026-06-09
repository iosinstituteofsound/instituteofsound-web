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
import { addProfilePhotoHistory } from '@/lib/network/profilePhotoHistory'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function personaLabel(persona: string) {
  return persona.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function aboutTags(profile: PublicMemberProfile): string[] {
  const tags: string[] = ['Music Industry']
  if (profile.primaryGenreSlug) tags.push(formatGenre(profile.primaryGenreSlug))
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') {
    tags.push('Digital Publishing')
  }
  if (profile.profileRole === 'artist') tags.push('Artist Desk')
  if (profile.dashboardPersona) tags.push(personaLabel(profile.dashboardPersona))
  if (profile.rank !== 'Listener') tags.push(profile.rank)
  return [...new Set(tags)]
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

  const firstName = profile.displayName.split(/\s+/)[0] || profile.displayName
  const tags = aboutTags(profile)

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
      const nextAvatar = avatarUrl.trim() || undefined
      await updateUserProfile(user.id, {
        name: name.trim(),
        username: username.trim().replace(/^@/, ''),
        bio: bio.trim() || undefined,
        avatarUrl: nextAvatar,
      })
      if (nextAvatar) addProfilePhotoHistory(user.id, 'avatar', nextAvatar)
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
        <h2 className="np-about-dossier__title">About {firstName}</h2>
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
          {profile.bio ? (
            <p className="np-about-dossier__bio">{profile.bio}</p>
          ) : (
            <p className="np-about-dossier__bio np-about-dossier__bio--empty">
              {isYou ? 'Add a bio so the network knows what you do.' : 'No bio on file yet.'}
            </p>
          )}

          {tags.length > 0 && (
            <ul className="np-about-dossier__tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <footer className="np-about-dossier__foot">
            <div className="np-about-dossier__rep">
              <RankBadge rank={profile.rank} size="sm" />
              <span>{profile.totalDb.toLocaleString()} dB</span>
            </div>
            <span className="np-about-dossier__since">
              Member since{' '}
              {new Date(profile.memberSince).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </footer>
        </>
      )}
    </section>
  )
}
