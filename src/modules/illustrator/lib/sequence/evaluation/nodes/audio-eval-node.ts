import { BaseEvalNode, emptyComposite, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'

/** Audio pass-through stub — waveform/mix eval isolated from visual composite. */
export class AudioEvalNode extends BaseEvalNode {
  constructor() {
    super('eval:audio')
  }

  evaluate(_ctx: EvalContext): EvalOutput {
    return { composite: emptyComposite() }
  }
}
