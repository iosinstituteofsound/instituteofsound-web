import type { AssetRef } from '@/modules/illustrator/lib/assets/asset-ref'

export interface AssetHandle<T = unknown> {
  readonly id: string
  readonly version: string | null
  resolve(): T | Promise<T>
  isLoaded(): boolean
  preload(): Promise<void>
  release(): void
}

export class DrawingHandle implements AssetHandle<unknown> {
  readonly id: string
  readonly version: string | null
  private loaded = false
  private payload: unknown = null
  private loader: () => unknown | Promise<unknown>

  constructor(ref: AssetRef, loader: () => unknown | Promise<unknown>) {
    this.id = ref.id
    this.version = ref.versionPin ?? null
    this.loader = loader
  }

  isLoaded(): boolean {
    return this.loaded
  }

  resolve(): unknown | Promise<unknown> {
    if (this.loaded) return this.payload
    const result = this.loader()
    if (result instanceof Promise) {
      return result.then((v) => {
        this.payload = v
        this.loaded = true
        return v
      })
    }
    this.payload = result
    this.loaded = true
    return result
  }

  async preload(): Promise<void> {
    await this.resolve()
  }

  release(): void {
    this.loaded = false
    this.payload = null
  }
}
