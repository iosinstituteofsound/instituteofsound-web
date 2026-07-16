import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supportAdminApi from '@/modules/support-admin/api/support-admin.api'
import type {
  SupportTicketDto,
  TicketKind,
  TicketStatus,
  UpdateSupportTicketInput,
  WarnAuthorInput,
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

export function useDeleteSupportTicketTarget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supportAdminApi.deleteSupportTicketTarget(id),
    onSuccess: (ticket) => {
      queryClient.setQueryData(supportAdminQueryKeys.detail(ticket.id), ticket)
      queryClient.setQueriesData(
        { queryKey: supportAdminQueryKeys.all },
        (old: { items: SupportTicketDto[]; nextCursor: string | null } | SupportTicketDto | undefined) => {
          if (!old || typeof old !== 'object') return old
          if ('items' in old && Array.isArray(old.items)) {
            return {
              ...old,
              items: old.items.map((item) => (item.id === ticket.id ? ticket : item)),
            }
          }
          return old
        },
      )
      void queryClient.invalidateQueries({ queryKey: supportAdminQueryKeys.all })
    },
  })
}

export function useWarnSupportTicketAuthor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WarnAuthorInput }) =>
      supportAdminApi.warnSupportTicketAuthor(id, input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(supportAdminQueryKeys.detail(ticket.id), ticket)
      void queryClient.invalidateQueries({ queryKey: supportAdminQueryKeys.all })
    },
  })
}
