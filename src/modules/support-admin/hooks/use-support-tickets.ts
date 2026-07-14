import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supportAdminApi from '@/modules/support-admin/api/support-admin.api'
import type {
  TicketKind,
  TicketStatus,
  UpdateSupportTicketInput,
} from '@/modules/support-admin/types/support-admin.types'

export const supportAdminQueryKeys = {
  all: ['support-admin'] as const,
  list: (filters: { kind?: TicketKind | 'all'; status?: TicketStatus | 'all' }) =>
    [...supportAdminQueryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...supportAdminQueryKeys.all, 'detail', id] as const,
}

export function useSupportTickets(filters: {
  kind?: TicketKind | 'all'
  status?: TicketStatus | 'all'
}) {
  return useQuery({
    queryKey: supportAdminQueryKeys.list(filters),
    queryFn: () =>
      supportAdminApi.listAdminSupportTickets({
        limit: 50,
        kind: filters.kind && filters.kind !== 'all' ? filters.kind : undefined,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
      }),
  })
}

export function useSupportTicket(id: string | null) {
  return useQuery({
    queryKey: supportAdminQueryKeys.detail(id ?? ''),
    queryFn: () => supportAdminApi.getAdminSupportTicket(id!),
    enabled: Boolean(id),
  })
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupportTicketInput }) =>
      supportAdminApi.updateAdminSupportTicket(id, input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(supportAdminQueryKeys.detail(ticket.id), ticket)
      void queryClient.invalidateQueries({ queryKey: supportAdminQueryKeys.all })
    },
  })
}
