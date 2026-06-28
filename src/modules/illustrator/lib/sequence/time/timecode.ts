/** Format time for dual display: 00:01:12.4 (28f @ 24fps) */

export function formatTimecode(timeMs: number, fps: number): string {
  const totalSeconds = timeMs / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const frac = Math.floor((timeMs % 1000) / 100)
  const frame = Math.floor((timeMs / 1000) * fps)
  const pad = (v: number, len = 2) => String(v).padStart(len, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${frac} (${frame}f @ ${fps}fps)`
}

export function msToFrameIndex(timeMs: number, fps: number): number {
  return Math.floor((timeMs / 1000) * fps)
}

export function frameIndexToMs(frame: number, fps: number): number {
  return (frame / fps) * 1000
}
