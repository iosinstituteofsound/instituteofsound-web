import { decodeAudioFile } from '@/lib/tools/audio/decode'

export interface AudioFormatReport {
  fileName: string
  extension: string
  sampleRate: number
  channels: number
  channelLabel: string
  durationSec: number
  durationLabel: string
  bitDepth: number | null
  bitDepthNote: string
  decodedBitDepth: number
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function parseWavBitDepth(buffer: ArrayBuffer): number | null {
  const view = new DataView(buffer)
  if (buffer.byteLength < 44) return null
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
  if (riff !== 'RIFF') return null
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11))
  if (wave !== 'WAVE') return null
  return view.getUint16(34, true) || null
}

export async function analyzeAudioFormat(file: File): Promise<AudioFormatReport> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'unknown'
  const arrayBuffer = await file.arrayBuffer()
  const wavBits = ext === 'wav' || ext === 'wave' ? parseWavBitDepth(arrayBuffer) : null

  const buffer = await decodeAudioFile(file)
  const durationSec = buffer.duration
  const channels = buffer.numberOfChannels
  const channelLabel =
    channels === 1 ? 'Mono' : channels === 2 ? 'Stereo' : `${channels}-channel`

  let bitDepthNote: string
  let bitDepth: number | null = wavBits

  if (wavBits) {
    bitDepthNote = 'From WAV file header'
  } else if (ext === 'mp3' || ext === 'm4a' || ext === 'aac' || ext === 'ogg') {
    bitDepth = null
    bitDepthNote = 'Lossy format — export WAV/FLAC for exact bit depth'
  } else {
    bitDepthNote = 'Decoded in browser as 32-bit float'
  }

  return {
    fileName: file.name,
    extension: ext,
    sampleRate: buffer.sampleRate,
    channels,
    channelLabel,
    durationSec,
    durationLabel: formatDuration(durationSec),
    bitDepth,
    bitDepthNote,
    decodedBitDepth: 32,
  }
}

export function formatAudioFormatExport(r: AudioFormatReport): string {
  const rateOk = r.sampleRate === 44100 || r.sampleRate === 48000
  const depthLine = r.bitDepth != null ? `${r.bitDepth}-bit` : `Unknown (${r.bitDepthNote})`
  return [
    `File: ${r.fileName}`,
    `Format: .${r.extension}`,
    `Sample rate: ${r.sampleRate} Hz${rateOk ? '' : ' — non-standard for streaming'}`,
    `Channels: ${r.channelLabel}`,
    `Bit depth: ${depthLine}`,
    `Duration: ${r.durationLabel}`,
    `Browser decode: ${r.decodedBitDepth}-bit float`,
    '',
    r.bitDepthNote,
  ].join('\n')
}

export function audioFormatVerdict(r: AudioFormatReport): { label: string; tone: 'ok' | 'warn' | 'hot' } {
  if (r.sampleRate !== 44100 && r.sampleRate !== 48000) {
    return { label: 'Non-standard sample rate — consider 44.1 or 48 kHz for distribution.', tone: 'warn' }
  }
  if (r.bitDepth != null && r.bitDepth < 16) {
    return { label: 'Bit depth below 16-bit — may sound noisy on release.', tone: 'hot' }
  }
  if (r.channels > 2) {
    return { label: 'Multi-channel file — most platforms expect stereo.', tone: 'warn' }
  }
  return { label: 'Sample rate looks distribution-ready. Confirm bit depth in your DAW export.', tone: 'ok' }
}
