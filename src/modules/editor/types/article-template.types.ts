export type ArticleTemplateCategory = 'feature' | 'review' | 'interview' | 'photo'

export interface ArticleTemplateDto {
  id: string
  name: string
  description: string
  category: ArticleTemplateCategory
  source: 'system' | 'saved'
  puckDocument: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface ArticleTemplatesPayload {
  system: ArticleTemplateDto[]
  saved: ArticleTemplateDto[]
}

export interface PublishConfigDto {
  excerptMaxLength: number
  excerptSeoRecommendedLength: number
  seoDescriptionMaxLength: number
  seoTitleMaxLength: number
  articleTypes: Array<{ value: string; label: string }>
  featuredFlags: Array<{ key: string; label: string }>
  templateCategories: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
}
