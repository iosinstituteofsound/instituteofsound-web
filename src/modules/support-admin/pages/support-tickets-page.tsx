import { useState } from 'react'
import { toast } from 'sonner'
import { Page, PageDescription, PageHeader, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { SupportTicketsDesk } from '@/modules/support-admin/components/support-tickets-desk'
import {
  useDeleteSupportTicketTarget,
  useSupportTickets,
  useUpdateSupportTicket,
  useWarnSupportTicketAuthor,
} from '@/modules/support-admin/hooks/use-support-tickets'
import type { TicketKind, TicketStatus } from '@/modules/support-admin/types/support-admin.types'

export function SupportTicketsPage() {
  const [kindFilter, setKindFilter] = useState<TicketKind | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('open')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const query = useSupportTickets({ kind: kindFilter, status: statusFilter })
  const update = useUpdateSupportTicket()
  const deleteTarget = useDeleteSupportTicketTarget()
  const warnAuthor = useWarnSupportTicketAuthor()

  return (
    <Page>
      <PageHeader>
        <PageTitle>Support</PageTitle>
        <PageDescription>Review support requests and safety reports from the mobile app.</PageDescription>
      </PageHeader>
      <PageSection>
        {query.isLoading ? (
          <Loader />
        ) : query.isError || !query.data ? (
          <div className="text-sm text-muted-foreground">Could not load support tickets.</div>
        ) : (
          <SupportTicketsDesk
            items={query.data.items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            kindFilter={kindFilter}
            statusFilter={statusFilter}
            onKindFilterChange={(value) => setKindFilter(value as TicketKind | 'all')}
            onStatusFilterChange={(value) => setStatusFilter(value as TicketStatus | 'all')}
            isSaving={update.isPending}
            isDeletingTarget={deleteTarget.isPending}
            isWarningAuthor={warnAuthor.isPending}
            onSave={(input) => {
              if (!selectedId) return
              update.mutate({ id: selectedId, input })
            }}
            onDeleteTarget={() => {
              if (!selectedId) return
              deleteTarget.mutate(selectedId, {
                onSuccess: () => toast.success('Comment deleted'),
                onError: () => toast.error('Could not delete comment'),
              })
            }}
            onWarnAuthor={(message) => {
              if (!selectedId) return
              warnAuthor.mutate(
                { id: selectedId, input: { message } },
                {
                  onSuccess: () => toast.success('Warning sent'),
                  onError: () => toast.error('Could not send warning'),
                },
              )
            }}
          />
        )}
      </PageSection>
    </Page>
  )
}
