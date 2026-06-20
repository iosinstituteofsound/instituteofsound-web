import type { PlayerTrack, QueueSource, RepeatMode } from '@/modules/player/types/player.types'

export type PlayerStateDto = {
  currentTrack: PlayerTrack | null
  queue: PlayerTrack[]
  queueIndex: number
  queueSource: QueueSource
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  isBarOpen: boolean
  updatedAt?: string
}

export type UpsertPlayerStateDto = Omit<PlayerStateDto, 'updatedAt'>
