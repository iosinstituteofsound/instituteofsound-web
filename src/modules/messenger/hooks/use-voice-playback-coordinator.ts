import {
  nextVoicePlaybackSpeed,
  type VoicePlaybackSpeed,
} from '@/modules/messenger/utils/voice-waveform-utils'
import { extractWaveformPeaksFromAudioUrl } from '@/modules/messenger/utils/voice-waveform-analyzer'
import { prepareVoicePlayerForPlayback } from '@/modules/messenger/utils/voice-player-utils'

type ActiveVoicePlayback = {
  id: string
  pause: () => void
}

type VoicePlayerSnapshot = {
  playing: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
}

let sharedPlayer: HTMLAudioElement | null = null
let activePlayback: ActiveVoicePlayback | null = null
let activeMessageId: string | null = null
let globalPlaybackSpeed: VoicePlaybackSpeed = 1
const durationByMessageId = new Map<string, number>()
const waveformByKey = new Map<string, number[]>()
const waveformInflight = new Map<string, Promise<number[]>>()
const listeners = new Set<() => void>()

const INITIAL_PLAYER_SNAPSHOT: VoicePlayerSnapshot = {
  playing: false,
  currentTime: 0,
  duration: 0,
  isLoaded: false,
}

let playerSnapshot: VoicePlayerSnapshot = INITIAL_PLAYER_SNAPSHOT

function syncPlayerSnapshot(): void {
  if (!sharedPlayer) return

  playerSnapshot = {
    playing: !sharedPlayer.paused && !sharedPlayer.ended,
    currentTime: sharedPlayer.currentTime,
    duration: Number.isFinite(sharedPlayer.duration) ? sharedPlayer.duration : 0,
    isLoaded: sharedPlayer.readyState >= HTMLMediaElement.HAVE_METADATA,
  }
}

function emit(): void {
  syncPlayerSnapshot()
  listeners.forEach((listener) => listener())
}

export function getVoicePlayerSnapshot(): VoicePlayerSnapshot {
  return playerSnapshot
}

function ensureSharedPlayer(): HTMLAudioElement {
  if (!sharedPlayer) {
    sharedPlayer = new Audio()
    sharedPlayer.preload = 'metadata'
    prepareVoicePlayerForPlayback(sharedPlayer)
    sharedPlayer.addEventListener('timeupdate', emit)
    sharedPlayer.addEventListener('play', emit)
    sharedPlayer.addEventListener('pause', emit)
    sharedPlayer.addEventListener('ended', emit)
    sharedPlayer.addEventListener('loadedmetadata', emit)
  }
  return sharedPlayer
}

export function getSharedVoicePlayer(): HTMLAudioElement {
  return ensureSharedPlayer()
}

export function subscribeVoicePlayback(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getActiveVoiceMessageId(): string | null {
  return activeMessageId
}

export function getVoicePlaybackSpeed(): VoicePlaybackSpeed {
  return globalPlaybackSpeed
}

export function cycleVoicePlaybackSpeed(): VoicePlaybackSpeed {
  const next = nextVoicePlaybackSpeed(globalPlaybackSpeed)
  globalPlaybackSpeed = next
  emit()
  return next
}

export function setActiveVoiceMessageId(id: string | null): void {
  activeMessageId = id
  emit()
}

export function cacheVoiceDuration(messageId: string, durationSec: number): void {
  if (!messageId || !Number.isFinite(durationSec) || durationSec <= 0) return
  if (durationByMessageId.get(messageId) === durationSec) return
  durationByMessageId.set(messageId, durationSec)
  emit()
}

export function getCachedVoiceDuration(messageId: string): number | null {
  return durationByMessageId.get(messageId) ?? null
}

export function getCachedVoiceWaveform(key: string): number[] | null {
  return waveformByKey.get(key) ?? null
}

export function cacheVoiceWaveform(key: string, samples: number[]): void {
  if (!key || samples.length === 0) return
  waveformByKey.set(key, samples)
  emit()
}

export function loadVoiceWaveform(key: string, url: string): Promise<number[]> {
  const cached = waveformByKey.get(key)
  if (cached) {
    return Promise.resolve(cached)
  }

  const pending = waveformInflight.get(key)
  if (pending) {
    return pending
  }

  const promise = extractWaveformPeaksFromAudioUrl(url)
    .then((samples) => {
      if (samples.length > 0) {
        waveformByKey.set(key, samples)
        waveformByKey.set(url, samples)
        emit()
      }
      waveformInflight.delete(key)
      return samples
    })
    .catch(() => {
      waveformInflight.delete(key)
      return [] as number[]
    })

  waveformInflight.set(key, promise)
  return promise
}

export function registerVoicePlayback(id: string, player: HTMLAudioElement): void {
  if (activePlayback && activePlayback.id !== id) {
    activePlayback.pause()
  }

  activeMessageId = id
  activePlayback = {
    id,
    pause: () => {
      try {
        player.pause()
        player.loop = false
      } catch {
        // noop
      }
    },
  }
  emit()
}

export function clearVoicePlayback(id: string): void {
  if (activePlayback?.id === id) {
    activePlayback = null
  }
  if (activeMessageId === id) {
    activeMessageId = null
    emit()
  }
}

export function pauseActiveVoicePlayback(): void {
  activePlayback?.pause()
  activePlayback = null
  activeMessageId = null
  emit()
}
