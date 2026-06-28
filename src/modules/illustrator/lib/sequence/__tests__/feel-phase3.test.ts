import { describe, expect, it } from 'vitest'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import {
  collectAssetRefIds,
  createConvertHoldToSequenceCommand,
  createExpandSequenceToFramesCommand,
} from '@/modules/illustrator/lib/sequence/commands/conversion-commands'
import {
  createPopEditPathCommand,
  createPushEditPathCommand,
} from '@/modules/illustrator/lib/sequence/commands/navigation-commands'
import { executeTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

describe('sequence phase 3 feel tests', () => {
  it('FT-020: convert hold to sequence creates sequence block with inner frames', () => {
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
          durationMs: 2000,
          assetRefId: 'ref_draw',
        }),
      ],
    }
    let current = executeTransaction(state, createTx, { now: new Date().toISOString() })
    const blockId = current.sequences[seqId].blocks[0].id

    const convertTx: Transaction = {
      id: 'tx_convert',
      label: 'Convert',
      commands: [createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId, fps: 24 })],
    }
    current = executeTransaction(current, convertTx, { now: new Date().toISOString() })
    const converted = current.sequences[seqId].blocks[0]
    expect(converted.type).toBe('sequence')
    if (converted.type === 'sequence') {
      const inner = current.sequences[converted.innerSequenceId]
      expect(inner?.blocks.length).toBeGreaterThan(0)
      expect(inner?.blocks.every((b) => b.type === 'hold')).toBe(true)
    }
  })

  it('FT-021: expand sequence restores hold blocks with same asset refs', () => {
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
          durationMs: 1000,
          assetRefId: 'ref_draw',
        }),
      ],
    }
    let current = executeTransaction(state, createTx, { now: new Date().toISOString() })
    const blockId = current.sequences[seqId].blocks[0].id
    const convertTx: Transaction = {
      id: 'tx_convert',
      label: 'Convert',
      commands: [createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId, fps: 24 })],
    }
    current = executeTransaction(current, convertTx, { now: new Date().toISOString() })
    const innerRefs =
      current.sequences[seqId].blocks[0].type === 'sequence'
        ? collectAssetRefIds(current.sequences[current.sequences[seqId].blocks[0].innerSequenceId].blocks)
        : []

    const expandTx: Transaction = {
      id: 'tx_expand',
      label: 'Expand',
      commands: [createExpandSequenceToFramesCommand({ sequenceId: seqId, blockId })],
    }
    current = executeTransaction(current, expandTx, { now: new Date().toISOString() })
    const expandedRefs = collectAssetRefIds(current.sequences[seqId].blocks)
    expect(expandedRefs).toEqual(innerRefs)
  })

  it('FT-022: push edit path switches active sequence', () => {
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
          durationMs: 1000,
          assetRefId: 'ref_draw',
        }),
      ],
    }
    let current = executeTransaction(state, createTx, { now: new Date().toISOString() })
    const blockId = current.sequences[seqId].blocks[0].id
    current = executeTransaction(current, {
      id: 'tx_convert',
      label: 'Convert',
      commands: [createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId, fps: 24 })],
    }, { now: new Date().toISOString() })
    const seqBlock = current.sequences[seqId].blocks[0]
    if (seqBlock.type !== 'sequence') throw new Error('expected sequence block')

    const openTx: Transaction = {
      id: 'tx_open',
      label: 'Open',
      commands: [createPushEditPathCommand({ sequenceId: seqBlock.innerSequenceId, blockId })],
    }
    current = executeTransaction(current, openTx, { now: new Date().toISOString() })
    expect(current.activeSequenceId).toBe(seqBlock.innerSequenceId)
    expect(current.editPath).toHaveLength(2)
  })

  it('FT-020b: convert works when hold trackId is orphaned', () => {
    const state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const orphanTrackId = state.sequences[seqId].tracks[0].id
    const linkedTrackId = 'track_layer_1'
    state.sequences[seqId].tracks = [
      {
        id: linkedTrackId,
        label: 'Layer 1',
        kind: 'character',
        layerId: 'layer_1',
        sortIndex: 0,
      },
    ]
    state.sequences[seqId].blocks = [
      {
        id: 'block_001',
        type: 'hold',
        trackId: orphanTrackId,
        startTimeMs: 0,
        durationMs: 1000,
        label: 'Draw',
        assetRefId: 'ref_draw',
        behavior: { kind: 'loop' },
        modifiers: [],
      },
    ]

    const convertTx: Transaction = {
      id: 'tx_convert',
      label: 'Convert',
      commands: [createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId: 'block_001', fps: 24 })],
    }
    const next = executeTransaction(state, convertTx, { now: new Date().toISOString() })
    expect(next.sequences[seqId].blocks[0].type).toBe('sequence')
  })

  it('FT-024: pop edit path returns to parent sequence', () => {
    const state = createInitialSequenceState()
    const innerId = 'seq_inner_test'
    let current = executeTransaction(state, {
      id: 'tx_open',
      label: 'Open',
      commands: [createPushEditPathCommand({ sequenceId: innerId, blockId: 'block_001' })],
    }, { now: new Date().toISOString() })
    expect(current.activeSequenceId).toBe(innerId)

    current = executeTransaction(current, {
      id: 'tx_close',
      label: 'Close',
      commands: [createPopEditPathCommand()],
    }, { now: new Date().toISOString() })
    expect(current.activeSequenceId).toBe(state.activeSequenceId)
    expect(current.editPath).toHaveLength(1)
  })
})
