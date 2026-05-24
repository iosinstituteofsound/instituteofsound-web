export interface BpmResult {
  bpm: number
  confidence: number
  message: string
}

/** Energy-peak interval BPM estimate (approximate — best on drums/kick). */
export function detectBpmFromBuffer(buffer: AudioBuffer): BpmResult {
  const channel = buffer.getChannelData(0)
  const sampleRate = buffer.sampleRate
  const maxSamples = Math.min(channel.length, sampleRate * 90)

  const hopSize = Math.floor(sampleRate / 100)
  const frameSize = Math.floor(sampleRate / 10)
  const energies: number[] = []

  for (let i = 0; i + frameSize < maxSamples; i += hopSize) {
    let sum = 0
    for (let j = i; j < i + frameSize; j++) {
      const s = channel[j] ?? 0
      sum += s * s
    }
    energies.push(Math.sqrt(sum / frameSize))
  }

  if (energies.length < 20) {
    return { bpm: 120, confidence: 0.1, message: 'Audio too short for reliable BPM detection.' }
  }

  const avg = energies.reduce((a, b) => a + b, 0) / energies.length
  const threshold = avg * 1.35
  const peaks: number[] = []

  for (let i = 1; i < energies.length - 1; i++) {
    const e = energies[i]!
    if (e > threshold && e > energies[i - 1]! && e > energies[i + 1]!) {
      if (!peaks.length || i - peaks[peaks.length - 1]! > 3) {
        peaks.push(i)
      }
    }
  }

  if (peaks.length < 4) {
    return {
      bpm: 120,
      confidence: 0.15,
      message: 'Weak pulse detected — try tap tempo or a drum-forward section.',
    }
  }

  const hopSec = hopSize / sampleRate
  const bpms: number[] = []

  for (let i = 1; i < peaks.length; i++) {
    const intervalSec = (peaks[i]! - peaks[i - 1]!) * hopSec
    if (intervalSec <= 0) continue
    const bpm = 60 / intervalSec
    if (bpm >= 40 && bpm <= 220) bpms.push(bpm)
    if (bpm * 2 >= 60 && bpm * 2 <= 220) bpms.push(bpm * 2)
    if (bpm / 2 >= 60 && bpm / 2 <= 220) bpms.push(bpm / 2)
  }

  if (!bpms.length) {
    return { bpm: 120, confidence: 0.2, message: 'Could not resolve tempo — use tap tempo.' }
  }

  const buckets = new Map<number, number>()
  for (const b of bpms) {
    const key = Math.round(b)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  let bestBpm = 120
  let bestCount = 0
  for (const [bpm, count] of buckets) {
    if (count > bestCount) {
      bestCount = count
      bestBpm = bpm
    }
  }

  const confidence = Math.min(0.95, bestCount / Math.max(peaks.length * 0.35, 1))

  return {
    bpm: bestBpm,
    confidence,
    message:
      confidence >= 0.5
        ? 'Strong pulse detected — verify against tap tempo.'
        : 'Approximate tempo — confirm with tap tempo or metronome.',
  }
}
