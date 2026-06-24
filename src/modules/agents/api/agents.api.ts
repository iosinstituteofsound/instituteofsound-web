import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'

export type LyricsGenerationStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed'

export type LyricsGenerationStage =
  | 'queued'
  | 'downloading_audio'
  | 'transcribing'
  | 'formatting_lyrics'
  | 'saving'

export interface LyricsGenerationStatusDto {
  trackId: string
  status: LyricsGenerationStatus
  stage?: LyricsGenerationStage
  progress?: number
  error?: string
  generatedAt?: string
}

export interface LyricsGenerationResultDto {
  trackId: string
  status: LyricsGenerationStatus
  stage?: LyricsGenerationStage
  progress?: number
  lyrics?: string
  syncedLyricsCount?: number
}

export async function generateTrackLyrics(trackId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<LyricsGenerationResultDto>>(
    `${API_V1}/agents/lyrics/generate`,
    { trackId },
  )
  return data.data
}

export async function getLyricsGenerationStatus(trackId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<LyricsGenerationStatusDto>>(
    `${API_V1}/agents/lyrics/status/${trackId}`,
  )
  return data.data
}
