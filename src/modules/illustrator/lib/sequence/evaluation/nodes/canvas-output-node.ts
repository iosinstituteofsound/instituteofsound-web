import { BaseEvalNode, type EvalContext, type EvalOutput } from '@/modules/illustrator/lib/sequence/evaluation/eval-node'
import type { Renderer } from '@/modules/illustrator/lib/render/renderer'
import { CompositeEvalNode } from '@/modules/illustrator/lib/sequence/evaluation/nodes/composite-eval-node'

export class CanvasOutputNode extends BaseEvalNode {
  private compositeNode: CompositeEvalNode
  private renderer: Renderer

  constructor(compositeNode: CompositeEvalNode, renderer: Renderer) {
    super('eval:canvasOutput')
    this.compositeNode = compositeNode
    this.renderer = renderer
  }

  evaluate(ctx: EvalContext): EvalOutput {
    const { composite } = this.compositeNode.evaluate(ctx)
    this.renderer.beginFrame({ width: ctx.state.sequences[ctx.sequenceId]?.metadata.resolution.width ?? 2048, height: ctx.state.sequences[ctx.sequenceId]?.metadata.resolution.height ?? 2048 })
    for (const [, snapshot] of composite.layers) {
      this.renderer.drawLayer(snapshot, {})
    }
    if (composite.cameraTransform) {
      this.renderer.applyCamera(composite.cameraTransform)
    }
    const target = this.renderer.endFrame()
    this.renderer.present(target)
    this.clearDirty()
    return { composite }
  }
}
