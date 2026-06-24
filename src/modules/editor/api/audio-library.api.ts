import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export interface AudioLibraryTrackDto {
  id: string
  title: string
  artistName: string
  streamUrl: string
  durationSec?: number
  releaseId?: string
  artworkUrl?: string
}

export async function searchAudioLibraryTracks(params: { q?: string; limit?: number }) {
  const { data } = await apiClient.get<ApiSuccessResponse<AudioLibraryTrackDto[]>>(
    `${API_V1}/audio-library/tracks`,
    { params },
  )
  return data.data
}

