import type { BlockBehavior } from '@/modules/illustrator/lib/sequence/sequence.types'

/** Map raw local time within block duration according to playback behavior. */
export function applyBehavior(localTimeMs: number, durationMs: number, behavior: BlockBehavior): number {
  if (durationMs <= 0) return 0
  const d = durationMs

  switch (behavior.kind) {
    case 'one-shot':
      return Math.min(Math.max(localTimeMs, 0), d)
    case 'clamp':
      return Math.min(Math.max(localTimeMs, 0), d - 1)
    case 'loop': {
      if (localTimeMs < 0) return 0
      return localTimeMs % d
    }
    case 'ping-pong': {
      if (localTimeMs < 0) return 0
      const cycle = d * 2
      const t = localTimeMs % cycle
      return t <= d ? t : cycle - t
    }
    case 'bounce': {
      if (localTimeMs < 0) return 0
      const period = d * 2
      const t = localTimeMs % period
      return t < d ? t : period - t
    }
    default:
      return Math.min(Math.max(localTimeMs, 0), d)
  }
}

export function blockLocalTime(timeMs: number, startTimeMs: number): number {
  return timeMs - startTimeMs
}
