import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { EVENT_KINDS, type EventKind } from '@/lib/events/constants'
import { submitSceneEvent } from '@/lib/events/service'
import { INDIA_SCENE_CITIES, SCENE_GENRE_SLUGS } from '@/lib/releases/constants'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface EventSubmitFormProps {
  onSubmitted?: () => void
}

export function EventSubmitForm({ onSubmitted }: EventSubmitFormProps) {
  const { user } = useAuth()
  const { stats } = useCommunityMemberStats()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventKind, setEventKind] = useState<EventKind>('gig')
  const [city, setCity] = useState('')
  const [genreSlug, setGenreSlug] = useState(stats?.primaryGenreSlug ?? '')
  const [venue, setVenue] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!user) {
    return (
      <div className="event-submit ios-card">
        <p className="text-sm text-muted">Sign in to submit an underground gig listing.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await submitSceneEvent(
        {
          title,
          description: description || undefined,
          eventKind,
          sceneCity: city,
          sceneGenreSlug: genreSlug || undefined,
          venueName: venue,
          startsAt,
          externalUrl,
        },
        user.id
      )
      setTitle('')
      setDescription('')
      setVenue('')
      setStartsAt('')
      setExternalUrl('')
      setSuccess(
        isSupabaseConfigured()
          ? 'Submitted — IOS editors will review before it goes live.'
          : 'Listing saved locally for demo.'
      )
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="event-submit ios-card" onSubmit={(e) => void handleSubmit(e)}>
      <p className="ios-kicker">Submit a gig</p>
      <p className="text-sm text-muted mt-2">
        Listings only — external link for tickets. Editors approve to prevent fake shows.
      </p>

      <input
        className="collab-input"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={120}
      />

      <textarea
        className="collab-input collab-textarea"
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        rows={2}
      />

      <div className="collab-composer-row">
        <select
          className="collab-input"
          value={eventKind}
          onChange={(e) => setEventKind(e.target.value as EventKind)}
        >
          {EVENT_KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          className="collab-input"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </div>

      <div className="collab-composer-row">
        <select
          className="collab-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        >
          <option value="">City</option>
          {INDIA_SCENE_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="collab-input"
          value={genreSlug}
          onChange={(e) => setGenreSlug(e.target.value)}
        >
          <option value="">Genre tribe (optional)</option>
          {SCENE_GENRE_SLUGS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <input
        className="collab-input"
        placeholder="Venue name"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        required
        maxLength={120}
      />
      <input
        className="collab-input"
        type="url"
        placeholder="Tickets / Instagram / Maps link"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
        required
      />

      {error && <p className="text-sm text-crimson mt-2">{error}</p>}
      {success && <p className="text-sm text-mh-red mt-2">{success}</p>}

      <button type="submit" className="ios-btn ios-btn-primary mt-4" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit for editor review'}
      </button>
    </form>
  )
}
