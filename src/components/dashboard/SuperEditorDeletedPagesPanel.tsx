import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  listDeletedArtistPagesForDesk,
  reviewArtistPageRecoveryRequest,
} from '@/lib/artist-page-recovery/service'
import type { DeletedArtistPageRow } from '@/lib/artist-page-recovery/types'

function reasonLabel(reason: DeletedArtistPageRow['deletionReason']): string {
  if (reason === 'incomplete_draft_expired') return 'Draft expired (7d)'
  if (reason === 'inactive_live_page') return 'Inactive (60d)'
  return 'Manual'
}

export function SuperEditorDeletedPagesPanel() {
  const { user } = useAuth()
  const [rows, setRows] = useState<DeletedArtistPageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const reload = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await listDeletedArtistPagesForDesk())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted pages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q),
    )
  }, [rows, query])

  const review = async (requestId: string, decision: 'approved' | 'rejected') => {
    if (!user) return
    setBusyId(requestId)
    setError('')
    try {
      await reviewArtistPageRecoveryRequest(requestId, user.id, decision, noteById[requestId])
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="ios-panel space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-signal mb-1">Deleted pages</p>
          <h2 className="font-display text-xl font-bold">Artist page recovery queue</h2>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Pages removed by lifecycle rules appear here. Review IOS Support requests, verify government ID,
            then restore or decline.
          </p>
        </div>
        <input
          type="search"
          placeholder="Search name, slug, user id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ios-input !text-sm max-w-xs"
        />
      </div>

      {error && <p className="text-mh-red text-sm">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading deleted pages…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted">No deleted pages in the archive.</p>
      )}

      <ul className="space-y-3">
        {filtered.map((row) => {
          const req = row.recoveryRequest
          return (
            <li key={row.id} className="ios-card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display font-bold">{row.displayName}</p>
                  <p className="text-xs text-muted font-mono">
                    /artist/{row.slug} · deleted {new Date(row.deletedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted mt-1">{reasonLabel(row.deletionReason)}</p>
                </div>
                {req && (
                  <span
                    className={
                      req.status === 'pending'
                        ? 'text-xs uppercase tracking-widest text-amber-400'
                        : req.status === 'approved'
                          ? 'text-xs uppercase tracking-widest text-emerald-400'
                          : 'text-xs uppercase tracking-widest text-muted'
                    }
                  >
                    Request: {req.status}
                  </span>
                )}
              </div>

              {req ? (
                <div className="border-t border-border/60 pt-3 space-y-2 text-sm">
                  <p>
                    <span className="text-muted">Submitted:</span>{' '}
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                  {req.applicantNote && (
                    <p>
                      <span className="text-muted">Artist note:</span> {req.applicantNote}
                    </p>
                  )}
                  <p>
                    <a
                      href={req.govIdDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal underline"
                    >
                      View government ID ↗
                    </a>
                  </p>
                  {req.status === 'pending' && (
                    <>
                      <textarea
                        className="ios-input w-full !text-sm min-h-[72px]"
                        placeholder="Internal review notes (shown to artist if declined)"
                        value={noteById[req.id] ?? ''}
                        onChange={(e) =>
                          setNoteById((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="ios-btn ios-btn-primary !text-xs"
                          disabled={busyId === req.id}
                          onClick={() => void review(req.id, 'approved')}
                        >
                          {busyId === req.id ? 'Working…' : 'Restore page'}
                        </button>
                        <button
                          type="button"
                          className="ios-btn ios-btn-ghost !text-xs"
                          disabled={busyId === req.id}
                          onClick={() => void review(req.id, 'rejected')}
                        >
                          Decline
                        </button>
                      </div>
                    </>
                  )}
                  {req.status !== 'pending' && req.reviewNotes && (
                    <p className="text-muted text-xs">Notes: {req.reviewNotes}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted border-t border-border/60 pt-3">
                  No IOS Support recovery request yet.
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
