import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { DexProfileDto } from '@/modules/identity/types/identity.types'

export async function getDexProfile() {
  const { data } = await apiClient.get<ApiSuccessResponse<DexProfileDto>>(`${API_V1}/dex/profile`)
  return data.data
}
