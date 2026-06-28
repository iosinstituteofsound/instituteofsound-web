const STORAGE_KEY = 'ios-alert-sounds-enabled'
const MIN_REPEAT_MS = 350

let audioContext: AudioContext | null = null
let unlockListenerAttached = false
let lastPlayedAt = 0

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  )
}

export function isAlertSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export function setAlertSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
}

async function getAudioContext(): Promise<AudioContext | null> {
  if (!isAlertSoundEnabled()) return null

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

export function unlockAlertSounds() {
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
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

function playPop(ctx: AudioContext, startTime: number, volume: number) {
  const durationSec = 0.04
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
  filter.frequency.value = 980
  filter.Q.value = 0.85
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(startTime)
  source.stop(startTime + durationSec + 0.01)
}

async function playAlertSound(play: (ctx: AudioContext, startTime: number) => void) {
  if (!isAlertSoundEnabled()) return

  const now = Date.now()
  if (now - lastPlayedAt < MIN_REPEAT_MS) return

  const ctx = await getAudioContext()
  if (!ctx) return

  play(ctx, ctx.currentTime)
  lastPlayedAt = now
}

/** Facebook-style messenger pop for incoming DMs. */
export async function playMessageAlertSound() {
  await playAlertSound((ctx, t) => {
    playPop(ctx, t, 0.14)
    playTone(ctx, 880, t + 0.018, 0.07, 'sine', 0.08)
  })
}

/** Facebook-style bell chime for likes, comments, follows, etc. */
export async function playNotificationAlertSound() {
  await playAlertSound((ctx, t) => {
    playTone(ctx, 659.25, t, 0.11, 'sine', 0.09)
    playTone(ctx, 783.99, t + 0.09, 0.14, 'sine', 0.085)
  })
}

attachUnlockListener()
