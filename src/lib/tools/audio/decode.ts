export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const ctx = new AudioContext()
  const arrayBuffer = await file.arrayBuffer()
  try {
    return await ctx.decodeAudioData(arrayBuffer.slice(0))
  } finally {
    await ctx.close()
  }
}

export function formatDb(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)} dBFS`
}

export function formatBpm(value: number): string {
  return `${Math.round(value)} BPM`
}
