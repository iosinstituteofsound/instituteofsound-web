import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  CreateIllustratorArtworkInput,
  IllustratorAnalyticsDashboardDto,
  IllustratorArtworkDetailDto,
  IllustratorArtworkSaveResultDto,
  IllustratorPortfolioItemDto,
  SaveIllustratorArtworkInput,
} from '@/modules/illustrator/types/illustrator.types'

export async function getIllustratorAnalyticsDashboard() {
  const { data } = await apiClient.get<ApiSuccessResponse<IllustratorAnalyticsDashboardDto>>(
    `${API_V1}/illustrator/analytics`,
  )
  return data.data
}

export async function listIllustratorPortfolio() {
  const { data } = await apiClient.get<ApiSuccessResponse<IllustratorPortfolioItemDto[]>>(
    `${API_V1}/illustrator/portfolio`,
  )
  return data.data
}

export async function createIllustratorArtwork(input: CreateIllustratorArtworkInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<IllustratorArtworkDetailDto>>(
    `${API_V1}/illustrator/artworks`,
    input,
  )
  return data.data
}

export async function getIllustratorArtwork(artworkId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<IllustratorArtworkDetailDto>>(
    `${API_V1}/illustrator/artworks/${artworkId}`,
  )
  return data.data
}

export async function saveIllustratorArtwork(artworkId: string, input: SaveIllustratorArtworkInput) {
  const { data } = await apiClient.put<ApiSuccessResponse<IllustratorArtworkSaveResultDto>>(
    `${API_V1}/illustrator/artworks/${artworkId}`,
    input,
    { timeout: 120_000 },
  )
  return data.data
}
