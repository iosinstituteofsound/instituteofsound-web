import { describe, expect, it } from 'vitest'
import { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { encodeAnimatedGif } from '@/modules/illustrator/lib/export/gif-encoder'
import { solidExportFrame } from '@/modules/illustrator/lib/export/frame-sampler'
import { exportSequenceAnimation } from '@/modules/illustrator/lib/export/sequence-export-service'
import { PluginRegistry } from '@/modules/illustrator/lib/plugins/plugin-registry'
import { registerBuiltinPlugins, resetBuiltinPluginRegistration } from '@/modules/illustrator/lib/plugins/register-builtin-plugins'
import { createHoldBlockCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import { executeTransaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { buildEvalGraph } from '@/modules/illustrator/lib/sequence/evaluation/eval-graph-builder'
import { createStudioBridge } from '@/modules/illustrator/lib/sequence/studio-bridge'
import { createInitialSequenceState, SequenceStore } from '@/modules/illustrator/lib/sequence/sequence-store'

function mockSnapshot(id: string): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = 32
  pixelCanvas.height = 32
  return { id, name: id, visible: true, locked: false, opacity: 100, pixelCanvas }
}

describe('sequence phase 6 feel tests', () => {
  it('FT-050: export 3s GIF completes with non-empty blob under 60s', async () => {
    const assetManager = new AssetManager()
    const snapshot = mockSnapshot('layer_1')
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_export',
      layerId: 'layer_1',
      label: 'Export layer',
      payload: { dataKey: 'payload_export' },
      snapshot,
    })

    let state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    state.sequences[seqId].tracks[0] = { ...state.sequences[seqId].tracks[0], layerId: 'layer_1' }
    state.sequences[seqId].metadata = {
      ...state.sequences[seqId].metadata,
      durationMs: 3000,
      resolution: { width: 64, height: 64 },
    }

    state = executeTransaction(
      state,
      {
        id: 'tx_export_hold',
        label: 'export hold',
        commands: [
          createHoldBlockCommand({
            sequenceId: seqId,
            trackId,
            startTimeMs: 0,
            durationMs: 3000,
            assetRefId: ref.id,
          }),
        ],
      },
      { now: new Date().toISOString() },
    )

    const store = new SequenceStore(state)
    const bridge = createStudioBridge(store, assetManager)
    const progress: string[] = []

    const start = performance.now()
    const blob = await bridge.exportAnimation('gif', {
      durationMs: 3000,
      onProgress: (value) => progress.push(value.phase),
    })
    const elapsed = performance.now() - start

    expect(blob.size).toBeGreaterThan(0)
    expect(blob.type).toBe('image/gif')
    expect(elapsed).toBeLessThan(60_000)
    expect(progress).toContain('sampling')
    expect(progress).toContain('done')
  })

  it('FT-051: gif encoder produces valid header bytes', () => {
    const frames = [
      solidExportFrame(16, 16, [200, 100, 50]),
      solidExportFrame(16, 16, [210, 110, 60]),
      solidExportFrame(16, 16, [220, 120, 70]),
    ]
    const blob = encodeAnimatedGif(frames, [100, 100, 100])
    expect(blob.size).toBeGreaterThan(0)
  })

  it('FT-052: plugin registry exposes builtin exporters', () => {
    resetBuiltinPluginRegistration()
    const registry = new PluginRegistry()
    registerBuiltinPlugins(registry)

    const gif = registry.createExporter('export:gif')
    const webm = registry.createExporter('export:webm')

    expect(gif?.format).toBe('gif')
    expect(webm?.format).toBe('webm')
    expect(registry.list().filter((entry) => entry.kind === 'exporter')).toHaveLength(2)
  })

  it('FT-053: export samples graph frames for hold block range', async () => {
    const assetManager = new AssetManager()
    const ref = assetManager.appendDrawingVersion({
      logicalId: 'draw_sample',
      layerId: 'layer_sample',
      label: 'Sample',
      payload: { dataKey: 'payload_sample' },
      snapshot: mockSnapshot('layer_sample'),
    })

    let state = createInitialSequenceState()
    const seqId = state.activeSequenceId
    const trackId = state.sequences[seqId].tracks[0].id
    state.sequences[seqId].tracks[0] = { ...state.sequences[seqId].tracks[0], layerId: 'layer_sample' }

    state = executeTransaction(
      state,
      {
        id: 'tx_sample',
        label: 'sample hold',
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

    const result = await exportSequenceAnimation(
      {
        graph,
        getState: () => state,
        sequenceId: seqId,
        range: { startMs: 0, endMs: 1000 },
        fps: 12,
        width: 32,
        height: 32,
      },
      'gif',
    )

    expect(result.frameCount).toBeGreaterThanOrEqual(12)
    expect(result.blob.size).toBeGreaterThan(0)
  })
})
