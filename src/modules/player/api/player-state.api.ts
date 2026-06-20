import { API_V1, apiUrl } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import { tokenStorage } from '@/shared/services/api/token-storage'
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

/** Best-effort save on tab close; axios cannot use fetch keepalive. */
export function savePlayerStateKeepalive(payload: UpsertPlayerStateDto) {
  const token = tokenStorage.getAccessToken()
  if (!token) return

  try {
    void fetch(apiUrl(`${API_V1}/me/player-state`), {
      method: 'PUT',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    /* ignore */
  }
}
