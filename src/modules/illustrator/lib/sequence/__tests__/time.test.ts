import { describe, expect, it } from 'vitest'
import { applyBehavior, blockLocalTime } from '@/modules/illustrator/lib/sequence/time/behavior'
import { applyModifierStack } from '@/modules/illustrator/lib/sequence/time/modifier-stack'
import { formatTimecode, msToFrameIndex, frameIndexToMs } from '@/modules/illustrator/lib/sequence/time/timecode'

describe('sequence time', () => {
  it('loops local time within duration', () => {
    expect(applyBehavior(2500, 1000, { kind: 'loop' })).toBe(500)
  })

  it('ping-pongs at boundaries', () => {
    expect(applyBehavior(1500, 1000, { kind: 'ping-pong' })).toBe(500)
  })

  it('computes block local time from global', () => {
    expect(blockLocalTime(1200, 1000)).toBe(200)
  })

  it('applies speed modifier', () => {
    const { timeMs } = applyModifierStack(100, 1000, [{ type: 'speed', rate: 2 }])
    expect(timeMs).toBe(200)
  })

  it('formats timecode at 24fps', () => {
    expect(formatTimecode(1000, 24)).toContain('00:00:01')
    expect(formatTimecode(1000, 24)).toContain('24fps')
  })

  it('converts ms and frames', () => {
    expect(msToFrameIndex(1000, 24)).toBe(24)
    expect(frameIndexToMs(24, 24)).toBe(1000)
  })
})
