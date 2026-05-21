import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  createSubmission,
  getSubmissionsForArtist,
} from '@/lib/submissions/service'
import { StatusBadge } from '@/components/auth/StatusBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import type { TrackSubmission } from '@/lib/auth/types'

const inputClass =
  'w-full bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:border-mh-red'

export default function ArtistDashboardPage() {
  const { user, logout, mode } = useAuth()
  const [submissions, setSubmissions] = useState<TrackSubmission[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [tab, setTab] = useState<'submit' | 'history'>('submit')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [genre, setGenre] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [description, setDescription] = useState('')
  const [streamUrl, setStreamUrl] = useState('')

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
      })
      setTrackTitle('')
      setDescription('')
      setStreamUrl('')
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
              Submit Tracks
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
          {(['submit', 'history'] as const).map((t) => (
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
              {t === 'submit' ? 'New Submission' : `My Submissions (${submissions.length})`}
            </button>
          ))}
        </div>

        {tab === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <p className="text-sm text-muted border-l-2 border-mh-red pl-4">
              Your track goes to the <strong className="text-signal">Editor Dashboard</strong>{' '}
              as a pending request. Editors listen, review, and approve or reject.
            </p>

            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                Project / Band Name
              </label>
              <input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                Genre
              </label>
              <input
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className={inputClass}
                placeholder="Dark Ambient, Industrial..."
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                Track Title
              </label>
              <input
                required
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                Stream Link (Spotify, SoundCloud, Drive...)
              </label>
              <input
                required
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
                Description for Editors
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                placeholder="Tell editors about the track, influences, why it fits IOS..."
              />
            </div>

            {error && <p className="text-mh-red text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-mh-red text-white px-8 py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-rs-red transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit to Editors →'}
            </button>
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
                <article
                  key={s.id}
                  className="border border-border p-5 md:p-6 bg-paper"
                >
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
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
