import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import {
  createGroupCompoundCommand,
  createUngroupCompoundCommand,
} from '@/modules/illustrator/lib/sequence/commands/compound-commands'
import {
  countMasterInstances,
  createConvertHoldToReferenceCommand,
  createDuplicateReferenceCommand,
} from '@/modules/illustrator/lib/sequence/commands/reference-commands'
import { executeTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import {
  applySequenceFile,
  parseSequenceFile,
  sequenceFileToJson,
  serializeSequenceBundle,
} from '@/modules/illustrator/lib/sequence/sequence-file'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

function createTwoHolds(state = createInitialSequenceState()) {
  const seqId = state.activeSequenceId
  const trackId = state.sequences[seqId].tracks[0].id
  const tx: Transaction = {
    id: 'tx_two_holds',
    label: 'Create holds',
    commands: [
      createHoldBlockCommand({
        sequenceId: seqId,
        trackId,
        startTimeMs: 0,
        durationMs: 1000,
        assetRefId: 'ref_draw_a',
        label: 'A',
      }),
      createHoldBlockCommand({
        sequenceId: seqId,
        trackId,
        startTimeMs: 1000,
        durationMs: 1000,
        assetRefId: 'ref_draw_b',
        label: 'B',
      }),
    ],
  }
  return executeTransaction(state, tx, { now: new Date().toISOString() })
}

describe('sequence phase 3B feel tests', () => {
  it('FT-030: group compound merges selected blocks into inner sequence', () => {
    let current = createTwoHolds()
    const seqId = current.activeSequenceId
    const ids = current.sequences[seqId].blocks.map((b) => b.id)

    current = executeTransaction(
      current,
      {
        id: 'tx_group',
        label: 'Group',
        commands: [createGroupCompoundCommand({ sequenceId: seqId, blockIds: ids })],
      },
      { now: new Date().toISOString() },
    )

    expect(current.sequences[seqId].blocks).toHaveLength(1)
    const compound = current.sequences[seqId].blocks[0]
    expect(compound.type).toBe('compound')
    if (compound.type === 'compound') {
      const inner = current.sequences[compound.innerSequenceId]
      expect(inner?.blocks).toHaveLength(2)
    }
  })

  it('FT-031: ungroup compound restores blocks on parent timeline', () => {
    let current = createTwoHolds()
    const seqId = current.activeSequenceId
    const ids = current.sequences[seqId].blocks.map((b) => b.id)
    current = executeTransaction(
      current,
      {
        id: 'tx_group',
        label: 'Group',
        commands: [createGroupCompoundCommand({ sequenceId: seqId, blockIds: ids })],
      },
      { now: new Date().toISOString() },
    )
    const compoundId = current.sequences[seqId].blocks[0].id

    current = executeTransaction(
      current,
      {
        id: 'tx_ungroup',
        label: 'Ungroup',
        commands: [createUngroupCompoundCommand({ sequenceId: seqId, blockId: compoundId })],
      },
      { now: new Date().toISOString() },
    )

    expect(current.sequences[seqId].blocks.filter((b) => b.type === 'hold')).toHaveLength(2)
    expect(current.sequences[seqId].blocks.some((b) => b.type === 'compound')).toBe(false)
  })

  it('FT-032: convert hold to reference replaces block type', () => {
    let current = createTwoHolds()
    const seqId = current.activeSequenceId
    const blockId = current.sequences[seqId].blocks[0].id
    const assetManager = new AssetManager()
    const master = assetManager.registerMasterFromHold({
      assetRefId: 'ref_draw_a',
      label: 'A',
    })

    current = executeTransaction(
      current,
      {
        id: 'tx_ref',
        label: 'Reference',
        commands: [
          createConvertHoldToReferenceCommand({
            sequenceId: seqId,
            blockId,
            masterAssetRefId: assetManager.masterRefId(master.id),
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    expect(current.sequences[seqId].blocks[0].type).toBe('reference')
  })

  it('FT-033: duplicate reference creates second instance', () => {
    let current = createTwoHolds()
    const seqId = current.activeSequenceId
    const blockId = current.sequences[seqId].blocks[0].id
    const assetManager = new AssetManager()
    const master = assetManager.registerMasterFromHold({
      assetRefId: 'ref_draw_a',
      label: 'A',
    })
    const masterAssetRefId = assetManager.masterRefId(master.id)

    current = executeTransaction(
      current,
      {
        id: 'tx_ref',
        label: 'Reference',
        commands: [createConvertHoldToReferenceCommand({ sequenceId: seqId, blockId, masterAssetRefId })],
      },
      { now: new Date().toISOString() },
    )

    current = executeTransaction(
      current,
      {
        id: 'tx_dup',
        label: 'Duplicate',
        commands: [
          createDuplicateReferenceCommand({
            sequenceId: seqId,
            sourceBlockId: blockId,
            startTimeMs: 2000,
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    const refs = current.sequences[seqId].blocks.filter((b) => b.type === 'reference')
    expect(refs).toHaveLength(2)
  })

  it('FT-034: countMasterInstances tracks instances across sequences', () => {
    let current = createTwoHolds()
    const seqId = current.activeSequenceId
    const blockId = current.sequences[seqId].blocks[0].id
    const assetManager = new AssetManager()
    const master = assetManager.registerMasterFromHold({
      assetRefId: 'ref_draw_a',
      label: 'A',
    })
    const masterAssetRefId = assetManager.masterRefId(master.id)

    current = executeTransaction(
      current,
      {
        id: 'tx_ref',
        label: 'Reference',
        commands: [createConvertHoldToReferenceCommand({ sequenceId: seqId, blockId, masterAssetRefId })],
      },
      { now: new Date().toISOString() },
    )
    current = executeTransaction(
      current,
      {
        id: 'tx_dup',
        label: 'Duplicate',
        commands: [
          createDuplicateReferenceCommand({
            sequenceId: seqId,
            sourceBlockId: blockId,
            startTimeMs: 2500,
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    expect(countMasterInstances(current, masterAssetRefId)).toBe(2)
  })

  it('FT-035: sequence file round-trips payloads and masters', () => {
    const state = createInitialSequenceState()
    const assetManager = new AssetManager()
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    assetManager.appendDrawingVersion({
      logicalId: 'draw_test',
      layerId: 'layer_1',
      label: 'Layer 1',
      payload: { dataKey: 'payload_1' },
      snapshot: {
        id: 'layer_1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        pixelCanvas: canvas,
      },
    })
    assetManager.registerMaster({
      id: 'master_test',
      label: 'Test Master',
      kind: 'hold',
      assetRefId: 'ref_draw_test',
    })

    const file = serializeSequenceBundle(state, assetManager)
    expect(Object.keys(file.payloads ?? {})).toContain('payload_1')
    expect(file.masters).toHaveLength(1)

    const json = sequenceFileToJson(file)
    const parsed = parseSequenceFile(json)
    const importManager = new AssetManager()
    const { state: imported } = applySequenceFile(parsed, importManager)

    expect(imported.activeSequenceId).toBe(state.activeSequenceId)
    expect(importManager.listMasters()[0]?.id).toBe('master_test')
  })
})
