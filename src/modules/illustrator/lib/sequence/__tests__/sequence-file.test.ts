import { describe, expect, it } from 'vitest'
import { parseSequenceFile, sequenceFileToJson, serializeSequenceState } from '@/modules/illustrator/lib/sequence/sequence-file'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

describe('sequence file', () => {
  it('round-trips embedded format', () => {
    const state = createInitialSequenceState()
    const file = serializeSequenceState(state, 'embedded')
    const json = sequenceFileToJson(file)
    const parsed = parseSequenceFile(json)
    expect(parsed.format).toBe('embedded')
    expect(parsed.manifest.rootSequenceId).toBe(state.activeSequenceId)
    expect(Object.keys(parsed.manifest.sequences)).toContain(state.activeSequenceId)
  })
})
