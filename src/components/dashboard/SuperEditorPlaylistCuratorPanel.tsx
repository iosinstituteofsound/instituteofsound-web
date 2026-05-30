import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  listPlaylistCuratorApplicationsForReview,
  reviewPlaylistCuratorApplication,
} from '@/lib/playlistCurator/service'
import { syncPlaylistCuratorDeskNotifications } from '@/lib/playlistCurator/notify'
import type { PlaylistCuratorApplication } from '@/lib/playlistCurator/types'

export function SuperEditorPlaylistCuratorPanel() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<PlaylistCuratorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | PlaylistCuratorApplication['status']>(
    'pending',
  )
  const [query, setQuery] = useState('')

  const reload = async () => {
    setLoading(true)
    setError('')
    try {
      setApplications(await listPlaylistCuratorApplicationsForReview())
      void syncPlaylistCuratorDeskNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const pending = useMemo(
    () => applications.filter((a) => a.status === 'pending'),
    [applications],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false
      if (!q) return true
      return (
        app.userName?.toLowerCase().includes(q) ||
        app.userHandle?.toLowerCase().includes(q) ||
        app.userId.toLowerCase().includes(q) ||
        app.note?.toLowerCase().includes(q) ||
        app.playlistLinks.some((l) => l.toLowerCase().includes(q))
      )
    })
  }, [applications, statusFilter, query])

  const resolve = async (id: string, decision: 'approved' | 'rejected') => {
    if (!user) return
    setBusyId(id)
    setError('')
    try {
      await reviewPlaylistCuratorApplication(id, decision, noteById[id], user.id)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading playlist curator applications…</p>
  }

  return (
    <section className="space-y-4">
      <div className="ios-card p-5">
        <p className="text-[10px] tracking-widest uppercase text-mh-red">Playlist curators</p>
        <h2 className="font-display text-xl font-bold uppercase mt-2">
          Curator applications ({pending.length} pending)
        </h2>
        <p className="text-sm text-muted mt-2">
          Review submitted playlist links and notes. Approve to verify the member as an IOS
          playlist curator.
        </p>
        <div className="grid md:grid-cols-2 gap-2 mt-4">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | PlaylistCuratorApplication['status'])
            }
            className="ios-input"
            aria-label="Filter by status"
          >
            <option value="pending">Pending only</option>
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, handle, link, note…"
            className="ios-input"
            aria-label="Search applications"
          />
        </div>
      </div>

      {error && <p className="text-sm text-mh-red">{error}</p>}

      {filtered.length === 0 ? (
        <div className="ios-card p-5 text-sm text-muted">No applications in this view.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <article key={app.id} className="ios-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-widest text-muted">
                  {app.status} · {new Date(app.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-sm mt-2">
                <span className="text-muted">Applicant:</span>{' '}
                {app.userName || app.userId}
                {app.userHandle && (
                  <span className="text-mh-red"> @{app.userHandle}</span>
                )}
              </p>
              {app.note && (
                <p className="text-sm mt-3 text-signal/90 whitespace-pre-wrap">{app.note}</p>
              )}
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted mb-2">
                  Playlist links ({app.playlistLinks.length})
                </p>
                <ul className="space-y-2">
                  {app.playlistLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="ios-link text-sm break-all"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {app.reviewNotes && app.status !== 'pending' && (
                <p className="text-xs text-muted mt-3">Desk note: {app.reviewNotes}</p>
              )}
              {app.status === 'pending' && (
                <div className="mt-4 space-y-2">
                  <textarea
                    rows={2}
                    value={noteById[app.id] ?? ''}
                    onChange={(e) =>
                      setNoteById((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                    placeholder="Review note for applicant (optional)"
                    className="ios-input min-h-[64px] w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ios-btn ios-btn-primary !text-xs"
                      disabled={busyId === app.id}
                      onClick={() => void resolve(app.id, 'approved')}
                    >
                      Approve &amp; verify links
                    </button>
                    <button
                      type="button"
                      className="ios-btn ios-btn-ghost !text-xs"
                      disabled={busyId === app.id}
                      onClick={() => void resolve(app.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
