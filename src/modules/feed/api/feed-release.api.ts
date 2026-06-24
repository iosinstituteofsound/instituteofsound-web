import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export async function getFeedItemByRelease(releaseId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ item: FeedItemDto | null }>>(
    `${API_V1}/feed/by-release/${releaseId}`,
  )
  return data.data.item
}
