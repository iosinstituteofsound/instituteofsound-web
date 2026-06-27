import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import {
  fetchClientLinkPreview,
  hasRichPreview,
} from '@/shared/lib/link-preview/client-link-preview'
import { linkPreviewStub, type LinkPreview } from '@/shared/lib/link-preview/link-preview'

async function fetchLinkPreviewFromApi(url: string): Promise<LinkPreview | null> {
  const { data } = await apiClient.get<ApiSuccessResponse<{ preview: LinkPreview }>>(
    `${API_V1}/link-preview`,
    { params: { url: url.trim() } },
  )
  const preview = data.data.preview
  const stub = linkPreviewStub(url)
  return {
    ...stub,
    ...preview,
    url: preview.url?.trim() || stub.url,
    title: preview.title?.trim() || stub.title,
    siteName: preview.siteName?.trim() || stub.siteName,
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const trimmed = url.trim()

  try {
    const apiPreview = await fetchLinkPreviewFromApi(trimmed)
    if (apiPreview && hasRichPreview(apiPreview)) return apiPreview
  } catch {
    /* fall through to client-side providers for known platforms */
  }

  const clientPreview = await fetchClientLinkPreview(trimmed)
  if (hasRichPreview(clientPreview)) return clientPreview

  try {
    const apiPreview = await fetchLinkPreviewFromApi(trimmed)
    if (apiPreview) return apiPreview
  } catch {
    /* ignore */
  }

  return linkPreviewStub(trimmed)
}
