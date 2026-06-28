import { describe, expect, it } from 'vitest'
import { pressureFromEvent, stabilizePoint } from '@/modules/illustrator/components/studio/studio-brush-engine'

describe('studio brush engine', () => {
  it('CT-001: pressureFromEvent uses pointer pressure when present', () => {
    expect(pressureFromEvent({ pressure: 0.75 } as PointerEvent)).toBe(0.75)
  })

  it('CT-002: pressureFromEvent defaults to 0.5 for mouse', () => {
    expect(pressureFromEvent({ pressure: 0 } as PointerEvent)).toBe(0.5)
    expect(pressureFromEvent({ pressure: 1 } as PointerEvent)).toBe(0.5)
  })

  it('CT-003: stabilizePoint returns next when no previous point', () => {
    expect(stabilizePoint(null, { x: 10, y: 20 }, 0.5)).toEqual({ x: 10, y: 20 })
  })

  it('CT-004: stabilizePoint pulls toward previous based on streamline', () => {
    const result = stabilizePoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.5)
    expect(result.x).toBeGreaterThan(0)
    expect(result.x).toBeLessThan(100)
  })

  it('CT-005: high streamline heavily stabilizes stroke', () => {
    const result = stabilizePoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.95)
    expect(result.x).toBeLessThan(20)
  })
})
