import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { emptyComposite, type EvalContext } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import type { ResolveCache } from '@/modules/illustrator/lib/sequence/evaluation/resolve-cache'
import type { AnimationBlock, CompoundBlock, HoldBlock, LayerComposite, ReferenceBlock, Sequence, SequenceBlock } from '@/modules/illustrator/lib/sequence/sequence.types'
import { applyBehavior, blockLocalTime } from '@/modules/illustrator/lib/sequence/time/behavior'
import { applyModifierStack } from '@/modules/illustrator/lib/sequence/time/modifier-stack'
import { computeHoldEvalLocalTime } from '@/modules/illustrator/lib/sequence/time/hold-eval-time'

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

function resolveHoldLayer(
  hold: HoldBlock,
  layerId: string,
  timeMs: number,
  ctx: EvalContext,
): LayerComposite {
  const evalLocal = computeHoldEvalLocalTime(timeMs, hold)
  const cacheKey =
    hold.modifiers.length > 0
      ? ctx.cache.staticKey(layerId, `${hold.assetRefId}@${Math.round(evalLocal.timeMs)}`)
      : ctx.cache.staticKey(layerId, hold.assetRefId)

  const cached = ctx.cache.getStatic(cacheKey)
  if (cached) {
    const layers = new Map<string, LayerCanvasSnapshot>()
    layers.set(layerId, cached)
    return { layers }
  }

  const handle = ctx.assetManager.getHandleByRefId(hold.assetRefId)
  const payload = handle.resolve() as LayerCanvasSnapshot | null
  if (!payload) return emptyComposite()

  ctx.cache.setStatic(cacheKey, payload)
  const layers = new Map<string, LayerCanvasSnapshot>()
  layers.set(layerId, payload)
  return { layers }
}

/** Evaluate inner sequence at local timeMs for a target layer. */
export function evaluateInnerSequenceLayer(
  inner: Sequence,
  layerId: string,
  timeMs: number,
  ctx: EvalContext,
): LayerComposite {
  const track = inner.tracks.find((t) => t.layerId === layerId)
  if (!track) return emptyComposite()

  const block = findActiveBlock(inner.blocks, track.id, timeMs)
  if (!block) return emptyComposite()

  if (block.type === 'hold') {
    return resolveHoldLayer(block, layerId, timeMs, ctx)
  }

  if (block.type === 'sequence' || block.type === 'compound') {
    const nested = block as SequenceBlock | CompoundBlock
    const nestedSeq = ctx.state.sequences[nested.innerSequenceId]
    if (!nestedSeq) return emptyComposite()
    const rawLocal = blockLocalTime(timeMs, block.startTimeMs)
    const afterBehavior = applyBehavior(rawLocal, block.durationMs, block.behavior)
    const { timeMs: nestedTime } = applyModifierStack(afterBehavior, block.durationMs, block.modifiers)
    return evaluateInnerSequenceLayer(nestedSeq, layerId, nestedTime, ctx)
  }

  if (block.type === 'reference') {
    const ref = block as ReferenceBlock
    const master = ctx.assetManager.getMasterByRefId(ref.masterAssetRefId)
    if (!master?.assetRefId) return emptyComposite()
    const syntheticHold: HoldBlock = {
      ...ref,
      type: 'hold',
      assetRefId: master.assetRefId,
      modifiers: [...ref.modifiers, ...(ref.instanceModifiers ?? [])],
    }
    return resolveHoldLayer(syntheticHold, layerId, timeMs, ctx)
  }

  return emptyComposite()
}

export function mapBlockLocalTime(globalTimeMs: number, block: AnimationBlock): number {
  const rawLocal = blockLocalTime(globalTimeMs, block.startTimeMs)
  const afterBehavior = applyBehavior(rawLocal, block.durationMs, block.behavior)
  return applyModifierStack(afterBehavior, block.durationMs, block.modifiers).timeMs
}

export type InnerEvalOptions = {
  sequence: Sequence
  layerId: string
  localTimeMs: number
  assetManager: AssetManager
  cache: ResolveCache
  allSequences: Record<string, Sequence>
}

export function evaluateInnerAtTime(options: InnerEvalOptions): LayerComposite {
  const ctx: EvalContext = {
    timeMs: options.localTimeMs,
    state: { sequences: options.allSequences } as EvalContext['state'],
    sequenceId: options.sequence.id,
    assetManager: options.assetManager,
    cache: options.cache,
  }
  return evaluateInnerSequenceLayer(options.sequence, options.layerId, options.localTimeMs, ctx)
}
