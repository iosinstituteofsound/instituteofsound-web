import { BaseEvalNode, emptyComposite, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'

/** Constraints pass-through stub — IK, parenting, physics hooks land here. */
export class ConstraintsEvalNode extends BaseEvalNode {
  constructor() {
    super('eval:constraints')
  }

  evaluate(_ctx: EvalContext): EvalOutput {
    return { composite: emptyComposite() }
  }
}
