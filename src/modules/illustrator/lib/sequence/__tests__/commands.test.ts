import { describe, expect, it } from 'vitest'
import { createHoldBlockCommand, createResizeHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction, undoTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

describe('sequence commands', () => {
  it('creates hold block in one transaction', () => {
    const state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    const tx: Transaction = {
      id: 'tx1',
      label: 'Create hold',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 1000,
          assetRefId: 'ref_draw_head',
        }),
      ],
    }
    const next = executeTransaction(state, tx, { now: new Date().toISOString() })
    expect(next.sequences[seqId].blocks).toHaveLength(1)
    expect(next.sequences[seqId].blocks[0].type).toBe('hold')
    const undone = undoTransaction(next, tx, { now: new Date().toISOString() })
    expect(undone.sequences[seqId].blocks).toHaveLength(0)
  })

  it('resize hold preserves assetRefId (UX contract)', () => {
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
          durationMs: 500,
          assetRefId: 'ref_draw_head',
        }),
      ],
    }
    const withBlock = executeTransaction(state, createTx, { now: new Date().toISOString() })
    const blockId = withBlock.sequences[seqId].blocks[0].id
    const assetRefId = withBlock.sequences[seqId].blocks[0].type === 'hold'
      ? withBlock.sequences[seqId].blocks[0].assetRefId
      : ''
    const resizeTx: Transaction = {
      id: 'tx_resize',
      label: 'Resize',
      commands: [createResizeHoldBlockCommand({ sequenceId: seqId, blockId, durationMs: 2000 })],
    }
    const resized = executeTransaction(withBlock, resizeTx, { now: new Date().toISOString() })
    const block = resized.sequences[seqId].blocks[0]
    expect(block.type).toBe('hold')
    if (block.type === 'hold') {
      expect(block.durationMs).toBe(2000)
      expect(block.assetRefId).toBe(assetRefId)
    }
  })
})
