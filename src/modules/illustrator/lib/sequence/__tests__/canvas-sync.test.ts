import { describe, expect, it } from 'vitest'
import {
  blankLayerCanvasSnapshot,
  mergeCompositeIntoLayerSnapshots,
  snapshotLayerCanvas,
} from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'

function mockPaintLayer(id: string, name: string): PaintLayer {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  return { id, name, visible: true, locked: false, opacity: 1, canvas }
}

describe('canvas ↔ sequence sync', () => {
  it('QA-007: empty eval clears linked layers but keeps background entry', () => {
    const background = mockPaintLayer('bg', 'Background')
    const layer1 = mockPaintLayer('l1', 'Layer 1')

    const merged = mergeCompositeIntoLayerSnapshots(
      [background, layer1],
      [],
      new Set([layer1.id]),
    )

    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe('bg')
    expect(merged[1].id).toBe('l1')
    expect(merged[1].pixelCanvas.width).toBe(64)
  })

  it('QA-008: eval snapshot replaces linked layer entry', () => {
    const layer = mockPaintLayer('l1', 'Layer 1')
    const evaluated = snapshotLayerCanvas(layer)

    const merged = mergeCompositeIntoLayerSnapshots([layer], [evaluated], new Set([layer.id]))
    expect(merged[0].id).toBe(layer.id)
    expect(merged[0].pixelCanvas.width).toBe(64)
  })

  it('QA-009: blankLayerCanvasSnapshot preserves layer dimensions', () => {
    const layer = mockPaintLayer('l1', 'Layer 1')
    const blank = blankLayerCanvasSnapshot(layer)
    expect(blank.id).toBe(layer.id)
    expect(blank.pixelCanvas.width).toBe(layer.canvas.width)
    expect(blank.pixelCanvas.height).toBe(layer.canvas.height)
  })
})
