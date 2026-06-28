import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { ResolveCache } from '@/modules/illustrator/lib/sequence/evaluation/resolve-cache'
import type { CompositeResult, LayerComposite, SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type EvalContext = {
  timeMs: number
  state: Readonly<SequenceState>
  sequenceId: string
  assetManager: AssetManager
  cache: ResolveCache
}

export type EvalOutput = {
  composite: LayerComposite
}

export interface EvalNode {
  readonly id: string
  evaluate(ctx: EvalContext): EvalOutput
  markDirty(): void
  clearDirty(): void
  isDirty(): boolean
}

export abstract class BaseEvalNode implements EvalNode {
  readonly id: string
  private dirty = true

  constructor(id: string) {
    this.id = id
  }

  abstract evaluate(ctx: EvalContext): EvalOutput

  markDirty(): void {
    this.dirty = true
  }

  clearDirty(): void {
    this.dirty = false
  }

  isDirty(): boolean {
    return this.dirty
  }
}

export type EvalNodeFactory = (ctx: { assetManager: AssetManager }) => EvalNode[]

export function mergeComposites(base: LayerComposite, overlay: LayerComposite): LayerComposite {
  const layers = new Map(base.layers)
  for (const [id, snap] of overlay.layers) {
    layers.set(id, snap)
  }
  return {
    layers,
    cameraTransform: overlay.cameraTransform ?? base.cameraTransform,
  }
}

export function emptyComposite(): LayerComposite {
  return { layers: new Map() }
}

export type { CompositeResult }
