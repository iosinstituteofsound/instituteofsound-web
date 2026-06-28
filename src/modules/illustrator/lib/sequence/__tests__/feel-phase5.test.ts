import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { PluginRegistry } from '@/modules/illustrator/lib/plugins/plugin-registry'
import { registerBuiltinPlugins, resetBuiltinPluginRegistration } from '@/modules/illustrator/lib/plugins/register-builtin-plugins'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { buildEvalGraph } from '@/modules/illustrator/lib/sequence/evaluation/eval-graph-builder'
import { createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 64
  pixelCanvas.height = 64
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

describe('sequence phase 5 feel tests', () => {
  it('FT-043: plugin registry exposes builtin eval stubs', () => {
    resetBuiltinPluginRegistration()
    const registry = new PluginRegistry()
    registerBuiltinPlugins(registry)

    const fx = registry.createEvalNode('eval:fx')
    const constraints = registry.createEvalNode('eval:constraints')
    const audio = registry.createEvalNode('eval:audio')

    expect(fx?.id).toBe('eval:fx')
    expect(constraints?.id).toBe('eval:constraints')
    expect(audio?.id).toBe('eval:audio')
    expect(registry.list().filter((entry) => entry.kind === 'evalNode')).toHaveLength(3)
  })

  it('FT-044: eval graph includes stub nodes without breaking composite', () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_1')
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_1',
      layerId: 'layer_1',
      label: 'Layer',
      payload: { dataKey: 'payload_1' },
      snapshot,
    })

    let state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    state.sequences[seqId].tracks[0] = { ...state.sequences[seqId].tracks[0], layerId: 'layer_1' }

    state = executeTransaction(
      state,
      {
        id: 'tx_hold',
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
      },
      { now: new Date().toISOString() },
    )

    const { graph } = buildEvalGraph({
      assetManager,
      tracks: state.sequences[seqId].tracks,
    })
    const result = graph.evaluate(100, state, seqId)

    expect(result.composite.layers.size).toBeGreaterThan(0)
    expect(graph.getEvalStats().lastEvaluatedNodeIds).toEqual(
      expect.arrayContaining(['eval:fx', 'eval:constraints', 'eval:audio']),
    )
  })

  it('FT-045: drawing event source records snapshotCommitted on version append', () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_paint')

    assetManager.appendDrawingVersion({
      logicalId: 'draw_paint',
      layerId: 'layer_paint',
      label: 'Paint',
      payload: { dataKey: 'payload_paint' },
      snapshot,
    })

    const events = assetManager.drawingEvents.getEvents('draw_paint')
    expect(events).toHaveLength(1)
    expect(events[0]?.kind).toBe('snapshotCommitted')
    expect(events[0]?.payload.version).toBe(1)
    expect(events[0]?.payload.dataKey).toBe('payload_paint')
  })

  it('FT-046: head edit skips audio and fx stub nodes when cached', () => {
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

    const { graph } = buildEvalGraph({
      assetManager,
      tracks: state.sequences[seqId].tracks,
    })
    graph.evaluate(100, state, seqId)

    graph.markDirty(`eval:sequence:${headTrackId}`)
    graph.getCache().resetCompositeStats()
    graph.evaluate(100, state, seqId)
    const after = graph.getEvalStats()

    expect(after.lastEvaluatedNodeIds).toContain(`eval:sequence:${headTrackId}`)
    expect(after.lastEvaluatedNodeIds).not.toContain(`eval:sequence:${bodyTrackId}`)
    expect(after.lastEvaluatedNodeIds).not.toContain('eval:audio')
    expect(after.lastEvaluatedNodeIds).not.toContain('eval:fx')
    expect(after.lastEvaluatedNodeIds).not.toContain('eval:constraints')
  })
})
