import { BaseEvalNode, emptyComposite, mergeComposites, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'

/** Camera transform stub — Phase 2 pass-through; full eval in Phase 2+. */
export class CameraEvalNode extends BaseEvalNode {
  constructor() {
    super('eval:camera')
  }

  evaluate(ctx: EvalContext): EvalOutput {
    const composite = emptyComposite()
    if (ctx.state.sequences[ctx.sequenceId]?.tracks.some((t) => t.kind === 'camera')) {
      return {
        composite: {
          ...composite,
          cameraTransform: { panX: 0, panY: 0, zoom: 1, rotation: 0 },
        },
      }
    }
    return { composite }
  }
}

export function mergeWithCamera(base: EvalOutput, camera: EvalOutput): EvalOutput {
  return {
    composite: mergeComposites(base.composite, camera.composite),
  }
}
