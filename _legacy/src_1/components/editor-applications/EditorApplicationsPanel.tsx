import { useCallback, useEffect, useState } from 'react'
import {
  approveEditorApplication,
  listEditorApplications,
  rejectEditorApplication,
} from '@/lib/editor-applications/service'
import type { EditorApplicationWithProfile } from '@/lib/editor-applications/types'
import { DismissibleBanner } from '@/components/ui/DismissibleBanner'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import clsx from 'clsx'

interface EditorApplicationsPanelProps {
  reviewerId: string
}

export function EditorApplicationsPanel({ reviewerId }: EditorApplicationsPanelProps) {
  const [applications, setApplications] = useState<EditorApplicationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listEditorApplications()
      setApplications(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible =
    filter === 'pending'
      ? applications.filter((a) => a.status === 'pending')
      : applications

  const selected = visible.find((a) => a.id === selectedId) ?? visible[0] ?? null

  const handleApprove = async () => {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await approveEditorApplication(selected.id, reviewerId)
      setMessage(`Approved ${selected.applicantName} as editor.`)
      setSelectedId(null)
      setRejectNotes('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await rejectEditorApplication(selected.id, reviewerId, rejectNotes)
      setMessage(`Application from ${selected.applicantName} was declined.`)
      setSelectedId(null)
      setRejectNotes('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed')
    } finally {
      setBusy(false)
    }
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length

  if (loading) {
    return <LoadingTransmission variant="compact" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">Editor applications</h2>
          <p className="text-muted text-sm mt-1">
            Review artists who applied to join the editorial desk.
            {pendingCount > 0 && (
              <span className="text-mh-red ml-1">{pendingCount} pending</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                'ios-btn !text-xs',
                filter === f ? 'ios-btn-primary' : 'ios-btn-ghost'
              )}
            >
              {f === 'pending' ? 'Pending' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <DismissibleBanner variant="success" onDismiss={() => setMessage('')}>
          {message}
        </DismissibleBanner>
      )}
      {error && (
        <DismissibleBanner variant="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleBanner>
      )}

      {visible.length === 0 ? (
        <p className="text-muted text-sm border border-border px-4 py-8 text-center">
          No {filter === 'pending' ? 'pending ' : ''}applications.
        </p>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-4">
          <ul className="border border-border divide-y divide-border max-h-[480px] overflow-y-auto">
            {visible.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(app.id)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-surface/80 transition-colors',
                    selected?.id === app.id && 'bg-surface border-l-2 border-l-mh-red'
                  )}
                >
                  <p className="font-medium text-sm">{app.applicantName}</p>
                  <p className="text-xs text-muted truncate">{app.applicantEmail}</p>
                  <span
                    className={clsx(
                      'text-[10px] uppercase tracking-widest mt-1 inline-block',
                      app.status === 'pending' && 'text-amber-400',
                      app.status === 'approved' && 'text-green-500',
                      app.status === 'rejected' && 'text-muted'
                    )}
                  >
                    {app.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="ios-panel space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold">{selected.applicantName}</h3>
                <p className="text-sm text-muted">
                  {selected.applicantEmail}
                  {selected.applicantUsername && (
                    <span className="text-mh-red"> @{selected.applicantUsername}</span>
                  )}
                </p>
                <p className="text-xs text-muted mt-1">
                  Applied {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2">Portfolio links</p>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-surface/50 border border-border p-3 max-h-32 overflow-y-auto">
                  {selected.portfolioLinks}
                </pre>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2">Motivation</p>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                  {selected.motivation}
                </p>
              </div>

              {selected.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <label className="block text-xs uppercase tracking-widest text-muted">
                    Rejection note (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Shown only in your records; applicant sees a generic decline on re-apply."
                    className="ios-input w-full text-sm"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleApprove()}
                      className="ios-btn ios-btn-primary"
                    >
                      Approve as editor
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleReject()}
                      className="ios-btn ios-btn-ghost text-mh-red"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'rejected' && selected.reviewerNotes && (
                <p className="text-xs text-muted border-t border-border pt-3">
                  Internal note: {selected.reviewerNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
