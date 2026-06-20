export interface PlayerTrack {
  id: string
  title: string
  artist?: string
  artworkUrl?: string
  audioUrl: string
  durationSec?: number
  sourceId?: string
  spotifyUrl?: string
  youtubeUrl?: string
  trackId?: string
  releaseId?: string
  artistProfileId?: string
}

export type RepeatMode = 'off' | 'all' | 'one'

export type QueueSource =
  | { kind: 'playlist'; id: string; slug: string; title: string; coverUrl?: string; isOwn?: boolean }
  | { kind: 'release'; id: string; slug?: string; title: string; coverUrl?: string }
  | { kind: 'feed' | 'manual'; title?: string }
  | null

export interface PlayTrackOptions {
  queue?: PlayerTrack[]
  queueIndex?: number
  autoplay?: boolean
  queueSource?: QueueSource
}

export interface PlayPlaylistOptions {
  shuffled?: boolean
  startIndex?: number
  autoplay?: boolean
}
