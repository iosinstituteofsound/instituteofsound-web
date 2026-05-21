import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  createSubmission,
  getSubmissionsForArtist,
} from '@/lib/submissions/service'
import { StatusBadge } from '@/components/auth/StatusBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import { ArtistProfileEditor } from '@/components/dashboard/ArtistProfileEditor'
import type { TrackSubmission } from '@/lib/auth/types'

export default function ArtistDashboardPage() {
  const { user, logout, mode } = useAuth()
  const [submissions, setSubmissions] = useState<TrackSubmission[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [tab, setTab] = useState<'profile' | 'submit' | 'history'>('profile')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [genre, setGenre] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [description, setDescription] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoadingList(true)
    try {
      const list = await getSubmissionsForArtist(user.id)
      setSubmissions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoadingList(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setProjectName(user.name)
      refresh()
    }
  }, [user, refresh])

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await createSubmission(user, {
        projectName,
        genre,
        trackTitle,
        description,
        streamUrl,
        coverImageUrl: coverImageUrl || undefined,
      })
      setTrackTitle('')
      setDescription('')
      setStreamUrl('')
      setCoverImageUrl('')
      setSuccess('Track submitted! Editors will review it in their dashboard.')
      await refresh()
      setTab('history')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section-padding pt-28 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-mh-red font-bold">
              Artist Portal
              {mode === 'supabase' && (
                <span className="ml-2 text-muted font-normal">· cloud</span>
              )}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase mt-1">
              Artist Portal
            </h1>
            <p className="text-muted text-sm mt-2">
              Logged in as <span className="text-signal">{user.name}</span> ·{' '}
              {user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="text-xs tracking-widest uppercase text-muted hover:text-signal"
            >
              ← Site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs tracking-widest uppercase border border-border px-4 py-2 hover:border-mh-red hover:text-mh-red"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border mb-8">
          {(['profile', 'submit', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs tracking-widest uppercase font-bold border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-mh-red text-mh-red'
                  : 'border-transparent text-muted hover:text-signal'
              }`}
            >
              {t === 'profile'
                ? 'Band Profile'
                : t === 'submit'
                  ? 'Submit Track'
                  : `Submissions (${submissions.length})`}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ArtistProfileEditor user={user} />}

        {tab === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <p className="text-sm text-muted border-l-2 border-mh-red pl-4">
              Your track goes to the <strong className="text-signal">Editor Dashboard</strong>{' '}
              as a pending request. Editors listen, review, and approve or reject.
            </p>

            <div>
              <FieldLabel>Project / Band Name</FieldLabel>
              <Input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Genre</FieldLabel>
              <Input
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Dark Ambient, Industrial..."
              />
            </div>
            <div>
              <FieldLabel>Track Title</FieldLabel>
              <Input required value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
            </div>
            <ImageUpload
              label="Track Artwork"
              folder="ios/submissions"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              hint="Stored on Cloudinary — fast load for editors worldwide."
            />
            <div>
              <FieldLabel>Stream Link (Spotify, SoundCloud, Drive...)</FieldLabel>
              <Input
                required
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <FieldLabel>Description for Editors</FieldLabel>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="ios-input min-h-[120px]"
                placeholder="Tell editors about the track, influences, why it fits IOS..."
              />
            </div>

            {error && <p className="text-mh-red text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit to Editors →'}
            </Button>
          </form>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            {loadingList ? (
              <LoadingTransmission variant="compact" />
            ) : submissions.length === 0 ? (
              <p className="text-muted text-sm py-8 border border-dashed border-border text-center">
                No submissions yet. Submit your first track.
              </p>
            ) : (
              submissions.map((s) => (
                <article key={s.id} className="ios-card p-5 md:p-6 flex flex-col sm:flex-row gap-5">
                  {s.coverImageUrl && (
                    <IOSImage
                      src={s.coverImageUrl}
                      alt={s.trackTitle}
                      width={160}
                      height={160}
                      className="w-32 h-32 shrink-0 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold uppercase">
                        {s.trackTitle}
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        {s.projectName} · {s.genre}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm text-muted mt-3 line-clamp-2">{s.description}</p>
                  <a
                    href={s.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-mh-red mt-2 inline-block hover:underline"
                  >
                    Listen link →
                  </a>
                  {s.editorNotes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-[10px] tracking-widest uppercase text-rs-red mb-1">
                        Editor feedback
                      </p>
                      <p className="text-sm text-signal/90">{s.editorNotes}</p>
                      {s.reviewedByName && (
                        <p className="text-xs text-muted mt-2">
                          — {s.reviewedByName},{' '}
                          {s.reviewedAt &&
                            new Date(s.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
