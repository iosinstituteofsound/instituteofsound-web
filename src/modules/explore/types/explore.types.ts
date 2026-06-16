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
  status: string
  isCoverStory: boolean
  publishedAt?: string
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

export interface ReleaseDto {
  id: string
  title: string
  coverUrl?: string
  artistName?: string
  labelName?: string
  streamUrl?: string
  type?: ReleaseType
  releaseDate?: string
  isFeatured?: boolean
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
  isPrimary: boolean
}

export interface EventDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  startsAt: string
  venue: string
  hubCity?: string
}

export interface ListenerStatDto {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  dbScore: number
  totalPlays: number
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
