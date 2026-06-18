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
      headers: { 'Content-Type': 'multipart/form-data' },
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

export async function updateArtistProfile(input: {
  displayName?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  genres?: string[]
}) {
  const { data } = await apiClient.patch<ApiSuccessResponse<ArtistPublicDto['profile']>>(
    `${API_V1}/artist/profile`,
    input,
  )
  return data.data
}

export async function listArtistTracks() {
  const { data } = await apiClient.get<ApiSuccessResponse<TrackDto[]>>(`${API_V1}/artist/tracks`)
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

export async function listArtistPlaylists() {
  const { data } = await apiClient.get<ApiSuccessResponse<PlaylistDetailDto[]>>(
    `${API_V1}/artist/playlists`,
  )
  return data.data
}

export async function createArtistPlaylist(input: {
  title: string
  description?: string
  coverUrl?: string
  visibility?: 'public' | 'private'
  trackIds?: string[]
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<PlaylistDetailDto>>(
    `${API_V1}/artist/playlists`,
    input,
  )
  return data.data
}

export async function updateArtistPlaylist(
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
    `${API_V1}/artist/playlists/${id}`,
    input,
  )
  return data.data
}

export async function listMyPlaylists() {
  const { data } = await apiClient.get<ApiSuccessResponse<PlaylistDetailDto[]>>(`${API_V1}/me/playlists`)
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
