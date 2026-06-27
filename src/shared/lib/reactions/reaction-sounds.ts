import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'

const STORAGE_KEY = 'ios-feed-reaction-sounds-enabled'
const MIN_REPEAT_MS = 100

let audioContext: AudioContext | null = null
let unlockListenerAttached = false
let lastPlayedKind: ReactionKind | null = null
let lastPlayedAt = 0

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  )
}

export function isReactionSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export function setReactionSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
}

async function getAudioContext(): Promise<AudioContext | null> {
  if (!isReactionSoundEnabled()) return null

  const Ctx = getAudioContextClass()
  if (!Ctx) return null

  if (!audioContext) audioContext = new Ctx()

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
    } catch {
      return null
    }
  }

  return audioContext.state === 'running' ? audioContext : null
}

export function unlockReactionSounds() {
  attachUnlockListener()
  void getAudioContext()
}

function attachUnlockListener() {
  if (typeof window === 'undefined' || unlockListenerAttached) return
  unlockListenerAttached = true

  const unlock = () => {
    void getAudioContext()
  }

  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock, { passive: true })
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), startTime + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

function playPop(ctx: AudioContext, startTime: number, volume: number) {
  const durationSec = 0.045
  const bufferSize = Math.floor(ctx.sampleRate * durationSec)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = 1180
  filter.Q.value = 0.9
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(startTime)
  source.stop(startTime + durationSec + 0.01)
}

function playSweep(
  ctx: AudioContext,
  startFreq: number,
  endFreq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(startFreq, startTime)
  osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

const SOUND_PLAYERS: Record<ReactionKind, (ctx: AudioContext, t: number) => void> = {
  like: (ctx, t) => {
    playPop(ctx, t, 0.16)
    playTone(ctx, 1046, t + 0.01, 0.055, 'sine', 0.07)
  },
  love: (ctx, t) => {
    playTone(ctx, 523.25, t, 0.13, 'triangle', 0.11)
    playTone(ctx, 659.25, t + 0.055, 0.15, 'triangle', 0.095)
  },
  haha: (ctx, t) => {
    playTone(ctx, 554.37, t, 0.065, 'sine', 0.09)
    playTone(ctx, 659.25, t + 0.055, 0.065, 'sine', 0.085)
    playTone(ctx, 783.99, t + 0.11, 0.075, 'sine', 0.08)
  },
  wow: (ctx, t) => {
    playSweep(ctx, 360, 920, t, 0.17, 0.1)
  },
  sad: (ctx, t) => {
    playSweep(ctx, 440, 280, t, 0.22, 0.085)
  },
  angry: (ctx, t) => {
    playTone(ctx, 165, t, 0.08, 'square', 0.04)
    playTone(ctx, 110, t + 0.035, 0.09, 'sawtooth', 0.032)
  },
}

export async function playReactionSound(kind: ReactionKind) {
  if (!isReactionSoundEnabled()) return

  const now = Date.now()
  if (kind === lastPlayedKind && now - lastPlayedAt < MIN_REPEAT_MS) return

  const ctx = await getAudioContext()
  if (!ctx) return

  SOUND_PLAYERS[kind](ctx, ctx.currentTime)
  lastPlayedKind = kind
  lastPlayedAt = now
}

export function resetReactionSoundSession() {
  lastPlayedKind = null
  lastPlayedAt = 0
}

attachUnlockListener()
