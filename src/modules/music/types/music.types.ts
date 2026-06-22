export type TrackStatus = 'processing' | 'ready' | 'failed'

export type DuplicateCheckStatus = 'pending' | 'clear' | 'flagged'
export type DuplicateMatchConfidence = 'confirmed' | 'likely'

export interface DuplicateOriginalRef {
  trackId: string
  title: string
  artistName: string
  releaseId?: string
}

export interface TrackDuplicateInfo {
  isDuplicate: boolean
  matchScore?: number
  matchConfidence?: DuplicateMatchConfidence
  original?: DuplicateOriginalRef
}

export interface UploadDuplicateCheck {
  status: DuplicateCheckStatus
  matchScore?: number
  matchConfidence?: DuplicateMatchConfidence
  original?: DuplicateOriginalRef
}

export interface TrackDto {
  id: string
  artistProfileId: string
  releaseId?: string
  title: string
  trackNumber: number
  durationSec?: number
  audioUrl?: string
  status: TrackStatus
  playCount: number
  duplicateInfo?: TrackDuplicateInfo
  createdAt?: string
  updatedAt?: string
}

export interface AdminTrackDto extends TrackDto {
  artistName: string
  releaseTitle?: string
}

export interface AdminTrackListResult {
  tracks: AdminTrackDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AudioUploadJobDto {
  id: string
  status: string
  progress: number
  errorMessage?: string
  trackId?: string
  title?: string
  originalFilename: string
  duplicateCheck?: UploadDuplicateCheck
}

export interface ReleaseDetailDto {
  id: string
  slug?: string
  artistProfileId: string
  artistName?: string
  title: string
  coverUrl?: string
  releaseDate?: string
  releaseTimezone?: string
  type: 'single' | 'ep' | 'album'
  genre?: string
  status: 'draft' | 'published'
  streamUrl?: string
  playCount: number
  tracks: TrackDto[]
  isFeatured: boolean
  isLive: boolean
}

export interface PlaylistTrackRefDto {
  trackId: string
  sortOrder: number
  title: string
  artistName: string
  artistSlug?: string
  releaseId?: string
  releaseTitle?: string
  releaseSlug?: string
  coverUrl?: string
  durationSec?: number
  audioUrl?: string
  streamUrl?: string
  addedAt?: string
}

export interface PlaylistDetailDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  description?: string
  visibility: 'public' | 'private'
  ownerType: 'editorial' | 'artist' | 'listener'
  curatorName?: string
  artistProfileId?: string
  artistSlug?: string
  tracks: PlaylistTrackRefDto[]
  createdAt?: string
  updatedAt?: string
}

export interface PlaylistTrackSearchItemDto {
  trackId: string
  title: string
  artistName: string
  releaseId: string
  releaseTitle?: string
  durationSec?: number
}

export interface PlaylistTrackSearchResultDto {
  yourReleases: PlaylistTrackSearchItemDto[]
  otherReleases: PlaylistTrackSearchItemDto[]
  siteTracks: PlaylistTrackSearchItemDto[]
}

export interface ArtistPublicDto {
  profile: {
    id: string
    userId: string
    slug: string
    displayName: string
    bio?: string
    avatarUrl?: string
    coverUrl?: string
    genres: string[]
  }
  releases: ReleaseDetailDto[]
  playlists: PlaylistDetailDto[]
}
