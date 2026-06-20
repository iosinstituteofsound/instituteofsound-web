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

export interface PlayTrackOptions {
  queue?: PlayerTrack[]
  queueIndex?: number
  autoplay?: boolean
}
