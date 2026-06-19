import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  ArticleDto,
  ExploreFilter,
  ExplorePayload,
  LabelProfileDto,
  ArtistProfileDto,
  ReleasesCatalogDto,
  ReleasesPageDto,
  ReleasesPageFilter,
  TrackSubmissionDto,
  WireCandidates,
  WirePickItem,
  DiscographyDto,
  EditorialDeskDto,
  EditorialPickDto,
} from '@/modules/explore/types/explore.types'

export async function getExplore() {
  const { data } = await apiClient.get<ApiSuccessResponse<ExplorePayload>>(`${API_V1}/explore`)
  return data.data
}

export async function getArticle(slug: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArticleDto>>(`${API_V1}/articles/${slug}`)
  return data.data
}

export async function getEditorArticle(id: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArticleDto>>(`${API_V1}/editor/articles/${id}`)
  return data.data
}

export async function listEditorArticles(status?: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArticleDto[]>>(`${API_V1}/editor/articles`, {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function createEditorArticle(input: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiSuccessResponse<ArticleDto>>(`${API_V1}/editor/articles`, input)
  return data.data
}

export async function updateEditorArticle(id: string, input: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiSuccessResponse<ArticleDto>>(
    `${API_V1}/editor/articles/${id}`,
    input,
  )
  return data.data
}

export async function publishEditorArticle(id: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<ArticleDto>>(
    `${API_V1}/editor/articles/${id}/publish`,
  )
  return data.data
}

export async function deleteEditorArticle(id: string) {
  await apiClient.delete(`${API_V1}/editor/articles/${id}`)
}

export async function listEditorSubmissions(status?: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<TrackSubmissionDto[]>>(
    `${API_V1}/editor/submissions`,
    { params: status ? { status } : undefined },
  )
  return data.data
}

export async function reviewSubmission(id: string, input: { status: string; editorNotes?: string }) {
  const { data } = await apiClient.patch<ApiSuccessResponse<TrackSubmissionDto>>(
    `${API_V1}/editor/submissions/${id}/review`,
    input,
  )
  return data.data
}

export async function getWirePicks() {
  const { data } = await apiClient.get<ApiSuccessResponse<WirePickItem[]>>(`${API_V1}/editor/wire-picks`)
  return data.data
}

export async function saveWirePicks(items: WirePickItem[]) {
  const { data } = await apiClient.put<ApiSuccessResponse<WirePickItem[]>>(
    `${API_V1}/editor/wire-picks`,
    { items },
  )
  return data.data
}

export async function getWireCandidates() {
  const { data } = await apiClient.get<ApiSuccessResponse<WireCandidates>>(
    `${API_V1}/editor/wire-picks/candidates`,
  )
  return data.data
}

export async function listEditorEvents() {
  const { data } = await apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_V1}/editor/events`)
  return data.data
}

export async function createEditorEvent(input: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiSuccessResponse<unknown>>(`${API_V1}/editor/events`, input)
  return data.data
}

export async function createArtistSubmission(input: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiSuccessResponse<TrackSubmissionDto>>(
    `${API_V1}/artist/submissions`,
    input,
  )
  return data.data
}

export async function listArtistSubmissions() {
  const { data } = await apiClient.get<ApiSuccessResponse<TrackSubmissionDto[]>>(
    `${API_V1}/artist/submissions`,
  )
  return data.data
}

export async function getLabelProfile() {
  const { data } = await apiClient.get<ApiSuccessResponse<LabelProfileDto>>(`${API_V1}/label/profile`)
  return data.data
}

export async function updateLabelProfile(input: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiSuccessResponse<LabelProfileDto>>(
    `${API_V1}/label/profile`,
    input,
  )
  return data.data
}

export async function getLabelRoster() {
  const { data } = await apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_V1}/label/roster`)
  return data.data
}

export async function getLabelReleases() {
  const { data } = await apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_V1}/label/releases`)
  return data.data
}

export async function getExploreArtists(filter: ExploreFilter = 'all') {
  const { data } = await apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_V1}/explore/artists`, {
    params: { filter },
  })
  return data.data
}

export async function getExploreLabels(filter: ExploreFilter = 'all') {
  const { data } = await apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_V1}/explore/labels`, {
    params: { filter },
  })
  return data.data
}

export async function getReleasesCatalog() {
  const { data } = await apiClient.get<ApiSuccessResponse<ReleasesCatalogDto>>(
    `${API_V1}/explore/releases/catalog`,
  )
  return data.data
}

export async function getReleasesPage(params: {
  page: number
  limit: number
  filter: ReleasesPageFilter
  genre?: string
}) {
  const { data } = await apiClient.get<ApiSuccessResponse<ReleasesPageDto>>(
    `${API_V1}/explore/releases`,
    { params },
  )
  return data.data
}

export async function getProfileDiscography(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<DiscographyDto>>(
    `${API_V1}/explore/discography/${userId}`,
  )
  return data.data
}

export async function getProfileEditorialDesk(userId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<EditorialDeskDto>>(
    `${API_V1}/explore/editorial-desk/${userId}`,
  )
  return data.data
}

export async function searchEditorialPickCandidates(query: string, limit = 20) {
  const { data } = await apiClient.get<ApiSuccessResponse<EditorialPickDto[]>>(
    `${API_V1}/editor/editorial-picks/search`,
    { params: { q: query, limit } },
  )
  return data.data
}

export async function setArtistPick(releaseId: string) {
  const { data } = await apiClient.put<ApiSuccessResponse<ArtistProfileDto>>(
    `${API_V1}/artist/discography/pick`,
    { releaseId },
  )
  return data.data
}
