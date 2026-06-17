import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { PlatformStats } from '@/modules/public/types/platform-stats.types'

export async function getPlatformStats() {
  const { data } = await apiClient.get<ApiSuccessResponse<PlatformStats>>(
    `${API_V1}/explore/platform-stats`,
  )
  return data.data
}
