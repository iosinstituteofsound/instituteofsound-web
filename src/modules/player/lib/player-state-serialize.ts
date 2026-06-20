import type { PlayerStateDto, UpsertPlayerStateDto } from '@/modules/player/types/player-state.types'
import type { PlayerTrack, QueueSource } from '@/modules/player/types/player.types'

type SerializablePlayerSlice = {
  currentTrack: PlayerTrack | null
  queue: PlayerTrack[]
  queueIndex: number
  queueSource: QueueSource
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: UpsertPlayerStateDto['repeat']
  isBarOpen: boolean
}

export function serializePlayerState(state: SerializablePlayerSlice): UpsertPlayerStateDto {
  return {
    currentTrack: state.currentTrack,
    queue: state.queue,
    queueIndex: state.queueIndex,
    queueSource: state.queueSource,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    muted: state.muted,
    shuffle: state.shuffle,
    repeat: state.repeat,
    isBarOpen: state.isBarOpen,
  }
}

export function applyServerPlayerState(saved: PlayerStateDto) {
  return {
    currentTrack: saved.currentTrack,
    queue: saved.queue ?? [],
    displayQueue: saved.queue ?? [],
    queueIndex: saved.queueIndex ?? 0,
    queueSource: saved.queueSource ?? null,
    currentTime: saved.currentTime ?? 0,
    duration: saved.duration ?? saved.currentTrack?.durationSec ?? 0,
    volume: saved.volume ?? 0.85,
    muted: saved.muted ?? false,
    shuffle: saved.shuffle ?? false,
    repeat: saved.repeat ?? 'off',
    isBarOpen: false,
    isPlaying: false,
    isExpanded: false,
    mobileView: 'mini' as const,
    isQueueOpen: false,
    isPlaylistModalOpen: false,
    isShuffling: false,
    shuffleAnimationKey: 0,
    sessionReady: true,
  }
}

export const PLAYER_STATE_SYNC_FIELDS = [
  'currentTrack',
  'queue',
  'queueIndex',
  'queueSource',
  'currentTime',
  'duration',
  'volume',
  'muted',
  'shuffle',
  'repeat',
  'isBarOpen',
] as const
