import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { IncrementalEvaluationGraph } from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import { createSequenceEvalNodes } from '@/modules/illustrator/lib/sequence/evaluation/nodes/sequence-eval-node'
import { RuntimeDependencyGraph } from '@/modules/illustrator/lib/sequence/evaluation/runtime-dependency-graph'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction, type Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 64
  pixelCanvas.height = 64
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

describe('incremental evaluation graph', () => {
  it('evaluates hold block at timeMs', () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_1')
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_head',
      layerId: 'layer_1',
      label: 'Head',
      payload: { dataKey: 'payload_1' },
      snapshot,
    })
    const state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const sequence = state.sequences[seqId]
    sequence.tracks[0] = { ...sequence.tracks[0], layerId: 'layer_1' }
    const trackId = sequence.tracks[0].id
    const tx: Transaction = {
      id: 'tx1',
      label: 'hold',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: 0,
          durationMs: 1000,
          assetRefId: ref.id,
        }),
      ],
    }
    const nextState = executeTransaction(state, tx, { now: new Date().toISOString() })

    const runtimeGraph = new RuntimeDependencyGraph()
    const nodes = createSequenceEvalNodes(assetManager, nextState.sequences[seqId].tracks)
    for (const node of nodes) runtimeGraph.addNode({ id: node.id, kind: 'track' })
    const graph = new IncrementalEvaluationGraph({ nodes, runtimeGraph, assetManager })
    const result = graph.evaluate(100, nextState, seqId)
    expect(result.composite.layers.size).toBeGreaterThan(0)
  })
})
