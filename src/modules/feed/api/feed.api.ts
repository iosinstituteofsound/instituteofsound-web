import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { CreateFeedItemInput, FeedItemDto, FeedListResponse } from '@/modules/feed/types/feed.types'

export async function listFeed(params?: {
  limit?: number
  cursor?: string
  authorId?: string
  type?: FeedItemDto['type']
}) {
  const { data } = await apiClient.get<ApiSuccessResponse<FeedListResponse>>(`${API_V1}/feed`, {
    params,
  })
  return data.data
}

export async function createFeedItem(input: CreateFeedItemInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ item: FeedItemDto }>>(
    `${API_V1}/feed`,
    input,
  )
  return data.data.item
}

export async function deleteFeedItem(id: string) {
  await apiClient.delete(`${API_V1}/feed/${id}`)
}

export type { FeedItemDto, FeedListResponse, CreateFeedItemInput }
