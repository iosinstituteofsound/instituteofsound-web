import type { LayerComposite } from '@/modules/illustrator/lib/sequence/sequence.types'

export type CompositeCacheStats = {
  compositeHits: number
  compositeMisses: number
  nodesEvaluatedOnLastPass: number
}

export function cloneLayerComposite(composite: LayerComposite): LayerComposite {
  return {
    layers: new Map(composite.layers),
    cameraTransform: composite.cameraTransform ? { ...composite.cameraTransform } : undefined,
  }
}

/** Full-frame composite tier — keyed by sequence + time bucket + graph version. */
export class CompositeCache {
  private entries = new Map<string, LayerComposite>()
  private graphVersion = 0
  private compositeHits = 0
  private compositeMisses = 0
  private lastNodesEvaluated = 0

  bumpGraphVersion(): void {
    this.graphVersion += 1
    this.entries.clear()
  }

  getGraphVersion(): number {
    return this.graphVersion
  }

  key(sequenceId: string, timeMs: number, bucketMs = 33): string {
    const bucket = Math.floor(timeMs / bucketMs)
    return `${sequenceId}|${bucket}|v${this.graphVersion}`
  }

  get(key: string): LayerComposite | undefined {
    const hit = this.entries.get(key)
    if (hit) {
      this.compositeHits += 1
      return hit
    }
    this.compositeMisses += 1
    return undefined
  }

  set(key: string, composite: LayerComposite): void {
    this.entries.set(key, cloneLayerComposite(composite))
  }

  invalidateAll(): void {
    this.entries.clear()
  }

  setLastNodesEvaluated(count: number): void {
    this.lastNodesEvaluated = count
  }

  getStats(): CompositeCacheStats {
    return {
      compositeHits: this.compositeHits,
      compositeMisses: this.compositeMisses,
      nodesEvaluatedOnLastPass: this.lastNodesEvaluated,
    }
  }

  resetStats(): void {
    this.compositeHits = 0
    this.compositeMisses = 0
    this.lastNodesEvaluated = 0
  }
}
