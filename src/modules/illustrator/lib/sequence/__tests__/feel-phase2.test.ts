import { describe, expect, it } from 'vitest'
import {
  createDeleteBlockCommand,
  createSplitHoldBlockCommand,
  createUpdateBlockBehaviorCommand,
  createUpdateSequenceSettingsCommand,
} from '@/modules/illustrator/lib/sequence/commands/editor-commands'
import { createHoldBlockCommand, createMoveBlockCommand, createUpdateSelectionCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction, undoTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createInitialSequenceState, SequenceStore } from '@/modules/illustrator/lib/sequence/sequence-store'
import { buildSnapCandidates, snapTimeMs } from '@/modules/illustrator/lib/sequence/timeline/snap-engine'
import { computeHoldEvalLocalTime } from '@/modules/illustrator/lib/sequence/evaluation/nodes/sequence-eval-node'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { createStudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import type { HoldBlock } from '@/modules/illustrator/lib/sequence/sequence.types'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { DEFAULT_BEHAVIOR } from '@/modules/illustrator/lib/sequence/sequence.types'

describe('sequence phase 2 feel tests', () => {
  it('FT-010: snap engine snaps to playhead within threshold', () => {
    const candidates = buildSnapCandidates({
      playheadMs: 1000,
      blocks: [{ id: 'b1', startTimeMs: 500, durationMs: 400 }],
    })
    const result = snapTimeMs(980, candidates, 80)
    expect(result.snapPoint?.kind).toBe('playhead')
    expect(result.snappedTimeMs).toBe(1000)
  })

  it('FT-012: split at playhead creates two blocks, one undo restores', () => {
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
    const assetRefId =
      current.sequences[seqId].blocks[0].type === 'hold'
        ? current.sequences[seqId].blocks[0].assetRefId
        : ''

    const splitTx: Transaction = {
      id: 'tx_split',
      label: 'Split',
      commands: [
        createSplitHoldBlockCommand({ sequenceId: seqId, blockId, splitTimeMs: 1000 }),
      ],
    }
    current = executeTransaction(current, splitTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks).toHaveLength(2)
    for (const block of current.sequences[seqId].blocks) {
      if (block.type === 'hold') expect(block.assetRefId).toBe(assetRefId)
    }

    current = undoTransaction(current, splitTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks).toHaveLength(1)
  })

  it('FT-015: ripple delete closes gap on same track', () => {
    const state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    const mk = (id: string, start: number, dur: number): Transaction => ({
      id: `tx_${id}`,
      label: 'Create',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: start,
          durationMs: dur,
          assetRefId: `ref_${id}`,
        }),
      ],
    })
    let current = executeTransaction(state, mk('a', 0, 1000), { now: new Date().toISOString() })
    current = executeTransaction(current, mk('b', 1000, 1000), { now: new Date().toISOString() })
    const firstId = current.sequences[seqId].blocks[0].id

    const deleteTx: Transaction = {
      id: 'tx_del',
      label: 'Delete',
      commands: [createDeleteBlockCommand({ sequenceId: seqId, blockId: firstId, ripple: true })],
    }
    current = executeTransaction(current, deleteTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks).toHaveLength(1)
    expect(current.sequences[seqId].blocks[0].startTimeMs).toBe(0)
  })

  it('FT-013: loop behavior can be set on block', () => {
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
    const behaviorTx: Transaction = {
      id: 'tx_behavior',
      label: 'Behavior',
      commands: [
        createUpdateBlockBehaviorCommand({
          sequenceId: seqId,
          blockId,
          behavior: { kind: 'loop' },
        }),
      ],
    }
    current = executeTransaction(current, behaviorTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks[0].behavior.kind).toBe('loop')
  })

  it('FT-011: drag release undo restores block position', () => {
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

    const moveTx: Transaction = {
      id: 'tx_move',
      label: 'Move block',
      commands: [
        createMoveBlockCommand({
          sequenceId: seqId,
          blockId,
          startTimeMs: 800,
          trackId,
        }),
      ],
    }
    current = executeTransaction(current, moveTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks[0].startTimeMs).toBe(800)

    current = undoTransaction(current, moveTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks[0].startTimeMs).toBe(0)
  })

  it('FT-014: speed modifier scales eval local time', () => {
    const hold: HoldBlock = {
      id: 'b1',
      type: 'hold',
      trackId: 't1',
      startTimeMs: 0,
      durationMs: 1000,
      label: 'Hold',
      assetRefId: 'ref_draw',
      behavior: DEFAULT_BEHAVIOR,
      modifiers: [{ type: 'speed', rate: 2 }],
    }
    const baseline = computeHoldEvalLocalTime(250, { ...hold, modifiers: [] })
    const sped = computeHoldEvalLocalTime(250, hold)
    expect(sped.timeMs).toBeGreaterThan(baseline.timeMs)
  })

  it('FT-016: block selection updates inspector state', () => {
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
    const selectTx: Transaction = {
      id: 'tx_select',
      label: 'Select',
      commands: [createUpdateSelectionCommand({ selection: { kind: 'blocks', ids: [blockId] } })],
    }
    current = executeTransaction(current, selectTx, { now: new Date().toISOString() })
    expect(current.selection).toEqual({ kind: 'blocks', ids: [blockId] })
  })

  it('FT-017: paint commit pauses playback', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    const layerCanvas = document.createElement('canvas')
    layerCanvas.width = 64
    layerCanvas.height = 64
    bridge.syncTracksFromLayers([
      {
        id: 'layer_1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        canvas: layerCanvas,
      },
    ])
    bridge.play()
    expect(bridge.isPlaying()).toBe(true)

    const snapshot: LayerCanvasSnapshot = {
      id: 'layer_1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 100,
      pixelCanvas: layerCanvas,
    }
    bridge.onCanvasPaintCommit({
      layerId: 'layer_1',
      layerName: 'Layer 1',
      snapshot,
      startTimeMs: 0,
      durationMs: 1000,
    })
    expect(bridge.isPlaying()).toBe(false)
  })

  it('FT-018: onion skin toggle updates settings', () => {
    const state = createInitialSequenceState()
    const settingsTx: Transaction = {
      id: 'tx_onion',
      label: 'Onion',
      commands: [createUpdateSequenceSettingsCommand({ settings: { onionSkinEnabled: true } })],
    }
    const next = executeTransaction(state, settingsTx, { now: new Date().toISOString() })
    expect(next.settings.onionSkinEnabled).toBe(true)
  })
})
