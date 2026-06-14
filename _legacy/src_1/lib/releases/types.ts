import type { ReleaseType } from '@/lib/releases/constants'

export interface ReleaseTrack {
  title: string
  spotifyUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
}

export interface ReleaseMilestone {
  id: string
  kind: 'teaser' | 'bts' | 'preview' | 'note'
  title: string
  body?: string
  sortOrder: number
  createdAt: string
}

export interface ArtistRelease {
  id: string
  profileId: string
  slug: string
  title: string
  subtitle?: string
  story?: string
  coverUrl?: string
  releaseType: ReleaseType
  liveAt: string
  status: 'draft' | 'scheduled' | 'live' | 'archived'
  spotifyUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  sceneCity?: string
  sceneGenreSlug?: string
  tracks: ReleaseTrack[]
  linkedCommunityPostId?: string
  spinPromoted: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicRelease extends ArtistRelease {
  isLive: boolean
  embedLocked: boolean
  secondsUntilLive: number
  artistSlug: string
  artistName: string
  artistAvatarUrl?: string
  editorialSlug?: string
  editorialTitle?: string
  milestones: ReleaseMilestone[]
}

export interface UpsertReleaseInput {
  title: string
  slug?: string
  subtitle?: string
  story?: string
  coverUrl?: string
  releaseType: ReleaseType
  liveAt: string
  spotifyUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  sceneCity?: string
  sceneGenreSlug?: string
  tracks?: ReleaseTrack[]
  status?: 'draft' | 'scheduled'
}
