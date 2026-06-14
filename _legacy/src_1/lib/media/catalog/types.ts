export type CatalogPlatform = 'spotify' | 'youtube' | 'soundcloud' | 'unsupported'

export type CatalogItemKind = 'track' | 'album' | 'single' | 'ep' | 'video'

export interface CatalogImportItem {
  id: string
  kind: CatalogItemKind
  title: string
  streamUrl: string
  coverUrl?: string
  playCount?: number
  releaseYear?: number
}

export interface CatalogImportSuggestions {
  displayName?: string
  avatarUrl?: string
  bannerUrl?: string
  genres?: string[]
  tagline?: string
  spotifyUrl?: string
  youtubeUrl?: string
}

export interface ArtistCatalogImportResult {
  platform: CatalogPlatform
  profileUrl: string
  suggestions: CatalogImportSuggestions
  items: CatalogImportItem[]
  warnings: string[]
}
