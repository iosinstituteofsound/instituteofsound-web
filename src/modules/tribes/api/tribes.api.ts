import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  AllianceChallenge,
  AllianceDetail,
  AllianceLegacyEvent,
  AllianceSummary,
  GenreDetail,
  GenreDto,
  MyAlliance,
  TribeReputationTag,
} from '@/modules/tribes/types/alliance.types'

export async function listGenres() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ genres: GenreDto[] }>>(`${API_V1}/genres`)
  return data.data.genres
}

export async function getGenre(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<GenreDetail>>(`${API_V1}/genres/${slug}`)
  return data.data
}

export async function listAlliances(params?: { genre?: string; sort?: 'score' | 'weeklyDb'; limit?: number }) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ alliances: AllianceSummary[] }>>(
    `${API_V1}/tribes`,
    { params },
  )
  return data.data.alliances
}

export async function getAllianceLeaderboard(params?: {
  genre?: string
  period?: 'week' | 'season' | 'score'
  limit?: number
}) {
  const { data } = await apiClient.get<
    ApiSuccessResponse<{ alliances: AllianceSummary[]; period: string }>
  >(`${API_V1}/tribes/leaderboard`, { params })
  return data.data
}

export async function getAlliance(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<AllianceDetail>>(`${API_V1}/tribes/${slug}`)
  return data.data
}

export async function getMyAlliance() {
  const { data } = await apiClient.get<ApiSuccessResponse<MyAlliance | null>>(`${API_V1}/me/tribe`)
  return data.data
}

export async function createAlliance(input: {
  name: string
  tagline?: string
  description?: string
  genreSlug: string
  reputationTag: TribeReputationTag
  visibility?: 'public' | 'invite_only' | 'private'
}) {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{ alliance: AllianceSummary; threadId?: string }>
  >(`${API_V1}/tribes`, input)
  return data.data
}

export async function joinAlliance(slug: string, inviteCode?: string) {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{ alliance: AllianceSummary; threadId?: string }>
  >(`${API_V1}/tribes/${slug}/join`, { inviteCode })
  return data.data
}

export async function leaveAlliance(slug: string) {
  await apiClient.post(`${API_V1}/tribes/${slug}/leave`)
}

export async function getAllianceLegacy(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ events: AllianceLegacyEvent[] }>>(
    `${API_V1}/tribes/${slug}/legacy`,
  )
  return data.data.events
}

export async function getAllianceChallenges(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ challenges: AllianceChallenge[] }>>(
    `${API_V1}/tribes/${slug}/challenges`,
  )
  return data.data.challenges
}
