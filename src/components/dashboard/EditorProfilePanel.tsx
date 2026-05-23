import { useEffect, useState } from 'react'
import type { User } from '@/lib/auth/types'
import { updateUserProfile } from '@/lib/auth/profile'
import { suggestUsernameFromEmail, normalizeUsername, validateUsername } from '@/lib/auth/username'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Input, FieldLabel } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'
import { IOSImage } from '@/components/ui/IOSImage'

interface EditorProfilePanelProps {
  user: User
  onSaved: () => Promise<void>
}

export function EditorProfilePanel({ user, onSaved }: EditorProfilePanelProps) {
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username ?? suggestUsernameFromEmail(user.email))
  const [bio, setBio] = useState(user.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setName(user.name)
    setUsername(user.username ?? suggestUsernameFromEmail(user.email))
    setBio(user.bio ?? '')
    setAvatarUrl(user.avatarUrl ?? '')
  }, [user])

  const usernamePreview = normalizeUsername(username) || 'username'
  const usernameError = username ? validateUsername(username) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await updateUserProfile(user.id, {
        name,
        username,
        bio,
        avatarUrl,
      })
      await onSaved()
      setMessage('Profile saved. Your name and @username appear on new editorials.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setError(
        /avatar_url|username|bio|schema cache/i.test(msg)
          ? `${msg} — Run Supabase migration 019-editor-profile-fields.sql.`
          : msg
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <p className="text-sm text-muted border-l-2 border-mh-red pl-4 leading-relaxed">
        Your editorial identity — photo, display name, and @username show on published articles
        and in the desk header.
      </p>

      {error && (
        <DismissibleBanner variant="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleBanner>
      )}
      {message && (
        <DismissibleBanner variant="success" onDismiss={() => setMessage('')}>
          {message}
        </DismissibleBanner>
      )}

      <div className="ios-panel flex flex-wrap items-center gap-6">
        <div className="shrink-0">
          {avatarUrl ? (
            <IOSImage
              src={avatarUrl}
              alt={name}
              width={120}
              className="w-24 h-24 object-cover border border-border"
            />
          ) : (
            <div
              className="w-24 h-24 border border-dashed border-border flex items-center justify-center text-xs text-muted uppercase tracking-widest"
              aria-hidden
            >
              No photo
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[12rem]">
          <p className="font-display text-xl font-bold uppercase">{name || 'Your name'}</p>
          <p className="text-sm text-mh-red mt-1">@{usernamePreview}</p>
          <p className="text-xs text-muted mt-2">{user.email}</p>
        </div>
      </div>

      <ImageUpload
        label="Profile picture"
        folder="ios/editors"
        value={avatarUrl}
        onChange={setAvatarUrl}
        hint="Square photo works best — JPG, PNG, or WebP via Cloudinary."
      />

      <div>
        <FieldLabel htmlFor="editor-display-name">Display name</FieldLabel>
        <Input
          id="editor-display-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mira Volkov"
          maxLength={80}
        />
        <p className="text-xs text-muted mt-1">Shown as the author on reviews and features.</p>
      </div>

      <div>
        <FieldLabel htmlFor="editor-username">Username</FieldLabel>
        <div className="flex items-center gap-0 border border-border bg-surface focus-within:border-mh-red">
          <span className="pl-4 text-sm text-muted">@</span>
          <input
            id="editor-username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setUsername(normalizeUsername(username) || username)}
            className="flex-1 bg-transparent px-2 py-3 text-sm focus:outline-none"
            placeholder="mira_volkov"
            maxLength={32}
            spellCheck={false}
            autoComplete="username"
          />
        </div>
        {usernameError ? (
          <p className="text-xs text-mh-red mt-1">{usernameError}</p>
        ) : (
          <p className="text-xs text-muted mt-1">
            Letters, numbers, underscore only. Minimum 3 characters.
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="editor-bio">Short bio</FieldLabel>
        <textarea
          id="editor-bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          className="ios-input w-full min-h-[100px] font-serif leading-relaxed"
          placeholder="Senior editor · underground metal · Institute of Sound"
        />
        <p className="text-xs text-muted mt-1 text-right tabular-nums">{bio.length}/280</p>
      </div>

      <Button type="submit" variant="primary" disabled={saving || Boolean(usernameError)}>
        {saving ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}
