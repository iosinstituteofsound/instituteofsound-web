import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  ArticleTemplateDto,
  ArticleTemplatesPayload,
  PublishConfigDto,
} from '@/modules/editor/types/article-template.types'

export async function listArticleTemplates() {
  const { data } = await apiClient.get<ApiSuccessResponse<ArticleTemplatesPayload>>(
    `${API_V1}/editor/article-templates`,
  )
  return data.data
}

export async function getArticleTemplate(id: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<ArticleTemplateDto>>(
    `${API_V1}/editor/article-templates/${id}`,
  )
  return data.data
}

export async function createArticleTemplate(input: {
  name: string
  description?: string
  category?: string
  puckDocument: Record<string, unknown>
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<ArticleTemplateDto>>(
    `${API_V1}/editor/article-templates`,
    input,
  )
  return data.data
}

export async function deleteArticleTemplate(id: string) {
  await apiClient.delete(`${API_V1}/editor/article-templates/${id}`)
}

export async function getPublishConfig() {
  const { data } = await apiClient.get<ApiSuccessResponse<PublishConfigDto>>(
    `${API_V1}/editor/publish-config`,
  )
  return data.data
}
