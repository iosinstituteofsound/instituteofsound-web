import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export interface GiphyGif {
  id: string
  title: string
  previewUrl: string
  url: string
  width: number
  height: number
}

export interface GiphyListResponse {
  items: GiphyGif[]
}

export async function searchGifs(query: string, limit = 20) {
  const { data } = await apiClient.get<ApiSuccessResponse<GiphyListResponse>>(
    `${API_V1}/giphy/search`,
    { params: { q: query.trim(), limit } },
  )
  return data.data.items
}

export async function trendingGifs(limit = 20) {
  const { data } = await apiClient.get<ApiSuccessResponse<GiphyListResponse>>(
    `${API_V1}/giphy/trending`,
    { params: { limit } },
  )
  return data.data.items
}
