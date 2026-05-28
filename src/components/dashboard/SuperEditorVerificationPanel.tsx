import { useEffect, useMemo, useState } from 'react'
import {
  listVerificationRequestsForReview,
  reviewRoleVerificationRequest,
} from '@/lib/verification/service'
import type { RoleVerificationRequest } from '@/lib/verification/types'

function prettyRole(role: string) {
  return role.replace(/_/g, ' ')
}

export function SuperEditorVerificationPanel() {
  const [requests, setRequests] = useState<RoleVerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | RoleVerificationRequest['status']>('pending')
  const [roleFilter, setRoleFilter] = useState<'all' | RoleVerificationRequest['roleType']>('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const reload = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listVerificationRequestsForReview()
      setRequests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const pending = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests]
  )

  const filteredRequests = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false
      if (roleFilter !== 'all' && request.roleType !== roleFilter) return false
      if (!q) return true
      return (
        request.userName?.toLowerCase().includes(q) ||
        request.userHandle?.toLowerCase().includes(q) ||
        request.userId.toLowerCase().includes(q) ||
        request.websiteDomain?.toLowerCase().includes(q) ||
        request.officialEmail?.toLowerCase().includes(q) ||
        request.venuePartnerReference?.toLowerCase().includes(q)
      )
    })
    result.sort((a, b) =>
      sortBy === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return result
  }, [requests, statusFilter, roleFilter, query, sortBy])

  const resolve = async (requestId: string, decision: 'approved' | 'rejected') => {
    setBusyId(requestId)
    setError('')
    try {
      await reviewRoleVerificationRequest(requestId, decision, noteById[requestId] ?? '')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review action failed.')
    } finally {
      setBusyId(null)
    }
  }

  const toggleSelected = (requestId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, requestId])] : prev.filter((id) => id !== requestId)
    )
  }

  const bulkResolve = async (decision: 'approved' | 'rejected') => {
    if (selectedIds.length === 0) return
    setBusyId('bulk')
    setError('')
    try {
      for (const id of selectedIds) {
        await reviewRoleVerificationRequest(id, decision, noteById[id] ?? '')
      }
      setSelectedIds([])
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk review action failed.')
    } finally {
      setBusyId(null)
    }
  }

  const exportCsv = () => {
    const headers = [
      'id',
      'status',
      'roleType',
      'userId',
      'userName',
      'userHandle',
      'websiteDomain',
      'officialEmail',
      'venuePartnerReference',
      'proofLinks',
      'reviewNotes',
      'createdAt',
      'updatedAt',
    ]
    const rows = filteredRequests.map((r) => [
      r.id,
      r.status,
      r.roleType,
      r.userId,
      r.userName ?? '',
      r.userHandle ?? '',
      r.websiteDomain ?? '',
      r.officialEmail ?? '',
      r.venuePartnerReference ?? '',
      (r.proofLinks ?? []).join(' | '),
      r.reviewNotes ?? '',
      r.createdAt,
      r.updatedAt,
    ])
    const csv =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n') + '\n'

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verification-queue-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading verification queue…</p>
  }

  return (
    <section className="space-y-4">
      <div className="ios-card p-5">
        <p className="text-[10px] tracking-widest uppercase text-mh-red">Verification queue</p>
        <h2 className="font-display text-xl font-bold uppercase mt-2">
          Role proofs review ({pending.length} pending)
        </h2>
        <p className="text-sm text-muted mt-2">
          Approve/reject role verification proofs for manager, label, promoter, and brand.
        </p>
        <div className="grid md:grid-cols-4 gap-2 mt-4">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as 'all' | RoleVerificationRequest['status']
              )
            }
            className="ios-input"
            aria-label="Filter by status"
          >
            <option value="pending">Pending only</option>
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value as 'all' | RoleVerificationRequest['roleType']
              )
            }
            className="ios-input"
            aria-label="Filter by role type"
          >
            <option value="all">All role types</option>
            <option value="artist_manager">Artist manager</option>
            <option value="label">Label</option>
            <option value="event_promoter">Event promoter</option>
            <option value="brand">Brand</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="ios-input"
            aria-label="Sort requests"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / @handle / email"
            className="ios-input"
            aria-label="Search verification requests"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="ios-btn ios-btn-primary !text-xs"
            onClick={() => void bulkResolve('approved')}
            disabled={selectedIds.length === 0 || busyId === 'bulk'}
          >
            Bulk approve ({selectedIds.length})
          </button>
          <button
            type="button"
            className="ios-btn ios-btn-ghost !text-xs"
            onClick={() => void bulkResolve('rejected')}
            disabled={selectedIds.length === 0 || busyId === 'bulk'}
          >
            Bulk reject ({selectedIds.length})
          </button>
          <button
            type="button"
            className="ios-btn ios-btn-secondary !text-xs"
            onClick={exportCsv}
            disabled={filteredRequests.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-mh-red">{error}</p>}

      {filteredRequests.length === 0 ? (
        <div className="ios-card p-5 text-sm text-muted">No verification requests yet.</div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <article key={request.id} className="ios-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Select request ${request.id}`}
                    checked={selectedIds.includes(request.id)}
                    onChange={(e) => toggleSelected(request.id, e.target.checked)}
                  />
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {prettyRole(request.roleType)} · {request.status}
                  </p>
                </div>
                <p className="text-xs text-muted">
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-sm mt-2">
                <span className="text-muted">User:</span>{' '}
                {request.userName || request.userId}
                {request.userHandle && (
                  <span className="text-mh-red"> @{request.userHandle}</span>
                )}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs text-muted">
                <div>
                  <p className="uppercase tracking-widest mb-2">Proof links</p>
                  <ul className="space-y-1">
                    {request.proofLinks.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer" className="ios-link break-all">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  {request.artistConfirmationLink && (
                    <p>
                      Artist confirmation:{' '}
                      <a
                        href={request.artistConfirmationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="ios-link break-all"
                      >
                        {request.artistConfirmationLink}
                      </a>
                    </p>
                  )}
                  {request.websiteDomain && <p>Website/domain: {request.websiteDomain}</p>}
                  {request.officialEmail && <p>Official email: {request.officialEmail}</p>}
                  {request.venuePartnerReference && (
                    <p>Venue/partner ref: {request.venuePartnerReference}</p>
                  )}
                  {request.reviewNotes && <p>Review note: {request.reviewNotes}</p>}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="mt-4 space-y-2">
                  <textarea
                    rows={2}
                    value={noteById[request.id] ?? ''}
                    onChange={(e) =>
                      setNoteById((prev) => ({ ...prev, [request.id]: e.target.value }))
                    }
                    placeholder="Review note (optional)"
                    className="ios-input min-h-[64px]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ios-btn ios-btn-primary !text-xs"
                      disabled={busyId === request.id}
                      onClick={() => void resolve(request.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ios-btn ios-btn-ghost !text-xs"
                      disabled={busyId === request.id}
                      onClick={() => void resolve(request.id, 'rejected')}
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

