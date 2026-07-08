import {
  normalizeWaveformSamples,
  VOICE_WAVEFORM_SOURCE_BARS,
} from '@/modules/messenger/utils/voice-waveform-utils'

export function extractWaveformPeaksFromAudioBuffer(
  audioBuffer: AudioBuffer,
  barCount = VOICE_WAVEFORM_SOURCE_BARS,
): number[] {
  const channel = audioBuffer.getChannelData(0)
  if (!channel.length) {
    return []
  }

  const blockSize = Math.max(1, Math.floor(channel.length / barCount))
  const peaks: number[] = []

  for (let i = 0; i < barCount; i += 1) {
    const start = i * blockSize
    const end = Math.min(channel.length, start + blockSize)
    let peak = 0
    for (let j = start; j < end; j += 1) {
      peak = Math.max(peak, Math.abs(channel[j] ?? 0))
    }
    peaks.push(peak)
  }

  return normalizeWaveformSamples(peaks)
}

export async function extractWaveformPeaksFromBlob(
  blob: Blob,
  barCount = VOICE_WAVEFORM_SOURCE_BARS,
): Promise<number[]> {
  const audioCtx = new AudioContext()

  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0))
    return extractWaveformPeaksFromAudioBuffer(audioBuffer, barCount)
  } finally {
    await audioCtx.close()
  }
}

export async function extractWaveformPeaksFromAudioUrl(
  audioUrl: string,
  barCount = VOICE_WAVEFORM_SOURCE_BARS,
): Promise<number[]> {
  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch audio for waveform')
  }

  const blob = await response.blob()
  return extractWaveformPeaksFromBlob(blob, barCount)
}
