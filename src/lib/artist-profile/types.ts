import type { ArtistThemePreset } from './branding'
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
  country?: string
  social: ArtistSocialLinks
  monthlyListenersDisplay: string
  artistPickTrackId?: string
  accentColor: string
  themePreset: ArtistThemePreset
  heroVideoUrl?: string
  socialLinkOrder: SocialLinkKey[]
  published: boolean
  createdAt: string
  updatedAt: string
}

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

export interface ArtistEditorialFeature {
  id: string
  type: 'review' | 'feature' | 'band_profile'
  title: string
  subject: string
  excerpt: string
  coverImageUrl?: string
  editorName: string
  publishedAt: string
}

export interface ArtistProfilePageData {
  profile: ArtistProfile
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  singles: ArtistAlbum[]
  videos: ArtistVideo[]
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
  country?: string
  social?: ArtistSocialLinks
  monthlyListenersDisplay?: string
  artistPickTrackId?: string | null
  accentColor?: string
  themePreset?: ArtistThemePreset
  heroVideoUrl?: string
  socialLinkOrder?: SocialLinkKey[]
  published?: boolean
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
