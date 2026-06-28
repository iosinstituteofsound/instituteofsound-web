import { describe, expect, it } from 'vitest'
import { elementBounds, hitTestElement } from '@/modules/illustrator/components/studio/studio-canvas-model'

describe('studio canvas model', () => {
  it('CT-010: hitTestElement detects sticker at point', () => {
    const el = hitTestElement(
      { id: 's1', kind: 'sticker', x: 50, y: 50, size: 40, emoji: '✨' },
      { x: 60, y: 60 },
    )
    expect(el).toBe(true)
  })

  it('CT-011: hitTestElement misses sticker outside bounds', () => {
    const el = hitTestElement(
      { id: 's1', kind: 'sticker', x: 50, y: 50, size: 40, emoji: '✨' },
      { x: 5, y: 5 },
    )
    expect(el).toBe(false)
  })

  it('CT-012: elementBounds for shape returns box', () => {
    const bounds = elementBounds({
      id: 'sh1',
      kind: 'shape',
      shape: 'rect',
      x: 10,
      y: 20,
      w: 100,
      h: 50,
      color: '#fff',
      strokeWidth: 2,
      filled: true,
    })
    expect(bounds).toEqual({ x: 10, y: 20, w: 100, h: 50 })
  })

  it('CT-013: elementBounds for text uses approximate width', () => {
    const bounds = elementBounds({
      id: 't1',
      kind: 'text',
      x: 0,
      y: 0,
      text: 'Hello',
      color: '#000',
      fontSize: 24,
    })
    expect(bounds?.w).toBeGreaterThan(0)
    expect(bounds?.h).toBeCloseTo(24 * 1.2)
  })
})
