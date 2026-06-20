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

function finiteNonNegative(value: number, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, value) : fallback
}

function sanitizeTrack(track: PlayerTrack | null | undefined): UpsertPlayerStateDto['currentTrack'] {
  if (!track?.id || !track.title?.trim() || !track.audioUrl?.trim()) return null
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
    audioUrl: track.audioUrl,
    durationSec: track.durationSec != null ? finiteNonNegative(track.durationSec) : undefined,
    trackId: track.trackId,
    releaseId: track.releaseId,
    artistProfileId: track.artistProfileId,
    sourceId: track.sourceId,
  }
}

function sanitizeQueueSource(source: QueueSource): QueueSource {
  if (!source) return null
  if (source.kind === 'playlist') {
    return {
      ...source,
      slug: source.slug?.trim() || source.id,
      title: source.title?.trim() || 'Playlist',
    }
  }
  if (source.kind === 'release') {
    return {
      ...source,
      title: source.title?.trim() || 'Release',
    }
  }
  return source
}

export function serializePlayerState(state: SerializablePlayerSlice): UpsertPlayerStateDto {
  const queue = state.queue
    .map((track) => sanitizeTrack(track))
    .filter((track): track is NonNullable<typeof track> => Boolean(track))

  const currentTrack = sanitizeTrack(state.currentTrack)
  const queueIndex = Math.min(
    Math.max(0, state.queueIndex ?? 0),
    Math.max(0, queue.length - 1),
  )

  return {
    currentTrack,
    queue,
    queueIndex,
    queueSource: sanitizeQueueSource(state.queueSource),
    currentTime: finiteNonNegative(state.currentTime),
    duration: finiteNonNegative(state.duration),
    volume: Math.min(1, Math.max(0, finiteNonNegative(state.volume, 0.85))),
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
