import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { CameraTransform } from '@/modules/illustrator/lib/sequence/sequence.types'
import type { FrameTarget, RenderLayerOptions, Renderer } from '@/modules/illustrator/lib/render/renderer'

export class Canvas2DRenderer implements Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private layers: LayerCanvasSnapshot[] = []
  private camera: CameraTransform | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas2DRenderer: 2d context unavailable')
    this.ctx = ctx
  }

  beginFrame(size: { width: number; height: number }): void {
    if (this.canvas.width !== size.width) this.canvas.width = size.width
    if (this.canvas.height !== size.height) this.canvas.height = size.height
    this.layers = []
    this.camera = null
  }

  drawLayer(snapshot: LayerCanvasSnapshot, _options: RenderLayerOptions): void {
    this.layers.push(snapshot)
  }

  applyCamera(transform: CameraTransform): void {
    this.camera = transform
  }

  endFrame(): FrameTarget {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.camera) {
      this.ctx.save()
      this.ctx.translate(this.camera.panX, this.camera.panY)
      this.ctx.rotate((this.camera.rotation * Math.PI) / 180)
      this.ctx.scale(this.camera.zoom, this.camera.zoom)
    }
    for (const layer of this.layers) {
      if (!layer.visible) continue
      this.ctx.save()
      this.ctx.globalAlpha = layer.opacity / 100
      this.ctx.drawImage(layer.pixelCanvas, 0, 0)
      this.ctx.restore()
    }
    if (this.camera) this.ctx.restore()
    return this.canvas
  }

  present(_target: FrameTarget): void {
    // Canvas is already on-screen; no-op for Phase 0
  }
}
