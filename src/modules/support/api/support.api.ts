import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { CreateTicketInput, SupportTicketDto } from '@/modules/support/types/support.types'

const BASE = `${API_V1}/support`

export async function createTicket(input: CreateTicketInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ ticket: SupportTicketDto }>>(
    `${BASE}/tickets`,
    input,
  )
  return data.data.ticket
}
