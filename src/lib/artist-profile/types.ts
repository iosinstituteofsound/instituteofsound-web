import type { EditorialType } from '@/lib/auth/types'
import type { ArtistThemePreset } from './branding'
import type { HeroLayout } from './heroLayout'
import type { SocialLinkKey } from './socialOrder'

export interface ArtistSocialLinks {
  spotify?: string
  youtube?: string
  instagram?: string
  facebook?: string
  bandcamp?: string
  website?: string
}

export interface ArtistProfile {
  id: string
  userId: string
  slug: string
  displayName: string
  tagline?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  logoUrl?: string
  genres: string[]
  influenceTags: string[]
  country?: string
  artistManagerName?: string
  artistManagerHandle?: string
  social: ArtistSocialLinks
  monthlyListenersDisplay: string
  artistPickTrackId?: string
  accentColor: string
  themePreset: ArtistThemePreset
  heroVideoUrl?: string
  heroLayout: HeroLayout
  socialLinkOrder: SocialLinkKey[]
  pressKitUrl?: string
  pressKitLabel?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export const DEFAULT_PRESS_KIT_LABEL = 'Press kit (EPK)'

export interface ArtistAlbum {
  id: string
  profileId: string
  title: string
  coverUrl?: string
  releaseYear?: number
  releaseType: 'album' | 'single' | 'ep'
  sortOrder: number
  createdAt: string
}

export interface ArtistTrack {
  id: string
  profileId: string
  albumId?: string
  title: string
  streamUrl: string
  coverUrl?: string
  playCount: number
  sortOrder: number
  createdAt: string
}

export interface ArtistVideo {
  id: string
  profileId: string
  title: string
  videoUrl: string
  thumbnailUrl?: string
  sortOrder: number
  createdAt: string
}

export type LineupEntryType = 'member' | 'guest' | 'production'

export interface ArtistBioTimelineEntry {
  id: string
  profileId: string
  year: number
  title: string
  description?: string
  sortOrder: number
  createdAt: string
}

export interface ArtistLineupEntry {
  id: string
  profileId: string
  name: string
  role: string
  entryType: LineupEntryType
  sortOrder: number
  createdAt: string
}

export interface ArtistMerchItem {
  id: string
  profileId: string
  title: string
  productUrl: string
  imageUrl?: string
  priceDisplay?: string
  showPrice: boolean
  sortOrder: number
  createdAt: string
}

export interface ArtistEditorialFeature {
  id: string
  slug: string
  type: EditorialType
  title: string
  subject: string
  excerpt: string
  coverImageUrl?: string
  editorName: string
  editorUsername?: string
  publishedAt: string
}

export interface ArtistProfilePageData {
  profile: ArtistProfile
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  singles: ArtistAlbum[]
  videos: ArtistVideo[]
  merch: ArtistMerchItem[]
  lineup: ArtistLineupEntry[]
  bioTimeline: ArtistBioTimelineEntry[]
  editorial: ArtistEditorialFeature[]
  pickTrack?: ArtistTrack
}

export interface UpsertArtistProfileInput {
  displayName: string
  slug?: string
  tagline?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  logoUrl?: string
  genres?: string[]
  influenceTags?: string[]
  country?: string
  artistManagerName?: string
  artistManagerHandle?: string
  social?: ArtistSocialLinks
  monthlyListenersDisplay?: string
  artistPickTrackId?: string | null
  accentColor?: string
  themePreset?: ArtistThemePreset
  heroVideoUrl?: string
  heroLayout?: HeroLayout
  socialLinkOrder?: SocialLinkKey[]
  pressKitUrl?: string
  pressKitLabel?: string
  published?: boolean
}

export interface ManagedArtistSummary {
  profileId: string
  slug: string
  displayName: string
  tagline?: string
  avatarUrl?: string
}

export interface UpsertAlbumInput {
  title: string
  coverUrl?: string
  releaseYear?: number
  releaseType: 'album' | 'single' | 'ep'
}

export interface UpsertTrackInput {
  title: string
  streamUrl: string
  coverUrl?: string
  albumId?: string
  playCount?: number
}

export interface UpsertVideoInput {
  title: string
  videoUrl: string
  thumbnailUrl?: string
}

export interface UpsertBioTimelineInput {
  year: number
  title: string
  description?: string
}

export interface UpsertLineupInput {
  name: string
  role: string
  entryType?: LineupEntryType
}

export interface UpsertMerchInput {
  title: string
  productUrl: string
  imageUrl?: string
  priceDisplay?: string
  showPrice?: boolean
}
