import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  ArtistPublicDto,
  AudioUploadJobDto,
  PlaylistDetailDto,
  ReleaseDetailDto,
  TrackDto,
} from '@/modules/music/types/music.types'
import type {
  ArtistAnalyticsDashboardDto,
  ArtistReleasePerformanceDto,
  AnalyticsRangePreset,
  AnalyticsTrendPointDto,
  LikeToggleResultDto,
  PaginatedLikersDto,
  PaginatedListenersDto,
  ReleaseAnalyticsSummaryDto,
} from '@/modules/music/types/analytics.types'

export async function createAudioUploadJob() {
  const { data } = await apiClient.post<ApiSuccessResponse<AudioUploadJobDto>>(`${API_V1}/music/uploads`)
  return data.data
}

export async function uploadAudioFile(
  jobId: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  formData.append('file', file, file.name)
  const { data } = await apiClient.put<ApiSuccessResponse<AudioUploadJobDto>>(
    `${API_V1}/music/uploads/${jobId}/file`,
    formData,
    {
      timeout: 0,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        onProgress(Math.round((event.loaded / event.total) * 100))
      },
    },
  )
  return data.data
}

export async function finalizeAudioUpload(jobId: string, title?: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<AudioUploadJobDto>>(
    `${API_V1}/music/uploads/${jobId}/finalize`,
    { title },
  )
  return data.data
}

export async function getAudioUploadJob(jobId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<AudioUploadJobDto>>(
    `${API_V1}/music/uploads/${jobId}`,
  )
  return data.data
}

export async function getArtistProfile() {
  const { data } = await apiClient.get<ApiSuccessResponse<ArtistPublicDto['profile']>>(
    `${API_V1}/artist/profile`,
  )
  return data.data
}

export async function listArtistTracks() {
  const { data } = await apiClient.get<ApiSuccessResponse<TrackDto[]>>(`${API_V1}/artist/tracks`)
  return data.data
}

export async function updateArtistTrack(
  id: string,
  input: {
    title: string
    lyrics?: string
    syncedLyrics?: Array<{ text: string; timeMs: number }>
    syncedLyricsStatus?: 'none' | 'draft' | 'pending_review' | 'approved'
  },
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<TrackDto>>(`${API_V1}/artist/tracks/${id}`, input)
  return data.data
}

export async function listArtistReleases() {
  const { data } = await apiClient.get<ApiSuccessResponse<ReleaseDetailDto[]>>(`${API_V1}/artist/releases`)
  return data.data
}

export async function createRelease(input: {
  title: string
  type: 'single' | 'ep' | 'album'
  genre?: string
  coverUrl?: string
  trackIds?: string[]
  releaseDate?: string
  releaseTimezone?: string
  status?: 'draft' | 'published'
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<ReleaseDetailDto>>(
    `${API_V1}/artist/releases`,
    input,
  )
  return data.data
}

export async function updateRelease(
  id: string,
  input: {
    title?: string
    type?: 'single' | 'ep' | 'album'
    genre?: string
    coverUrl?: string
    trackIds?: string[]
    releaseDate?: string
    releaseTimezone?: string
    status?: 'draft' | 'published'
  },
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<ReleaseDetailDto>>(
    `${API_V1}/artist/releases/${id}`,
    input,
  )
  return data.data
}

export async function deleteRelease(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(
    `${API_V1}/artist/releases/${id}`,
  )
  return data.data
}

export async function listMyPlaylists() {
  const { data } = await apiClient.get<ApiSuccessResponse<PlaylistDetailDto[]>>(`${API_V1}/me/playlists`)
  return data.data
}

export async function getMyPlaylist(idOrSlug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/me/playlists/${idOrSlug}`,
  )
  return data.data
}

export async function createMyPlaylist(input: {
  title: string
  description?: string
  coverUrl?: string
  visibility?: 'public' | 'private'
  trackIds?: string[]
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/me/playlists`,
    input,
  )
  return data.data
}

export async function updateMyPlaylist(
  id: string,
  input: {
    title?: string
    description?: string
    coverUrl?: string
    visibility?: 'public' | 'private'
    trackIds?: string[]
  },
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/me/playlists/${id}`,
    input,
  )
  return data.data
}

export async function deleteMyPlaylist(id: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(
    `${API_V1}/me/playlists/${id}`,
  )
  return data.data
}

export async function addTrackToMyPlaylist(playlistId: string, trackId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/me/playlists/${playlistId}/tracks`,
    { trackId },
  )
  return data.data
}

export async function removeTrackFromMyPlaylist(playlistId: string, trackId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/me/playlists/${playlistId}/tracks/${trackId}`,
  )
  return data.data
}

export async function getArtistPublicByUserId(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArtistPublicDto>>(
    `${API_V1}/artists/user/${userId}`,
  )
  return data.data
}

export async function getArtistPublic(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArtistPublicDto>>(`${API_V1}/artists/${slug}`)
  return data.data
}

export async function getReleaseDetail(idOrSlug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ReleaseDetailDto>>(
    `${API_V1}/releases/${idOrSlug}`,
  )
  return data.data
}

export async function getPlaylistDetail(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/playlists/${slug}`,
  )
  return data.data
}

export async function recordTrackPlay(trackId: string) {
  await apiClient.post(`${API_V1}/music/tracks/${trackId}/play`)
}

export async function getReleaseAnalytics(releaseId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ReleaseAnalyticsSummaryDto>>(
    `${API_V1}/music/releases/${releaseId}/analytics`,
  )
  return data.data
}

export async function getReleaseAnalyticsTrends(
  releaseId: string,
  range: '7d' | '30d' | '90d' | '365d' | 'lifetime' = '7d',
) {
  const { data } = await apiClient.get<ApiSuccessResponse<AnalyticsTrendPointDto[]>>(
    `${API_V1}/music/releases/${releaseId}/analytics/trends`,
    { params: { range } },
  )
  return data.data
}

export async function getReleaseListeners(
  releaseId: string,
  params?: { page?: number; pageSize?: number; sort?: string; q?: string },
) {
  const { data } = await apiClient.get<ApiSuccessResponse<PaginatedListenersDto>>(
    `${API_V1}/music/releases/${releaseId}/listeners`,
    { params },
  )
  return data.data
}

export async function getReleaseLikes(
  releaseId: string,
  params?: { page?: number; pageSize?: number; sort?: string; q?: string },
) {
  const { data } = await apiClient.get<ApiSuccessResponse<PaginatedLikersDto>>(
    `${API_V1}/music/releases/${releaseId}/likes`,
    { params },
  )
  return data.data
}

export async function toggleTrackLike(trackId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<LikeToggleResultDto>>(
    `${API_V1}/music/tracks/${trackId}/like`,
  )
  return data.data
}

export async function getArtistReleasePerformance(params: {
  range?: AnalyticsRangePreset
  from?: string
  to?: string
}) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArtistReleasePerformanceDto>>(
    `${API_V1}/artist/analytics/release-performance`,
    { params },
  )
  return data.data
}

export async function getArtistAnalyticsDashboard() {
  const { data } = await apiClient.get<ApiSuccessResponse<ArtistAnalyticsDashboardDto>>(
    `${API_V1}/artist/analytics`,
  )
  return data.data
}

export async function downloadArtistAnalyticsCsv() {
  const { data } = await apiClient.get<string>(`${API_V1}/artist/analytics/export`, {
    responseType: 'text',
  })
  return data
}

export async function getTrackReleaseRedirect(trackId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ releaseId: string }>>(
    `${API_V1}/music/tracks/${trackId}`,
  )
  return data.data
}
