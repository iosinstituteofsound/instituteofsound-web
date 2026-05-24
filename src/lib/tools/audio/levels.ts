export interface LevelAnalysis {
  peak: number
  peakDb: number
  rms: number
  rmsDb: number
  crestDb: number
  clipCount: number
  clipPercent: number
  sampleCount: number
  isClipping: boolean
  headroomDb: number
}

export function analyzeLevels(buffer: AudioBuffer): LevelAnalysis {
  const channels = buffer.numberOfChannels
  const len = buffer.length
  let peak = 0
  let sumSq = 0
  let clipCount = 0

  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < len; i++) {
      const s = data[i] ?? 0
      const abs = Math.abs(s)
      if (abs > peak) peak = abs
      sumSq += s * s
      if (abs >= 0.999) clipCount++
    }
  }

  const samples = len * channels
  const rms = Math.sqrt(sumSq / samples)
  const peakDb = 20 * Math.log10(Math.max(peak, 1e-10))
  const rmsDb = 20 * Math.log10(Math.max(rms, 1e-10))
  const crestDb = peakDb - rmsDb
  const clipPercent = (clipCount / samples) * 100

  return {
    peak,
    peakDb,
    rms,
    rmsDb,
    crestDb,
    clipCount,
    clipPercent,
    sampleCount: samples,
    isClipping: clipCount > 0,
    headroomDb: peakDb < 0 ? -peakDb : 0,
  }
}

export function loudnessVerdict(rmsDb: number): { label: string; tone: 'ok' | 'warn' | 'hot' } {
  if (rmsDb > -8) return { label: 'Very loud — likely over-compressed for streaming', tone: 'hot' }
  if (rmsDb > -14) return { label: 'Hot mix — check headroom before mastering', tone: 'warn' }
  if (rmsDb > -24) return { label: 'Healthy RMS range for mixing', tone: 'ok' }
  return { label: 'Quiet — may need gain staging or louder arrangement', tone: 'ok' }
}

export function clipVerdict(analysis: LevelAnalysis): { label: string; tone: 'ok' | 'warn' | 'hot' } {
  if (analysis.clipPercent > 0.01) {
    return { label: 'Digital clipping detected — reduce gain or limiter ceiling', tone: 'hot' }
  }
  if (analysis.peakDb > -0.1) {
    return { label: 'Peaks at 0 dBFS — clipping risk on export', tone: 'warn' }
  }
  if (analysis.peakDb > -3) {
    return { label: 'Limited headroom — consider lowering master bus', tone: 'warn' }
  }
  return { label: 'No clipping detected — clean peaks', tone: 'ok' }
}
