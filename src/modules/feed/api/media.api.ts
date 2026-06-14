import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type { MediaAttachKind } from '@/modules/feed/lib/media-utils'

export type MediaUploadResult = {
  url: string
  absoluteUrl?: string
  kind: MediaAttachKind
  mimeType: string
  sizeBytes: number
  originalName: string
}

export async function uploadMediaFile(
  file: Blob,
  filename: string,
  onProgress?: (percent: number) => void,
): Promise<MediaUploadResult> {
  const formData = new FormData()
  formData.append('file', file, filename)

  const { data } = await apiClient.post<ApiSuccessResponse<MediaUploadResult>>(
    `${API_V1}/media/upload`,
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
