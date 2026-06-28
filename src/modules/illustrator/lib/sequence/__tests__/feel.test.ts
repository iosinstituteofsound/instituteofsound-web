import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { createHoldBlockCommand, createMoveBlockCommand, createResizeHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction, undoTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { SequenceStore, createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'
import { createStudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 64
  pixelCanvas.height = 64
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

describe('sequence feel tests', () => {
  it('FT-001: hold block creation completes under 150ms', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const assetManager = new AssetManager()
    const bridge = createStudioBridge(store, assetManager)
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

    const seqId = store.getState().activeSequenceId
    const start = performance.now()
    const result = bridge.onCanvasPaintCommit({
      layerId: 'layer_1',
      layerName: 'Layer 1',
      snapshot: mockSnapshot('layer_1'),
      startTimeMs: 0,
      durationMs: 1000,
    })
    const elapsed = performance.now() - start

    expect(result?.created).toBe(true)
    expect(store.getState().sequences[seqId].blocks).toHaveLength(1)
    expect(elapsed).toBeLessThan(150)
  })

  it('FT-002: stretch hold block preserves assetRefId', () => {
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
    const assetRefId =
      withBlock.sequences[seqId].blocks[0].type === 'hold'
        ? withBlock.sequences[seqId].blocks[0].assetRefId
        : ''

    const resizeTx: Transaction = {
      id: 'tx_resize',
      label: 'Resize',
      commands: [createResizeHoldBlockCommand({ sequenceId: seqId, blockId, durationMs: 3000 })],
    }
    const resized = executeTransaction(withBlock, resizeTx, { now: new Date().toISOString() })
    const block = resized.sequences[seqId].blocks[0]
    expect(block.type).toBe('hold')
    if (block.type === 'hold') {
      expect(block.durationMs).toBe(3000)
      expect(block.assetRefId).toBe(assetRefId)
    }
  })

  it('FT-005: one block drag equals one undo entry', () => {
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
          startTimeMs: 500,
          trackId,
        }),
      ],
    }
    current = executeTransaction(current, moveTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks[0].startTimeMs).toBe(500)

    current = undoTransaction(current, moveTx, { now: new Date().toISOString() })
    expect(current.sequences[seqId].blocks[0].startTimeMs).toBe(0)
  })
})
