import type { SyncedLyricLineDto, SyncedLyricsStatus } from '@/modules/music/types/lyrics-sync.types'

export interface PlayerTrack {
  id: string
  title: string
  artist?: string
  artworkUrl?: string
  audioUrl: string
  durationSec?: number
  lyrics?: string
  syncedLyrics?: SyncedLyricLineDto[]
  syncedLyricsStatus?: SyncedLyricsStatus
  sourceId?: string
  spotifyUrl?: string
  youtubeUrl?: string
  trackId?: string
  releaseId?: string
  artistProfileId?: string
  duplicateInfo?: {
    isDuplicate: boolean
    matchScore?: number
    original?: {
      trackId: string
      title: string
      artistName: string
      releaseId?: string
    }
  }
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
