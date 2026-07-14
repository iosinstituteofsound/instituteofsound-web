import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { SupportTicketDto, TicketStatus } from '@/modules/support-admin/types/support-admin.types'
import { usePermission } from '@/shared/hooks/use-permission'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

const KIND_FILTERS = [
  { id: 'all', label: 'All kinds' },
  { id: 'support', label: 'Support' },
  { id: 'safety', label: 'Safety' },
] as const

const STATUS_FILTERS = [
  { id: 'all', label: 'All status' },
  { id: 'open', label: 'Open' },
  { id: 'pending_user', label: 'Waiting' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
] as const

function statusLabel(status: string) {
  switch (status) {
    case 'pending_user':
      return 'Waiting on user'
    default:
      return status.replace('_', ' ')
  }
}

export function SupportTicketsDesk({
  items,
  selectedId,
  onSelect,
  kindFilter,
  statusFilter,
  onKindFilterChange,
  onStatusFilterChange,
  onSave,
  isSaving,
}: {
  items: SupportTicketDto[]
  selectedId: string | null
  onSelect: (id: string) => void
  kindFilter: string
  statusFilter: string
  onKindFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSave: (input: { status: TicketStatus; adminNote?: string }) => void
  isSaving: boolean
}) {
  const { can } = usePermission()
  const canManage = can('support', 'manage')
  const selected = useMemo(
    () => (selectedId ? items.find((item) => item.id === selectedId) ?? null : null),
    [items, selectedId],
  )
  const [status, setStatus] = useState<TicketStatus>('open')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (!selected) return
    setStatus(selected.status)
    setAdminNote(selected.adminNote ?? '')
  }, [selected])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {KIND_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                kindFilter === filter.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onKindFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === filter.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onStatusFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No tickets match these filters.
            </div>
          ) : (
            items.map((ticket, index) => (
              <button
                key={ticket.id}
                type="button"
                className={cn(
                  'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/40',
                  index > 0 && 'border-t border-border',
                  selectedId === ticket.id && 'bg-muted/50',
                )}
                onClick={() => onSelect(ticket.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{ticket.subject}</span>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                    {statusLabel(ticket.status)}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{ticket.body}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {ticket.kind} · {ticket.userName || ticket.userEmail || ticket.userId} ·{' '}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {!selected ? (
          <p className="text-sm text-muted-foreground">Select a ticket to review.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {selected.kind} · {selected.category}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{selected.subject}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.userName || 'Unknown'} · {selected.userEmail || selected.userId}
              </p>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{selected.body}</p>
            {selected.target ? (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <p className="font-semibold uppercase tracking-wide text-muted-foreground">Target</p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {selected.target.type} · {selected.target.id}
                </p>
                {selected.diagnostics.route ? (
                  <p className="mt-1 text-xs text-muted-foreground">Route · {selected.diagnostics.route}</p>
                ) : null}
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `${selected.target!.type}:${selected.target!.id}`,
                    )
                    toast.success('Target copied')
                  }}
                >
                  Copy target
                </button>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Device · App {selected.diagnostics.appVersion} · {selected.diagnostics.platform} · OS{' '}
              {selected.diagnostics.osVersion}
            </p>

            <div className="space-y-2 border-t border-border pt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={status}
                disabled={!canManage}
                onChange={(event) => setStatus(event.target.value as TicketStatus)}
              >
                <option value="open">Open</option>
                <option value="pending_user">Waiting on user</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Admin note
              </label>
              <Textarea
                value={adminNote}
                disabled={!canManage}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Internal note shown to the user when set"
                rows={4}
              />
              {canManage ? (
                <Button
                  disabled={isSaving}
                  onClick={() => {
                    onSave({
                      status,
                      adminNote: adminNote.trim() || undefined,
                    })
                    toast.success('Ticket updated')
                  }}
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">You can view tickets but not update them.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
