import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { PlayerStateDto, UpsertPlayerStateDto } from '@/modules/player/types/player-state.types'

export async function getPlayerState() {
  const { data } = await apiClient.get<ApiSuccessResponse<PlayerStateDto | null>>(
    `${API_V1}/me/player-state`,
  )
  return data.data
}

export async function savePlayerState(payload: UpsertPlayerStateDto) {
  const { data } = await apiClient.put<ApiSuccessResponse<PlayerStateDto>>(
    `${API_V1}/me/player-state`,
    payload,
  )
  return data.data
}
