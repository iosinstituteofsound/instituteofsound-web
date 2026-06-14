export type EarLabBand = 'low' | 'mid' | 'high'
export type EarLabMode = 'frequency' | 'level' | 'compression'

export const EAR_LAB_TOTAL_ROUNDS = 10
export const EAR_LAB_PASS_SCORE = 7

export const EAR_LAB_MODES: { id: EarLabMode; label: string; description: string }[] = [
  {
    id: 'frequency',
    label: 'EQ frequency game',
    description: 'EQ on/off · pick the boosted band on the spectrum · 5 stages, 3 lives.',
  },
  {
    id: 'level',
    label: 'Level / loudness',
    description: 'Two tones in a row — which was louder?',
  },
  {
    id: 'compression',
    label: 'Compression A/B',
    description: 'Two versions — which has more punch / less squash?',
  },
]

export const EAR_LAB_BANDS: { id: EarLabBand; label: string; hz: number }[] = [
  { id: 'low', label: 'Low', hz: 120 },
  { id: 'mid', label: 'Mid', hz: 1000 },
  { id: 'high', label: 'High', hz: 5200 },
]

export function pickRandomBand(): EarLabBand {
  const bands = EAR_LAB_BANDS
  return bands[Math.floor(Math.random() * bands.length)]!.id
}

export function getBandHz(band: EarLabBand): number {
  return EAR_LAB_BANDS.find((b) => b.id === band)!.hz
}

export function pickLevelRound(): { louderFirst: boolean; hz: number } {
  return {
    louderFirst: Math.random() > 0.5,
    hz: 880,
  }
}

export function pickCompressionRound(): { punchIsFirst: boolean; hz: number } {
  return {
    punchIsFirst: Math.random() > 0.5,
    hz: 440,
  }
}

function createCtx(): AudioContext {
  return new AudioContext()
}

export function playTone(hz: number, durationMs = 900, gainLevel = 0.14): void {
  const ctx = createCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = hz
  osc.connect(gain)
  gain.connect(ctx.destination)
  const t = ctx.currentTime
  gain.gain.setValueAtTime(gainLevel, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000)
  osc.start(t)
  osc.stop(t + durationMs / 1000 + 0.05)
  osc.onended = () => void ctx.close()
}

export function playToneCompressed(hz: number, durationMs = 900, inputGain = 0.35): void {
  const ctx = createCtx()
  const osc = ctx.createOscillator()
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -28
  comp.knee.value = 6
  comp.ratio.value = 14
  comp.attack.value = 0.002
  comp.release.value = 0.18
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = hz
  osc.connect(comp)
  comp.connect(gain)
  gain.connect(ctx.destination)
  const t = ctx.currentTime
  gain.gain.setValueAtTime(inputGain, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000)
  osc.start(t)
  osc.stop(t + durationMs / 1000 + 0.05)
  osc.onended = () => void ctx.close()
}

export function playLevelPair(hz: number, louderFirst: boolean): void {
  const quiet = 0.09
  const loud = 0.2
  playTone(hz, 750, louderFirst ? loud : quiet)
  window.setTimeout(() => playTone(hz, 750, louderFirst ? quiet : loud), 1100)
}

export function playCompressionPair(hz: number, punchIsFirst: boolean): void {
  if (punchIsFirst) {
    playTone(hz, 800, 0.16)
    window.setTimeout(() => playToneCompressed(hz, 800, 0.32), 1100)
  } else {
    playToneCompressed(hz, 800, 0.32)
    window.setTimeout(() => playTone(hz, 800, 0.16), 1100)
  }
}
