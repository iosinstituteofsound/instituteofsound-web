import { renderScene } from '@/modules/illustrator/components/studio/studio-canvas-render'
import type { CanvasElement } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'

export function createStudioPreviewDataUrl(
  layers: PaintLayer[],
  activeLayerId: string | null,
  elements: CanvasElement[] = [],
  maxEdge = 360,
): string | undefined {
  if (!layers.length) return undefined

  const sourceW = layers[0]?.canvas.width ?? 0
  const sourceH = layers[0]?.canvas.height ?? 0
  if (!sourceW || !sourceH) return undefined

  const scale = maxEdge / Math.max(sourceW, sourceH)
  const width = Math.max(1, Math.round(sourceW * scale))
  const height = Math.max(1, Math.round(sourceH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  ctx.save()
  ctx.scale(scale, scale)
  renderScene(ctx, layers, elements, null, null, [], activeLayerId)
  ctx.restore()

  try {
    return canvas.toDataURL('image/jpeg', 0.88)
  } catch {
    return undefined
  }
}
