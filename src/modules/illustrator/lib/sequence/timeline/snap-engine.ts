export type SnapPoint = {
  timeMs: number
  kind: 'playhead' | 'block-start' | 'block-end'
  blockId?: string
}

export type SnapResult = {
  snappedTimeMs: number
  snapPoint: SnapPoint | null
}

const DEFAULT_THRESHOLD_MS = 80

/** Find nearest snap target within threshold. */
export function snapTimeMs(
  timeMs: number,
  candidates: SnapPoint[],
  thresholdMs = DEFAULT_THRESHOLD_MS,
): SnapResult {
  let best: SnapPoint | null = null
  let bestDelta = thresholdMs + 1

  for (const point of candidates) {
    const delta = Math.abs(point.timeMs - timeMs)
    if (delta <= thresholdMs && delta < bestDelta) {
      best = point
      bestDelta = delta
    }
  }

  return {
    snappedTimeMs: best ? best.timeMs : timeMs,
    snapPoint: best,
  }
}

export function buildSnapCandidates(options: {
  playheadMs: number
  blocks: { id: string; startTimeMs: number; durationMs: number }[]
  excludeBlockId?: string
}): SnapPoint[] {
  const points: SnapPoint[] = [{ timeMs: options.playheadMs, kind: 'playhead' }]
  for (const block of options.blocks) {
    if (block.id === options.excludeBlockId) continue
    points.push({ timeMs: block.startTimeMs, kind: 'block-start', blockId: block.id })
    points.push({
      timeMs: block.startTimeMs + block.durationMs,
      kind: 'block-end',
      blockId: block.id,
    })
  }
  return points
}
