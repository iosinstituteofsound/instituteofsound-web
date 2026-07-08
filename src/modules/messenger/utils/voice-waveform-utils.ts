export const VOICE_WAVEFORM_BAR_COUNT = 36
export const VOICE_WAVEFORM_BAR_WIDTH = 2.5
export const VOICE_WAVEFORM_BAR_GAP = 1.5
export const VOICE_WAVEFORM_MIN_BARS = 12
export const VOICE_WAVEFORM_MAX_BARS = 48
export const VOICE_WAVEFORM_SOURCE_BARS = 96

export type VoicePlaybackSpeed = 1 | 1.25 | 1.5 | 1.75 | 2

export const VOICE_PLAYBACK_SPEEDS: VoicePlaybackSpeed[] = [1, 1.25, 1.5, 1.75, 2]

export function nextVoicePlaybackSpeed(current: VoicePlaybackSpeed): VoicePlaybackSpeed {
  const index = VOICE_PLAYBACK_SPEEDS.indexOf(current)
  const nextIndex = index < 0 ? 0 : (index + 1) % VOICE_PLAYBACK_SPEEDS.length
  return VOICE_PLAYBACK_SPEEDS[nextIndex] ?? 1
}

export function formatPlaybackSpeedLabel(speed: VoicePlaybackSpeed): string {
  if (speed === 1) return '1x'
  return `${speed}x`
}

export function formatVoiceTime(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:--'
  }

  const rounded = Math.floor(totalSeconds)
  const minutes = Math.floor(rounded / 60)
  const seconds = rounded % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function buildPseudoWaveform(seed: string, count = VOICE_WAVEFORM_BAR_COUNT): number[] {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  return Array.from({ length: count }, (_, index) => {
    const value = Math.sin((hash + index * 17) * 0.41) * 0.5 + 0.5
    const second = Math.cos((hash + index * 11) * 0.27) * 0.5 + 0.5
    return 0.2 + value * 0.55 + second * 0.25
  })
}

export function computeVisibleBarCount(
  trackWidth: number,
  barWidth = VOICE_WAVEFORM_BAR_WIDTH,
  gap = VOICE_WAVEFORM_BAR_GAP,
  minBars = VOICE_WAVEFORM_MIN_BARS,
  maxBars = VOICE_WAVEFORM_MAX_BARS,
): number {
  if (!Number.isFinite(trackWidth) || trackWidth <= 0) {
    return minBars
  }

  const count = Math.floor((trackWidth + gap) / (barWidth + gap))
  return Math.max(minBars, Math.min(maxBars, count))
}

export function resampleWaveformSamples(samples: number[], targetCount: number): number[] {
  if (targetCount <= 0) {
    return []
  }

  if (samples.length === 0) {
    return Array.from({ length: targetCount }, () => 0.22)
  }

  if (samples.length === targetCount) {
    return samples
  }

  const result: number[] = []
  for (let i = 0; i < targetCount; i += 1) {
    const start = Math.floor((i / targetCount) * samples.length)
    const end = Math.max(start + 1, Math.floor(((i + 1) / targetCount) * samples.length))
    let peak = 0
    for (let j = start; j < end; j += 1) {
      peak = Math.max(peak, samples[j] ?? 0)
    }
    result.push(peak)
  }

  return result
}

export function normalizeWaveformSamples(samples: number[]): number[] {
  if (samples.length === 0) {
    return samples
  }

  let max = 0
  for (const sample of samples) {
    if (sample > max) {
      max = sample
    }
  }

  const divisor = Math.max(max, 0.0001)
  return samples.map((sample) => 0.14 + (sample / divisor) * 0.72)
}
