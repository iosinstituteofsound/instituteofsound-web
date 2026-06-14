export interface SpectrumBand {
  label: string
  minHz: number
  maxHz: number
  energy: number
}

const BAND_DEFS: { label: string; minHz: number; maxHz: number }[] = [
  { label: 'Sub', minHz: 20, maxHz: 60 },
  { label: 'Bass', minHz: 60, maxHz: 200 },
  { label: 'Low mid', minHz: 200, maxHz: 500 },
  { label: 'Mid', minHz: 500, maxHz: 2000 },
  { label: 'Upper mid', minHz: 2000, maxHz: 6000 },
  { label: 'Air', minHz: 6000, maxHz: 16000 },
]

function magnitudeAtBin(data: Float32Array, bin: number, fftSize: number): number {
  let re = 0
  let im = 0
  const k = bin
  for (let n = 0; n < fftSize; n++) {
    const angle = (2 * Math.PI * k * n) / fftSize
    re += (data[n] ?? 0) * Math.cos(angle)
    im -= (data[n] ?? 0) * Math.sin(angle)
  }
  return Math.sqrt(re * re + im * im) / fftSize
}

export function computeSpectrumBands(buffer: AudioBuffer, maxFrames = 48): SpectrumBand[] {
  const fftSize = 2048
  const data = buffer.getChannelData(0)
  const sampleRate = buffer.sampleRate
  const binHz = sampleRate / fftSize
  const accum = BAND_DEFS.map(() => 0)
  let frames = 0

  for (let offset = 0; offset + fftSize < data.length && frames < maxFrames; offset += fftSize) {
    const slice = data.subarray(offset, offset + fftSize)
    for (let b = 0; b < BAND_DEFS.length; b++) {
      const band = BAND_DEFS[b]!
      const startBin = Math.floor(band.minHz / binHz)
      const endBin = Math.min(Math.ceil(band.maxHz / binHz), fftSize / 2)
      let sum = 0
      let count = 0
      for (let bin = startBin; bin <= endBin; bin++) {
        sum += magnitudeAtBin(slice, bin, fftSize)
        count++
      }
      accum[b]! += count ? sum / count : 0
    }
    frames++
  }

  const max = Math.max(...accum, 1e-6)
  return BAND_DEFS.map((band, i) => ({
    ...band,
    energy: accum[i]! / Math.max(frames, 1) / max,
  }))
}

export function hzToNoteHint(hz: number): string {
  if (hz < 20) return '—'
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const midi = Math.round(12 * Math.log2(hz / 440) + 69)
  const name = noteNames[((midi % 12) + 12) % 12]!
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

export function dominantBandLabel(bands: SpectrumBand[]): string {
  const top = [...bands].sort((a, b) => b.energy - a.energy)[0]
  return top?.label ?? '—'
}
