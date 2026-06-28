import { describe, expect, it } from 'vitest'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import {
  collectAssetRefIds,
  createConvertHoldToSequenceCommand,
  createExpandSequenceToFramesCommand,
} from '@/modules/illustrator/lib/sequence/commands/conversion-commands'
import { executeTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

describe('conversion round-trip gate', () => {
  it('FT-025: convert then expand preserves assetRefId multiset', () => {
    const state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    const createTx: Transaction = {
      id: 'tx_create',
      label: 'Create',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 1500,
          assetRefId: 'ref_draw_head',
        }),
      ],
    }
    let current = executeTransaction(state, createTx, { now: new Date().toISOString() })
    const beforeRefs = collectAssetRefIds(current.sequences[seqId].blocks)
    const blockId = current.sequences[seqId].blocks[0].id

    current = executeTransaction(current, {
      id: 'tx_convert',
      label: 'Convert',
      commands: [createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId, fps: 24 })],
    }, { now: new Date().toISOString() })

    current = executeTransaction(current, {
      id: 'tx_expand',
      label: 'Expand',
      commands: [createExpandSequenceToFramesCommand({ sequenceId: seqId, blockId })],
    }, { now: new Date().toISOString() })

    const afterRefs = collectAssetRefIds(current.sequences[seqId].blocks)
    expect(afterRefs).toEqual(beforeRefs)
  })
})
