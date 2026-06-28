import type { LayerComposite } from '@/modules/illustrator/lib/sequence/sequence.types'
import type { ExportFrame } from '@/modules/illustrator/lib/export/export.types'

function fillWhite(rgba: Uint8ClampedArray): void {
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = 255
    rgba[i + 1] = 255
    rgba[i + 2] = 255
    rgba[i + 3] = 255
  }
}

function blendLayer(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  source: HTMLCanvasElement,
  opacity: number,
): void {
  let ctx: CanvasRenderingContext2D | null = null
  try {
    ctx = source.getContext('2d')
  } catch {
    return
  }
  if (!ctx) return

  const sw = Math.min(source.width, width)
  const sh = Math.min(source.height, height)
  let image: ImageData
  try {
    image = ctx.getImageData(0, 0, sw, sh)
  } catch {
    return
  }

  const alphaScale = opacity / 100
  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const srcIdx = (y * sw + x) * 4
      const dstIdx = (y * width + x) * 4
      const srcA = (image.data[srcIdx + 3] ?? 0) / 255 * alphaScale
      if (srcA <= 0) continue
      const inv = 1 - srcA
      rgba[dstIdx] = Math.round((image.data[srcIdx] ?? 0) * srcA + rgba[dstIdx] * inv)
      rgba[dstIdx + 1] = Math.round((image.data[srcIdx + 1] ?? 0) * srcA + rgba[dstIdx + 1] * inv)
      rgba[dstIdx + 2] = Math.round((image.data[srcIdx + 2] ?? 0) * srcA + rgba[dstIdx + 2] * inv)
      rgba[dstIdx + 3] = 255
    }
  }
}

export function compositeToExportFrame(composite: LayerComposite, width: number, height: number): ExportFrame {
  const rgba = new Uint8ClampedArray(width * height * 4)
  fillWhite(rgba)

  for (const [, snapshot] of composite.layers) {
    if (!snapshot.visible) continue
    blendLayer(rgba, width, height, snapshot.pixelCanvas, snapshot.opacity)
  }

  return { width, height, rgba }
}

export function solidExportFrame(width: number, height: number, rgb: [number, number, number]): ExportFrame {
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = rgb[0]
    rgba[i + 1] = rgb[1]
    rgba[i + 2] = rgb[2]
    rgba[i + 3] = 255
  }
  return { width, height, rgba }
}
