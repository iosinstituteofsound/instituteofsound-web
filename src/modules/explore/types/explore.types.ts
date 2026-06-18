import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export type ExploreFilter = 'all' | 'top' | 'new' | 'vibe'

export type ArticleType = 'review' | 'single' | 'ep' | 'feature' | 'band_profile'

export interface ArticleDto {
  id: string
  title: string
  slug: string
  type?: ArticleType
  excerpt?: string
  bodyHtml: string
  puckData?: Record<string, unknown>
  coverUrl?: string
  galleryUrls?: string[]
  status: string
  isCoverStory: boolean
  publishedAt?: string
  updatedAt?: string
}

export interface ArtistProfileDto {
  id: string
  userId: string
  slug: string
  displayName: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  genres: string[]
  labelName?: string
}

export interface LabelProfileDto {
  id: string
  userId: string
  slug: string
  displayName: string
  bio?: string
  logoUrl?: string
  coverUrl?: string
  genres: string[]
}

export type ReleaseType = 'single' | 'ep' | 'album'
export type ReleaseFilter = 'all' | 'album' | 'ep' | 'single' | 'archive'
export type ReleasesPageFilter = 'all' | 'album' | 'epsingles' | 'hot' | 'new'

export interface ReleaseDto {
  id: string
  artistProfileId?: string
  title: string
  coverUrl?: string
  artistName?: string
  labelName?: string
  streamUrl?: string
  type?: ReleaseType
  genre?: string
  playCount?: number
  releaseDate?: string
  isFeatured?: boolean
}

export interface ReleaseGenreDto {
  slug: string
  label: string
  count: number
  coverUrl?: string
}

export interface ReleaseFilterOptionDto {
  id: string
  label: string
  count: number
}

export interface ReleasesCatalogDto {
  featured: ReleaseDto | null
  rail: ReleaseDto[]
  upcoming: ReleaseDto[]
  genres: ReleaseGenreDto[]
  stats: {
    total: number
    singles: number
    albums: number
    eps: number
  }
  filters: ReleaseFilterOptionDto[]
}

export interface ReleasesPageDto {
  items: ReleaseDto[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface DiscographyDto {
  artist: ArtistProfileDto | null
  latestRelease: ReleaseDto | null
  popular: ReleaseDto[]
  artistPick: ReleaseDto | null
  albumsAndEps: ReleaseDto[]
  singles: ReleaseDto[]
  musicVideos: MusicVideoDto[]
}

export interface MusicVideoDto {
  id: string
  artistProfileId: string
  title: string
  thumbnailUrl?: string
  videoUrl: string
  durationSec?: number
  viewCount?: number
  releaseDate?: string
}

export interface PlaylistTrack {
  title: string
  artistName: string
  durationSec?: number
  streamUrl?: string
}

export interface PlaylistDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  description?: string
  tracks: PlaylistTrack[]
}

export interface SceneHubDto {
  id: string
  city: string
  slug: string
  coverUrl?: string
  description?: string
  isPrimary: boolean
  sortOrder?: number
}

export interface EventDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  startsAt: string
  venue: string
  hubCity?: string
  description?: string
  ticketUrl?: string
}

export interface ListenerStatDto {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  dbScore: number
  totalPlays: number
  rank?: number
}

export interface ExplorePayload {
  editorial: { coverStory: ArticleDto | null; sidebar: ArticleDto[] }
  artists: ArtistProfileDto[]
  releases: ReleaseDto[]
  labels: LabelProfileDto[]
  playlists: { featured: PlaylistDto | null; items: PlaylistDto[] }
  sceneHubs: SceneHubDto[]
  events: EventDto[]
  listeners: {
    topListener: ListenerStatDto | null
    cards: ListenerStatDto[]
    totalListeners: number
    totalPlays: number
  }
  community: {
    topics: Array<{ id: string; label: string; count: number }>
    latestActivity: Array<{ id: string; title: string; authorName: string; createdAt: string }>
    topContributors: Array<{ id: string; name: string; avatarUrl?: string; score: number }>
  }
}

export interface TrackSubmissionDto {
  id: string
  projectName: string
  genre: string
  trackTitle: string
  description: string
  streamUrl: string
  coverUrl?: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  editorNotes?: string
  createdAt: string
}

export interface WirePickItem {
  feedItemId?: string
  articleId?: string
  releaseId?: string
  sortOrder: number
  label?: string
}

export interface WireCandidates {
  feedItems: FeedItemDto[]
  releases: Array<{ id: string; title: string; artistName?: string; coverUrl?: string }>
}
