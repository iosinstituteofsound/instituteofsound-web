import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  NationCalendarDto,
  NationCalendarFilter,
  NationHubDto,
  NationMagazineArticlesDto,
  NationRecentActivityDto,
  NationTopArtistsDto,
  NationTrendingTracksDto,
  NationWalletDto,
  NationWalletLedgerDto,
  NationWorldEntryDto,
} from '@/modules/feed/types/nation.types'

export async function getNationHub() {
  const { data } = await apiClient.get<ApiSuccessResponse<NationHubDto>>(`${API_V1}/nation/hub`)
  return data.data
}

export async function getNationWorldEntry() {
  const { data } = await apiClient.get<ApiSuccessResponse<NationWorldEntryDto>>(
    `${API_V1}/nation/world-entry`,
  )
  return data.data
}

export async function getNationTopArtists(limit = 10) {
  const { data } = await apiClient.get<ApiSuccessResponse<NationTopArtistsDto>>(
    `${API_V1}/nation/top-artists`,
    { params: { limit } },
  )
  return data.data
}

export async function getNationCalendar(month: string, filter: NationCalendarFilter = 'all') {
  const { data } = await apiClient.get<ApiSuccessResponse<NationCalendarDto>>(
    `${API_V1}/nation/calendar`,
    { params: { month, filter } },
  )
  return data.data
}

export async function toggleNationEventRsvp(eventId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ joined: boolean }>>(
    `${API_V1}/nation/events/${eventId}/rsvp`,
  )
  return data.data
}

export async function getNationRecentActivity() {
  const { data } = await apiClient.get<ApiSuccessResponse<NationRecentActivityDto>>(
    `${API_V1}/nation/recent-activity`,
  )
  return data.data
}

export async function getNationMagazineArticles(limit = 8) {
  const { data } = await apiClient.get<ApiSuccessResponse<NationMagazineArticlesDto>>(
    `${API_V1}/nation/magazine-articles`,
    { params: { limit } },
  )
  return data.data
}

export async function getNationTrendingTracks(limit = 5) {
  const { data } = await apiClient.get<ApiSuccessResponse<NationTrendingTracksDto>>(
    `${API_V1}/nation/trending-tracks`,
    { params: { limit } },
  )
  return data.data
}

export async function getNationWallet() {
  const { data } = await apiClient.get<ApiSuccessResponse<NationWalletDto>>(
    `${API_V1}/nation/wallet`,
  )
  return data.data
}

export async function getNationWalletLedger(cursor?: string, limit = 30) {
  const { data } = await apiClient.get<ApiSuccessResponse<NationWalletLedgerDto>>(
    `${API_V1}/nation/wallet/ledger`,
    { params: { cursor, limit } },
  )
  return data.data
}
