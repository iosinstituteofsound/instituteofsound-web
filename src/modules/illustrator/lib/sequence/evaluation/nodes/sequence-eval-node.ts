import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { BaseEvalNode, emptyComposite, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import { evaluateInnerSequenceLayer, mapBlockLocalTime } from '@/modules/illustrator/lib/sequence/evaluation/nested-sequence-eval'
import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { AnimationBlock, CompoundBlock, HoldBlock, ReferenceBlock, SequenceBlock } from '@/modules/illustrator/lib/sequence/sequence.types'
import { computeHoldEvalLocalTime } from '@/modules/illustrator/lib/sequence/time/hold-eval-time'

export { computeHoldEvalLocalTime } from '@/modules/illustrator/lib/sequence/time/hold-eval-time'

function findActiveBlock(blocks: AnimationBlock[], trackId: string, timeMs: number): AnimationBlock | null {
  return (
    blocks.find(
      (b) =>
        b.trackId === trackId &&
        timeMs >= b.startTimeMs &&
        timeMs < b.startTimeMs + b.durationMs &&
        !b.muted,
    ) ?? null
  )
}

export class SequenceEvalNode extends BaseEvalNode {
  private trackId: string
  private layerId: string
  private assetManager: AssetManager

  constructor(trackId: string, layerId: string, assetManager: AssetManager) {
    super(`eval:sequence:${trackId}`)
    this.trackId = trackId
    this.layerId = layerId
    this.assetManager = assetManager
  }

  evaluate(ctx: EvalContext): EvalOutput {
    const sequence = ctx.state.sequences[ctx.sequenceId]
    if (!sequence) return { composite: emptyComposite() }

    const block = findActiveBlock(sequence.blocks, this.trackId, ctx.timeMs)
    if (!block) return { composite: emptyComposite() }

    if (block.type === 'sequence' || block.type === 'compound') {
      const nested = block as SequenceBlock | CompoundBlock
      const inner = ctx.state.sequences[nested.innerSequenceId]
      if (!inner) return { composite: emptyComposite() }
      const innerTime = Math.max(0, Math.min(mapBlockLocalTime(ctx.timeMs, nested), inner.metadata.durationMs - 1))
      const composite = evaluateInnerSequenceLayer(inner, this.layerId, innerTime, ctx)
      return { composite }
    }

    if (block.type === 'reference') {
      const ref = block as ReferenceBlock
      const master = this.assetManager.getMasterByRefId(ref.masterAssetRefId)
      if (!master?.assetRefId) return { composite: emptyComposite() }
      const syntheticHold: HoldBlock = {
        ...ref,
        type: 'hold',
        assetRefId: master.assetRefId,
        modifiers: [...ref.modifiers, ...(ref.instanceModifiers ?? [])],
      }
      return resolveHoldLayerFromBlock(syntheticHold, this.trackId, this.layerId, ctx, this)
    }

    if (block.type !== 'hold') return { composite: emptyComposite() }

    return resolveHoldLayerFromBlock(block as HoldBlock, this.trackId, this.layerId, ctx, this)
  }
}

function resolveHoldLayerFromBlock(
  hold: HoldBlock,
  trackId: string,
  layerId: string,
  ctx: EvalContext,
  node: SequenceEvalNode,
): EvalOutput {
    const evalLocal = computeHoldEvalLocalTime(ctx.timeMs, hold)
    const cacheKey =
      hold.modifiers.length > 0
        ? ctx.cache.staticKey(trackId, `${hold.assetRefId}@${Math.round(evalLocal.timeMs)}`)
        : ctx.cache.staticKey(trackId, hold.assetRefId)
    const cached = ctx.cache.getStatic(cacheKey)
    if (cached && !node.isDirty()) {
      const layers = new Map<string, LayerCanvasSnapshot>()
      layers.set(layerId, cached)
      return { composite: { layers } }
    }

    const handle = ctx.assetManager.getHandleByRefId(hold.assetRefId)
    const payload = handle.resolve() as LayerCanvasSnapshot | null
    if (!payload) return { composite: emptyComposite() }

    ctx.cache.setStatic(cacheKey, payload)
    node.clearDirty()

    const layers = new Map<string, LayerCanvasSnapshot>()
    layers.set(layerId, payload)
    return { composite: { layers } }
}

export function createSequenceEvalNodes(
  assetManager: AssetManager,
  tracks: { id: string; layerId?: string }[],
): SequenceEvalNode[] {
  return tracks
    .filter((t) => t.layerId)
    .map((t) => new SequenceEvalNode(t.id, t.layerId!, assetManager))
}
