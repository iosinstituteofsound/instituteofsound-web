export type JsonLdObject = Record<string, unknown>
export type JsonLd = JsonLdObject | JsonLdObject[]

export interface SeoConfig {
  title: string
  description: string
  /** Site path, e.g. /discover */
  canonicalPath: string
  ogImage?: string
  ogType?: 'website' | 'article'
  robots?: 'index, follow' | 'noindex, nofollow'
  jsonLd?: JsonLd | JsonLd[]
}
