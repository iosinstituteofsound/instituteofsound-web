import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { createHoldBlockCommand, createUpdateSelectionCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import type { Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { SequenceStore, createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'
import { createStudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 64
  pixelCanvas.height = 64
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

function seedTwoHolds(store: SequenceStore) {
  const state = store.getState()
  const seqId = state.activeSequenceId
  const trackId = state.sequences[seqId].tracks[0].id
  const tx: Transaction = {
    id: 'tx_seed',
    label: 'Seed',
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
  store.dispatch(tx)
}

describe('sequence QA bridge integration', () => {
  it('QA-001: bridge groupSelectedBlocks creates compound from multi-select', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    seedTwoHolds(store)
    const seqId = store.getState().activeSequenceId
    const ids = store.getState().sequences[seqId].blocks.map((b) => b.id)

    store.dispatch({
      id: 'tx_sel',
      label: 'Select',
      commands: [createUpdateSelectionCommand({ selection: { kind: 'blocks', ids } })],
    })

    expect(bridge.groupSelectedBlocks()).toBe(true)
    const blocks = store.getState().sequences[seqId].blocks
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('compound')
  })

  it('QA-002: bridge groupSelectedBlocks rejects single selection', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    seedTwoHolds(store)
    const blockId = store.getState().sequences[store.getState().activeSequenceId].blocks[0].id
    bridge.selectBlock(blockId)
    expect(bridge.groupSelectedBlocks()).toBe(false)
  })

  it('QA-003: bridge selectBlock additive toggles membership', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    seedTwoHolds(store)
    const seqId = store.getState().activeSequenceId
    const [a, b] = store.getState().sequences[seqId].blocks.map((b) => b.id)

    bridge.selectBlock(a)
    bridge.selectBlock(b, { additive: true })
    expect(store.getState().selection).toEqual({ kind: 'blocks', ids: [a, b] })

    bridge.selectBlock(a, { additive: true })
    expect(store.getState().selection).toEqual({ kind: 'blocks', ids: [b] })
  })

  it('QA-004: convertHoldToReference + evaluateComposite resolves master', () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_1')
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_head',
      layerId: 'layer_1',
      label: 'Head',
      payload: { dataKey: 'payload_ref' },
      snapshot,
    })

    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, assetManager)
    const state = store.getState()
    const seqId = state.activeSequenceId
    const sequence = store.getState().sequences[seqId]
    sequence.tracks[0] = { ...sequence.tracks[0], layerId: 'layer_1' }
    store.replaceState({ ...store.getState(), sequences: { ...store.getState().sequences, [seqId]: sequence } })
    bridge.refreshGraph()

    const trackId = store.getState().sequences[seqId].tracks[0].id
    store.dispatch({
      id: 'tx_hold',
      label: 'Hold',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 1000,
          assetRefId: ref.id,
        }),
      ],
    })
    bridge.refreshGraph()

    const blockId = store.getState().sequences[seqId].blocks[0].id
    expect(bridge.convertHoldToReference(blockId)).toBe(true)
    expect(store.getState().sequences[seqId].blocks[0].type).toBe('reference')

    const layers = bridge.evaluateComposite(500)
    expect(layers.length).toBeGreaterThan(0)
  })

  it('QA-005: ungroupCompound via bridge restores hold blocks', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    seedTwoHolds(store)
    const seqId = store.getState().activeSequenceId
    const ids = store.getState().sequences[seqId].blocks.map((b) => b.id)
    store.dispatch({
      id: 'tx_sel',
      label: 'Select',
      commands: [createUpdateSelectionCommand({ selection: { kind: 'blocks', ids } })],
    })
    bridge.groupSelectedBlocks()
    const compoundId = store.getState().sequences[seqId].blocks[0].id

    expect(bridge.ungroupCompound(compoundId)).toBe(true)
    expect(store.getState().sequences[seqId].blocks.filter((b) => b.type === 'hold')).toHaveLength(2)
  })

  it('QA-006: importSequenceFile round-trips through bridge', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const assetManager = new AssetManager()
    const bridge = createStudioBridge(store, assetManager)
    seedTwoHolds(store)

    const json = bridge.exportSequenceFile()
    const freshStore = new SequenceStore(createInitialSequenceState())
    const freshBridge = createStudioBridge(freshStore, new AssetManager())

    expect(freshBridge.importSequenceFile(json)).toBe(true)
    expect(freshStore.getState().sequences[freshStore.getState().activeSequenceId].blocks.length).toBe(2)
  })

  it('QA-010: paint blocked when sequence block covers playhead', () => {
    const assetManager = new AssetManager()
    const store = new SequenceStore(createInitialSequenceState())
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
    const trackId = store.getState().sequences[seqId].tracks.find((t) => t.layerId)?.id
    if (!trackId) throw new Error('track missing')

    store.dispatch({
      id: 'tx_hold',
      label: 'Hold',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 1000,
          assetRefId: 'ref_draw',
        }),
      ],
    })
    const blockId = store.getState().sequences[seqId].blocks[0].id
    bridge.convertHoldToSequence(blockId)
    bridge.refreshGraph()

    const result = bridge.onCanvasPaintCommit({
      layerId: 'layer_1',
      layerName: 'Layer 1',
      snapshot: mockSnapshot('layer_1'),
      startTimeMs: 500,
      durationMs: 1000,
    })

    expect(result?.blocked).toBe(true)
    expect(result?.reason).toBe('non_hold_block')
    expect(store.getState().sequences[seqId].blocks.filter((b) => b.type === 'hold')).toHaveLength(0)
  })

  it('QA-011: canPaintAtPlayhead false on sequence block, true on empty time', () => {
    const store = new SequenceStore(createInitialSequenceState())
    const bridge = createStudioBridge(store, new AssetManager())
    bridge.syncTracksFromLayers([
      {
        id: 'layer_1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        canvas: document.createElement('canvas'),
      },
    ])
    expect(bridge.canPaintAtPlayhead('layer_1')).toBe(true)

    const seqId = store.getState().activeSequenceId
    const trackId = store.getState().sequences[seqId].tracks.find((t) => t.layerId)?.id!
    store.dispatch({
      id: 'tx_hold',
      label: 'Hold',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 2000,
          assetRefId: 'ref_draw',
        }),
      ],
    })
    const blockId = store.getState().sequences[seqId].blocks[0].id
    bridge.convertHoldToSequence(blockId)
    bridge.seek(500)
    expect(bridge.canPaintAtPlayhead('layer_1')).toBe(false)
    bridge.seek(3000)
    expect(bridge.canPaintAtPlayhead('layer_1')).toBe(true)
  })
})
