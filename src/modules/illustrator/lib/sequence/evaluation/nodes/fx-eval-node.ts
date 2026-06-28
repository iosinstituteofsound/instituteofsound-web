import { BaseEvalNode, emptyComposite, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'

/** FX pass-through stub — particles, shaders, etc. plug in via PluginRegistry Phase 5+. */
export class FXEvalNode extends BaseEvalNode {
  constructor() {
    super('eval:fx')
  }

  evaluate(_ctx: EvalContext): EvalOutput {
    return { composite: emptyComposite() }
  }
}
