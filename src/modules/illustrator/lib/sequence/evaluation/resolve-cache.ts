import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { LayerComposite } from '@/modules/illustrator/lib/sequence/sequence.types'
import {
  CompositeCache,
  type CompositeCacheStats,
} from '@/modules/illustrator/lib/sequence/evaluation/composite-cache'

type StaticKey = string
type AnimatedKey = string

export type { CompositeCacheStats }

export class ResolveCache {
  private staticLayer = new Map<StaticKey, LayerCanvasSnapshot>()
  private animatedLayer = new Map<AnimatedKey, LayerCanvasSnapshot>()
  readonly compositeCache = new CompositeCache()

  bumpGraphVersion(): void {
    this.compositeCache.bumpGraphVersion()
  }

  staticKey(trackId: string, assetRefId: string, versionPin?: string): StaticKey {
    return `${trackId}|${assetRefId}|${versionPin ?? 'head'}`
  }

  getStatic(key: StaticKey): LayerCanvasSnapshot | undefined {
    return this.staticLayer.get(key)
  }

  setStatic(key: StaticKey, snapshot: LayerCanvasSnapshot): void {
    this.staticLayer.set(key, snapshot)
  }

  invalidateStaticForAsset(assetRefId: string): void {
    for (const key of this.staticLayer.keys()) {
      if (key.includes(assetRefId)) this.staticLayer.delete(key)
    }
    this.compositeCache.invalidateAll()
  }

  getAnimated(key: AnimatedKey): LayerCanvasSnapshot | undefined {
    return this.animatedLayer.get(key)
  }

  setAnimated(key: AnimatedKey, snapshot: LayerCanvasSnapshot): void {
    this.animatedLayer.set(key, snapshot)
  }

  compositeKey(sequenceId: string, timeMs: number, bucketMs = 33): string {
    return this.compositeCache.key(sequenceId, timeMs, bucketMs)
  }

  getComposite(key: string): LayerComposite | undefined {
    return this.compositeCache.get(key)
  }

  setComposite(key: string, value: LayerComposite): void {
    this.compositeCache.set(key, value)
  }

  getCompositeStats(): CompositeCacheStats {
    return this.compositeCache.getStats()
  }

  resetCompositeStats(): void {
    this.compositeCache.resetStats()
  }
}
