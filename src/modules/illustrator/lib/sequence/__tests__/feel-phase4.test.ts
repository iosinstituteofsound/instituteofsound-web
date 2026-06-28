import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { IncrementalEvaluationGraph } from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import { createSequenceEvalNodes } from '@/modules/illustrator/lib/sequence/evaluation/nodes/sequence-eval-node'
import { RuntimeDependencyGraph } from '@/modules/illustrator/lib/sequence/evaluation/runtime-dependency-graph'
import { SequenceScheduler } from '@/modules/illustrator/lib/sequence/evaluation/scheduler'
import { createStudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'
import { SequenceStore } from '@/modules/illustrator/lib/sequence/sequence-store'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 64
  pixelCanvas.height = 64
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

function buildGraph(state: ReturnType<typeof createInitialSequenceState>, assetManager: AssetManager) {
  const seqId = state.activeSequenceId
  const runtimeGraph = new RuntimeDependencyGraph()
  const nodes = createSequenceEvalNodes(assetManager, state.sequences[seqId].tracks)
  for (const node of nodes) runtimeGraph.addNode({ id: node.id, kind: 'track' })
  return new IncrementalEvaluationGraph({ nodes, runtimeGraph, assetManager })
}

function createManyHolds(count: number, assetManager: AssetManager) {
  let state = createInitialSequenceState()
  const seqId = state.activeSequenceId
  const trackId = state.sequences[seqId].tracks[0].id
  state.sequences[seqId].tracks[0] = { ...state.sequences[seqId].tracks[0], layerId: 'layer_1' }

  const commands = Array.from({ length: count }, (_, i) => {
    const ref = assetManager.appendDrawingVersion({
      logicalId: `draw_${i}`,
      layerId: 'layer_1',
      label: `Hold ${i}`,
      payload: { dataKey: `payload_${i}` },
      snapshot: mockSnapshot(`layer_1_${i}`),
    })
    return createHoldBlockCommand({
      sequenceId: seqId,
      trackId,
      startTimeMs: i * 100,
      durationMs: 100,
      assetRefId: ref.id,
      label: `H${i}`,
    })
  })

  state = executeTransaction(
    state,
    { id: 'tx_many_holds', label: 'holds', commands },
    { now: new Date().toISOString() },
  )
  return state
}

describe('sequence phase 4 feel tests', () => {
  it('FT-040: composite cache keeps scrub across 50 blocks fast', () => {
    const assetManager = new AssetManager()
    const state = createManyHolds(50, assetManager)
    const graph = buildGraph(state, assetManager)
    const seqId = state.activeSequenceId
    const scheduler = new SequenceScheduler({
      graph,
      assetManager,
      getState: () => state,
    })

    scheduler.warmupCompositeCache(0, 4900, 100)

    graph.getCache().resetCompositeStats()
    const start = performance.now()
    for (let i = 0; i < 50; i += 1) {
      graph.evaluate(i * 100, state, seqId)
    }
    const elapsed = performance.now() - start
    const stats = graph.getEvalStats()

    expect(stats.compositeHits).toBeGreaterThanOrEqual(45)
    expect(elapsed).toBeLessThan(500)
  })

  it('FT-041: block preview resolves within 300ms', () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_head')
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_head',
      layerId: 'layer_head',
      label: 'Head',
      payload: { dataKey: 'payload_head' },
      snapshot,
    })

    let state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    state.sequences[seqId].tracks[0] = { ...state.sequences[seqId].tracks[0], layerId: 'layer_head', id: trackId }

    state = executeTransaction(
      state,
      {
        id: 'tx_head',
        label: 'head hold',
        commands: [
          createHoldBlockCommand({
            sequenceId: seqId,
            trackId,
            startTimeMs: 0,
            durationMs: 1000,
            assetRefId: ref.id,
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    const store = new SequenceStore(state)
    const bridge = createStudioBridge(store, assetManager)
    const blockId = state.sequences[seqId].blocks[0].id

    const start = performance.now()
    const preview = bridge.evaluateBlockPreview(blockId)
    const elapsed = performance.now() - start

    expect(preview?.id).toBe('layer_head')
    expect(elapsed).toBeLessThan(300)
  })

  it('FT-042: head edit skips body node evaluation', () => {
    const assetManager = new AssetManager()
    const headSnap = mockSnapshot('layer_head')
    const bodySnap = mockSnapshot('layer_body')
    const headRef = assetManager.appendDrawingVersion({
      logicalId: 'draw_head',
      layerId: 'layer_head',
      label: 'Head',
      payload: { dataKey: 'head' },
      snapshot: headSnap,
    })
    const bodyRef = assetManager.appendDrawingVersion({
      logicalId: 'draw_body',
      layerId: 'layer_body',
      label: 'Body',
      payload: { dataKey: 'body' },
      snapshot: bodySnap,
    })

    let state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const headTrackId = 'track_head'
    const bodyTrackId = 'track_body'
    state.sequences[seqId].tracks = [
      { id: headTrackId, label: 'Head', kind: 'character', layerId: 'layer_head', sortIndex: 0 },
      { id: bodyTrackId, label: 'Body', kind: 'character', layerId: 'layer_body', sortIndex: 1 },
    ]

    state = executeTransaction(
      state,
      {
        id: 'tx_head_body',
        label: 'head+body',
        commands: [
          createHoldBlockCommand({
            sequenceId: seqId,
            trackId: headTrackId,
            startTimeMs: 0,
            durationMs: 2000,
            assetRefId: headRef.id,
          }),
          createHoldBlockCommand({
            sequenceId: seqId,
            trackId: bodyTrackId,
            startTimeMs: 0,
            durationMs: 2000,
            assetRefId: bodyRef.id,
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    const graph = buildGraph(state, assetManager)
    graph.evaluate(100, state, seqId)

    graph.markDirty('eval:sequence:track_head')
    graph.getCache().resetCompositeStats()
    graph.evaluate(100, state, seqId)
    const after = graph.getEvalStats()

    expect(after.lastEvaluatedNodeIds).toContain('eval:sequence:track_head')
    expect(after.lastEvaluatedNodeIds).not.toContain('eval:sequence:track_body')
    expect(after.nodesEvaluatedOnLastPass).toBe(1)
  })
})
