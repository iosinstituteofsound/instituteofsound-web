import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  AllianceChallenge,
  AllianceDetail,
  AllianceLegacyEvent,
  AllianceSummary,
  AllianceUnlock,
  AllianceVisibility,
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
  visibility?: AllianceVisibility
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

export async function getAllianceUnlocks(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ unlocks: AllianceUnlock[] }>>(
    `${API_V1}/tribes/${slug}/unlocks`,
  )
  return data.data.unlocks
}

export async function claimChallenge(slug: string, challengeId: string) {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{
      treasuryDbAwarded: number
      membersRewarded: number
      memberDbEach: number
    }>
  >(`${API_V1}/tribes/${slug}/challenges/${challengeId}/claim`)
  return data.data
}

export async function spendUnlock(slug: string, unlockKey: string) {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{ unlock: { key: string; label: string; dbCost: number } }>
  >(`${API_V1}/tribes/${slug}/unlocks/spend`, { unlockKey })
  return data.data
}

export async function promoteMember(slug: string, userId: string) {
  await apiClient.post(`${API_V1}/tribes/${slug}/members/${userId}/promote`)
}

export async function demoteMember(slug: string, userId: string) {
  await apiClient.post(`${API_V1}/tribes/${slug}/members/${userId}/demote`)
}

export async function kickMember(slug: string, userId: string) {
  await apiClient.post(`${API_V1}/tribes/${slug}/members/${userId}/kick`)
}

export async function transferLeadership(slug: string, targetUserId: string) {
  await apiClient.post(`${API_V1}/tribes/${slug}/transfer-leadership`, { targetUserId })
}

export async function updateAlliance(
  slug: string,
  patch: {
    name?: string
    tagline?: string
    description?: string
    bannerUrl?: string
    emblemUrl?: string
    visibility?: AllianceVisibility
    settings?: { joinApproval?: boolean; minDbToJoin?: number; probationHours?: number }
  },
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ alliance: AllianceSummary }>>(
    `${API_V1}/tribes/${slug}`,
    patch,
  )
  return data.data
}

export async function startDisband(slug: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ disbandAt?: string; archived?: boolean }>>(
    `${API_V1}/tribes/${slug}/disband`,
  )
  return data.data
}

export async function cancelDisband(slug: string) {
  await apiClient.delete(`${API_V1}/tribes/${slug}/disband`)
}
