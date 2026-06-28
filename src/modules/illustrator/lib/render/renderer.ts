import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { CameraTransform } from '@/modules/illustrator/lib/sequence/sequence.types'

export type RenderLayerOptions = {
  opacity?: number
  mirrorX?: boolean
  mirrorY?: boolean
}

export type FrameTarget = HTMLCanvasElement | OffscreenCanvas

export interface Renderer {
  beginFrame(size: { width: number; height: number }): void
  drawLayer(snapshot: LayerCanvasSnapshot, options: RenderLayerOptions): void
  applyCamera(transform: CameraTransform): void
  endFrame(): FrameTarget
  present(target: FrameTarget): void
}
