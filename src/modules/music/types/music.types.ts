export type TrackStatus = 'processing' | 'ready' | 'failed'

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
}

export interface AudioUploadJobDto {
  id: string
  status: string
  progress: number
  errorMessage?: string
  trackId?: string
  title?: string
  originalFilename: string
}

export interface ReleaseDetailDto {
  id: string
  slug?: string
  artistProfileId: string
  artistName?: string
  title: string
  coverUrl?: string
  releaseDate?: string
  type: 'single' | 'ep' | 'album'
  genre?: string
  status: 'draft' | 'published'
  streamUrl?: string
  playCount: number
  tracks: TrackDto[]
  isFeatured: boolean
}

export interface PlaylistTrackRefDto {
  trackId: string
  sortOrder: number
  title: string
  artistName: string
  durationSec?: number
  audioUrl?: string
  streamUrl?: string
}

export interface PlaylistDetailDto {
  id: string
  title: string
  slug: string
  coverUrl?: string
  description?: string
  visibility: 'public' | 'private'
  ownerType: 'editorial' | 'artist' | 'listener'
  tracks: PlaylistTrackRefDto[]
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
