import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { AdminTrackDto, AdminTrackListResult } from '@/modules/music/types/music.types'

export async function listAdminTracks(params?: {
  q?: string
  status?: 'processing' | 'ready' | 'failed'
  page?: number
  limit?: number
}) {
  const { data } = await apiClient.get<ApiSuccessResponse<AdminTrackListResult>>(
    `${API_V1}/admin/music/tracks`,
    { params },
  )
  return data.data
}

export async function updateAdminTrack(id: string, input: { title: string }) {
  const { data } = await apiClient.patch<ApiSuccessResponse<AdminTrackDto>>(
    `${API_V1}/admin/music/tracks/${id}`,
    input,
  )
  return data.data
}

export async function deleteAdminTrack(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean; trackId: string }>>(
    `${API_V1}/admin/music/tracks/${id}`,
  )
  return data.data
}

export interface BulkDeleteTracksResult {
  deletedCount: number
  failedCount: number
  results: Array<{ trackId: string; deleted: boolean; error?: string }>
}

export async function bulkDeleteAdminTracks(trackIds: string[]) {
  const { data } = await apiClient.post<ApiSuccessResponse<BulkDeleteTracksResult>>(
    `${API_V1}/admin/music/tracks/bulk-delete`,
    { trackIds },
  )
  return data.data
}

export interface DuplicateProbeMatch {
  trackId: string
  title: string
  artistName: string
  score: number
  matchConfidence: 'confirmed' | 'likely' | null
  wouldFlag: boolean
}

export interface DuplicateProbeResult {
  fingerprintVersion: number
  segmentCount: number
  durationSec: number
  thresholds: { exact: number; likely: number }
  matches: DuplicateProbeMatch[]
  nearestBelowThreshold?: {
    trackId: string
    title: string
    artistName: string
    score: number
  }
}

export async function probeDuplicateAudio(file: File, referenceTrackId?: string) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<ApiSuccessResponse<DuplicateProbeResult>>(
    `${API_V1}/admin/music/duplicate-probe`,
    form,
    {
      params: referenceTrackId ? { referenceTrackId } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return data.data
}
