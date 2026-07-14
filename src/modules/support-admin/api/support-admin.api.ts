import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  SupportTicketDto,
  SupportTicketListResponse,
  TicketKind,
  TicketStatus,
  UpdateSupportTicketInput,
} from '@/modules/support-admin/types/support-admin.types'

const BASE = `${API_V1}/admin/support/tickets`

export async function listAdminSupportTickets(params?: {
  limit?: number
  cursor?: string
  kind?: TicketKind
  status?: TicketStatus
}) {
  const { data } = await apiClient.get<ApiSuccessResponse<SupportTicketListResponse>>(BASE, {
    params,
  })
  return data.data ?? { items: [], nextCursor: null }
}

export async function getAdminSupportTicket(id: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ ticket: SupportTicketDto }>>(
    `${BASE}/${id}`,
  )
  return data.data.ticket
}

export async function updateAdminSupportTicket(id: string, input: UpdateSupportTicketInput) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ ticket: SupportTicketDto }>>(
    `${BASE}/${id}`,
    input,
  )
  return data.data.ticket
}
