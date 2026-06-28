import { BaseEvalNode, emptyComposite, mergeComposites, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'

/** Merges track eval outputs with composite cache tier. */
export class CompositeEvalNode extends BaseEvalNode {
  private inputs: BaseEvalNode[] = []

  constructor() {
    super('eval:composite')
  }

  setInputs(nodes: BaseEvalNode[]): void {
    this.inputs = nodes
  }

  evaluate(ctx: EvalContext): EvalOutput {
    const cacheKey = ctx.cache.compositeKey(ctx.sequenceId, ctx.timeMs)
    if (!this.isDirty()) {
      const cached = ctx.cache.getComposite(cacheKey)
      if (cached) {
        return { composite: cached }
      }
    }

    let composite = emptyComposite()
    for (const node of this.inputs) {
      const out = node.evaluate(ctx)
      composite = mergeComposites(composite, out.composite)
    }
    ctx.cache.setComposite(cacheKey, composite)
    this.clearDirty()
    return { composite }
  }
}
