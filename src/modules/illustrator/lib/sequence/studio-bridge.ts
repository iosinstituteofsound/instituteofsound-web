import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import { createAssetRef } from '@/modules/illustrator/lib/assets/asset-ref'
import { createHoldBlockCommand, createMoveBlockCommand, createResizeHoldBlockCommand, createUpdateSelectionCommand } from '@/modules/illustrator/lib/sequence/commands/block-commands'
import {
  createDeleteBlockCommand,
  createSplitHoldBlockCommand,
  createUpdateBlockBehaviorCommand,
  createUpdateBlockModifiersCommand,
  createUpdateSequenceSettingsCommand,
} from '@/modules/illustrator/lib/sequence/commands/editor-commands'
import {
  createConvertHoldToSequenceCommand,
  createExpandSequenceToFramesCommand,
} from '@/modules/illustrator/lib/sequence/commands/conversion-commands'
import {
  createGroupCompoundCommand,
  createUngroupCompoundCommand,
} from '@/modules/illustrator/lib/sequence/commands/compound-commands'
import {
  createConvertHoldToReferenceCommand,
  createDuplicateReferenceCommand,
} from '@/modules/illustrator/lib/sequence/commands/reference-commands'
import {
  createPopEditPathCommand,
  createPushEditPathCommand,
} from '@/modules/illustrator/lib/sequence/commands/navigation-commands'
import {
  applySequenceFile,
  parseSequenceFile,
  serializeSequenceBundle,
  sequenceFileToJson,
} from '@/modules/illustrator/lib/sequence/sequence-file'
import type { BlockBehavior, BlockModifier, SequenceEngineSettings } from '@/modules/illustrator/lib/sequence/sequence.types'
import type { Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { buildEvalGraph } from '@/modules/illustrator/lib/sequence/evaluation/eval-graph-builder'
import { IncrementalEvaluationGraph } from '@/modules/illustrator/lib/sequence/evaluation/incremental-eval-graph'
import { SequenceScheduler } from '@/modules/illustrator/lib/sequence/evaluation/scheduler'
import {
  downloadBlob,
  exportSequenceAnimation,
} from '@/modules/illustrator/lib/export/sequence-export-service'
import type { ExportProgress } from '@/modules/illustrator/lib/export/export.types'
import { registerBuiltinPlugins } from '@/modules/illustrator/lib/plugins/register-builtin-plugins'
import { globalPluginRegistry } from '@/modules/illustrator/lib/plugins/plugin-registry'
import { slugFromLayerName } from '@/modules/illustrator/lib/sequence/id-generator'
import type { SequenceStore } from '@/modules/illustrator/lib/sequence/sequence-store'
import type { AnimationBlock, HoldBlock, ReferenceBlock } from '@/modules/illustrator/lib/sequence/sequence.types'
import type { Canvas2DRenderer } from '@/modules/illustrator/lib/render/canvas2d-renderer'
import { msToFrameIndex } from '@/modules/illustrator/lib/sequence/time/timecode'

export type BridgeCallbacks = {
  onHoldBlockCreated?: (trackLabel: string) => void
  onTimelineMutation?: () => void
  onConvertedToSequence?: (frameCount: number, label: string) => void
  onExpandedToFrames?: (frameCount: number, label: string) => void
  onInnerSequenceOpened?: (label: string) => void
  onCompoundGrouped?: (label: string) => void
  onReferenceConverted?: (label: string) => void
}

export type PaintCommitResult = {
  created: boolean
  trackLabel: string
  blockId?: string
  blocked?: boolean
  reason?: 'background' | 'non_hold_block' | 'no_track'
}

export type PaintCommitPayload = {
  layerId: string
  layerName: string
  snapshot: LayerCanvasSnapshot
  trackId?: string
  startTimeMs: number
  durationMs: number
}

const DEFAULT_HOLD_MS = 1000

function activeBlockAtTime(blocks: AnimationBlock[], trackId: string, timeMs: number): AnimationBlock | null {
  return (
    blocks.find(
      (b) =>
        b.trackId === trackId &&
        timeMs >= b.startTimeMs &&
        timeMs < b.startTimeMs + b.durationMs &&
        !b.muted,
    ) ?? null
  )
}

function logicalIdFromAssetRef(assetRefId: string): string {
  return assetRefId.replace(/^ref_/, '').split('@')[0] ?? assetRefId
}

/** Sole touchpoint between canvas UI and sequence engine. */
export class StudioBridge {
  private store: SequenceStore
  private assetManager: AssetManager
  private scheduler: SequenceScheduler
  private graph: IncrementalEvaluationGraph
  private _renderer: Canvas2DRenderer | null = null
  private onStateChange?: () => void
  private callbacks: BridgeCallbacks

  constructor(
    store: SequenceStore,
    assetManager: AssetManager,
    onStateChange?: () => void,
    callbacks: BridgeCallbacks = {},
  ) {
    this.store = store
    this.assetManager = assetManager
    this.onStateChange = onStateChange
    this.callbacks = callbacks
    this.graph = this.rebuildGraph()
    this.scheduler = new SequenceScheduler({
      graph: this.graph,
      assetManager,
      getState: () => store.getState(),
      onFrame: () => this.onStateChange?.(),
    })
  }

  private rebuildGraph(): IncrementalEvaluationGraph {
    const state = this.store.getState()
    const seq = state.sequences[state.activeSequenceId]
    const built = buildEvalGraph({
      assetManager: this.assetManager,
      tracks: seq?.tracks ?? [],
    })
    return built.graph
  }

  refreshGraph(): void {
    this.graph = this.rebuildGraph()
    this.scheduler = new SequenceScheduler({
      graph: this.graph,
      assetManager: this.assetManager,
      getState: () => this.store.getState(),
      onFrame: () => this.onStateChange?.(),
    })
  }

  attachRenderer(renderer: Canvas2DRenderer): void {
    this._renderer = renderer
  }

  getRenderer(): Canvas2DRenderer | null {
    return this._renderer
  }

  syncTracksFromLayers(layers: PaintLayer[]): void {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const seq = state.sequences[seqId]
    if (!seq) return

    const paintLayers = layers.filter((l) => l.name !== 'Background')
    const existingByLayer = new Map(seq.tracks.filter((t) => t.layerId).map((t) => [t.layerId!, t]))
    const nextTracks = paintLayers.map((layer, index) => {
      const existing = existingByLayer.get(layer.id)
      if (existing) return { ...existing, label: layer.name, sortIndex: index }
      return {
        id: slugFromLayerName(layer.name),
        label: layer.name,
        kind: 'character' as const,
        layerId: layer.id,
        sortIndex: index,
      }
    })

    const changed =
      nextTracks.length !== seq.tracks.filter((t) => t.layerId).length ||
      nextTracks.some((t, i) => {
        const prev = seq.tracks.filter((track) => track.layerId)[i]
        return prev?.layerId !== t.layerId || prev?.id !== t.id
      }) ||
      seq.tracks.some((t) => !t.layerId)

    if (!changed) return

    this.store.dispatch({
      id: `tx_sync_tracks_${Date.now()}`,
      label: 'Sync tracks',
      commands: [
        {
          type: 'syncTracks',
          execute(s) {
            const sequence = s.sequences[seqId]
            if (!sequence) return s
            return {
              ...s,
              sequences: {
                ...s.sequences,
                [seqId]: { ...sequence, tracks: nextTracks },
              },
            }
          },
          undo(s) {
            return { ...s, sequences: { ...s.sequences, [seqId]: seq } }
          },
        },
      ],
    })
    this.refreshGraph()
  }

  resolveTrackForLayer(layerId: string): string | null {
    const state = this.store.getState()
    const seq = state.sequences[state.activeSequenceId]
    return seq?.tracks.find((t) => t.layerId === layerId)?.id ?? null
  }

  /** Synchronously ensure a timeline track exists for a paint layer (fixes first-stroke race). */
  ensureTrackForLayer(layerId: string, layerName: string): string | null {
    const existing = this.resolveTrackForLayer(layerId)
    if (existing) return existing

    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const seq = state.sequences[seqId]
    if (!seq) return null

    const trackId = slugFromLayerName(layerName)
    const linkedTracks = seq.tracks.filter((t) => t.layerId)
    const nextTrack = {
      id: trackId,
      label: layerName,
      kind: 'character' as const,
      layerId,
      sortIndex: linkedTracks.length,
    }
    const nextTracks = [...linkedTracks, nextTrack]

    this.store.dispatch({
      id: `tx_ensure_track_${Date.now()}`,
      label: 'Ensure track',
      commands: [
        {
          type: 'ensureTrack',
          execute(s) {
            const sequence = s.sequences[seqId]
            if (!sequence) return s
            return {
              ...s,
              sequences: {
                ...s.sequences,
                [seqId]: { ...sequence, tracks: nextTracks },
              },
            }
          },
          undo(s) {
            return { ...s, sequences: { ...s.sequences, [seqId]: seq } }
          },
        },
      ],
    })
    this.refreshGraph()
    return trackId
  }

  onCanvasPaintCommit(payload: PaintCommitPayload): PaintCommitResult | null {
    this.scheduler.pause()

    if (payload.layerName === 'Background') {
      return { created: false, trackLabel: payload.layerName, blocked: true, reason: 'background' }
    }

    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const seq = state.sequences[seqId]
    if (!seq) return null

    const trackId =
      payload.trackId ??
      this.resolveTrackForLayer(payload.layerId) ??
      this.ensureTrackForLayer(payload.layerId, payload.layerName)
    if (!trackId) {
      return { created: false, trackLabel: payload.layerName, blocked: true, reason: 'no_track' }
    }

    const freshSeq = this.store.getState().sequences[seqId]
    if (!freshSeq) return null

    const trackLabel = freshSeq.tracks.find((t) => t.id === trackId)?.label ?? payload.layerName
    const timeMs = payload.startTimeMs
    const active = activeBlockAtTime(freshSeq.blocks, trackId, timeMs)
    if (active && active.type !== 'hold') {
      return { created: false, trackLabel, blocked: true, reason: 'non_hold_block' }
    }
    const existing = active?.type === 'hold' ? active : null
    const dataKey = `draw_${payload.layerId}_${Date.now()}`
    const logicalId = existing ? logicalIdFromAssetRef(existing.assetRefId) : `draw_${payload.layerId}`

    const ref = this.assetManager.appendDrawingVersion({
      logicalId,
      layerId: payload.layerId,
      label: payload.layerName,
      payload: { dataKey },
      snapshot: payload.snapshot,
    })

    if (existing) {
      this.graph.getCache().invalidateStaticForAsset(existing.assetRefId)
      this.scheduler.markDirty(`eval:sequence:${trackId}`)
      this.scheduler.evaluateAt(timeMs)
      this.onStateChange?.()
      return { created: false, trackLabel, blockId: existing.id }
    }

    const tx: Transaction = {
      id: `tx_paint_${Date.now()}`,
      label: 'Create hold block',
      commands: [
        createHoldBlockCommand({
          sequenceId: seqId,
          trackId,
          startTimeMs: timeMs,
          durationMs: payload.durationMs || DEFAULT_HOLD_MS,
          assetRefId: ref.id,
          label: payload.layerName,
        }),
      ],
    }
    const next = this.store.dispatch(tx)
    const block = next.sequences[seqId].blocks.at(-1)
    this.scheduler.markDirty(`eval:sequence:${trackId}`)
    this.scheduler.evaluateAt(timeMs)
    this.onStateChange?.()
    this.callbacks.onHoldBlockCreated?.(trackLabel)
    return { created: true, trackLabel, blockId: block?.id }
  }

  canPaintAtPlayhead(layerId: string): boolean {
    const state = this.store.getState()
    const seq = state.sequences[state.activeSequenceId]
    if (!seq) return true
    const trackId = seq.tracks.find((t) => t.layerId === layerId)?.id
    if (!trackId) return true
    const active = activeBlockAtTime(seq.blocks, trackId, this.getCurrentTimeMs())
    return !active || active.type === 'hold'
  }

  evaluateComposite(timeMs: number): LayerCanvasSnapshot[] {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const result = this.graph.evaluate(timeMs, state, seqId)
    return [...result.composite.layers.values()]
  }

  /** Preview snapshot for a timeline block hover popover (FT-041). */
  evaluateBlockPreview(blockId: string): LayerCanvasSnapshot | null {
    const state = this.store.getState()
    const seq = state.sequences[state.activeSequenceId]
    const block = seq?.blocks.find((b) => b.id === blockId)
    if (!block || !seq) return null
    const track = seq.tracks.find((t) => t.id === block.trackId)
    const previewTimeMs = block.startTimeMs + Math.min(50, Math.max(0, block.durationMs / 2))
    const layers = this.evaluateComposite(previewTimeMs)
    if (track?.layerId) {
      return layers.find((layer) => layer.id === track.layerId) ?? layers[0] ?? null
    }
    return layers[0] ?? null
  }

  getEvalStats() {
    return this.scheduler.getEvalStats()
  }

  async exportAnimation(
    format: 'gif' | 'webm',
    options?: {
      durationMs?: number
      onProgress?: (progress: ExportProgress) => void
    },
  ): Promise<Blob> {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const seq = state.sequences[seqId]
    if (!seq) throw new Error('exportAnimation: no active sequence')

    registerBuiltinPlugins(globalPluginRegistry)
    const plugin = globalPluginRegistry.createExporter(format === 'gif' ? 'export:gif' : 'export:webm')
    const durationMs = options?.durationMs ?? seq.metadata.durationMs
    let { width, height } = seq.metadata.resolution
    if (format === 'gif') {
      const maxDim = 512
      const scale = Math.min(1, maxDim / Math.max(width, height))
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    this.scheduler.pause()
    this.scheduler.warmupCompositeCache(0, durationMs, 1000 / this.getFps())

    const exportFps = format === 'gif' ? Math.min(this.getFps(), 12) : this.getFps()

    const result = await exportSequenceAnimation(
      {
        graph: this.graph,
        getState: () => this.store.getState(),
        sequenceId: seqId,
        range: { startMs: 0, endMs: durationMs },
        fps: exportFps,
        width,
        height,
        onProgress: options?.onProgress,
      },
      format,
      plugin ?? undefined,
    )

    return result.blob
  }

  async exportAndDownload(
    format: 'gif' | 'webm',
    filename: string,
    options?: {
      durationMs?: number
      onProgress?: (progress: ExportProgress) => void
    },
  ): Promise<Blob> {
    const blob = await this.exportAnimation(format, options)
    downloadBlob(blob, filename)
    return blob
  }

  seekScrub(timeMs: number): void {
    this.scheduler.seekScrub(timeMs)
  }

  moveBlock(blockId: string, trackId: string, startTimeMs: number): void {
    const state = this.store.getState()
    this.store.dispatch({
      id: `tx_move_${Date.now()}`,
      label: 'Move block',
      commands: [
        createMoveBlockCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          startTimeMs,
          trackId,
        }),
      ],
    })
    this.callbacks.onTimelineMutation?.()
  }

  resizeHoldBlock(blockId: string, durationMs: number): void {
    const state = this.store.getState()
    this.store.dispatch({
      id: `tx_resize_${Date.now()}`,
      label: 'Resize hold block',
      commands: [
        createResizeHoldBlockCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          durationMs,
        }),
      ],
    })
    this.callbacks.onTimelineMutation?.()
  }

  undo(): boolean {
    const prev = this.store.undo()
    if (prev) {
      this.onStateChange?.()
      return true
    }
    return false
  }

  redo(): boolean {
    const next = this.store.redo()
    if (next) {
      this.onStateChange?.()
      return true
    }
    return false
  }

  canUndo(): boolean {
    return this.store.canUndo()
  }

  canRedo(): boolean {
    return this.store.canRedo()
  }

  selectBlock(blockId: string, options?: { additive?: boolean }): void {
    const state = this.store.getState()
    let ids = [blockId]
    if (options?.additive && state.selection.kind === 'blocks') {
      ids = state.selection.ids.includes(blockId)
        ? state.selection.ids.filter((id) => id !== blockId)
        : [...state.selection.ids, blockId]
    }
    this.store.dispatch({
      id: `tx_select_${Date.now()}`,
      label: 'Select block',
      commands: [createUpdateSelectionCommand({ selection: { kind: 'blocks', ids } })],
    })
    this.onStateChange?.()
  }

  groupSelectedBlocks(): boolean {
    const state = this.store.getState()
    const ids = state.selection.kind === 'blocks' ? state.selection.ids : []
    if (ids.length < 2) return false

    this.store.dispatch({
      id: `tx_group_${Date.now()}`,
      label: 'Group compound',
      commands: [
        createGroupCompoundCommand({
          sequenceId: state.activeSequenceId,
          blockIds: ids,
        }),
      ],
    })
    this.refreshGraph()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    this.callbacks.onCompoundGrouped?.('Compound')
    return true
  }

  ungroupCompound(blockId: string): boolean {
    const state = this.store.getState()
    const block = state.sequences[state.activeSequenceId]?.blocks.find((b) => b.id === blockId)
    if (!block || block.type !== 'compound') return false

    this.store.dispatch({
      id: `tx_ungroup_${Date.now()}`,
      label: 'Ungroup compound',
      commands: [
        createUngroupCompoundCommand({
          sequenceId: state.activeSequenceId,
          blockId,
        }),
      ],
    })
    this.refreshGraph()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    return true
  }

  convertHoldToReference(blockId: string): boolean {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const block = state.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (!block || block.type !== 'hold') return false

    const hold = block as HoldBlock
    const master = this.assetManager.registerMasterFromHold({
      assetRefId: hold.assetRefId,
      label: hold.label,
    })
    const masterAssetRefId = this.assetManager.masterRefId(master.id)

    this.store.dispatch({
      id: `tx_ref_${Date.now()}`,
      label: 'Convert to reference',
      commands: [
        createConvertHoldToReferenceCommand({
          sequenceId: seqId,
          blockId,
          masterAssetRefId,
        }),
      ],
    })
    this.graph.getCache().bumpGraphVersion()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    this.callbacks.onReferenceConverted?.(hold.label)
    return true
  }

  duplicateReferenceInstance(blockId: string): boolean {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const block = state.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (!block || block.type !== 'reference') return false

    const ref = block as ReferenceBlock
    this.store.dispatch({
      id: `tx_dup_ref_${Date.now()}`,
      label: 'Duplicate reference',
      commands: [
        createDuplicateReferenceCommand({
          sequenceId: seqId,
          sourceBlockId: blockId,
          startTimeMs: ref.startTimeMs + ref.durationMs,
          trackId: ref.trackId,
        }),
      ],
    })
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    return true
  }

  exportSequenceFile(): string {
    const state = this.store.getState()
    return sequenceFileToJson(serializeSequenceBundle(state, this.assetManager))
  }

  importSequenceFile(json: string): boolean {
    try {
      const file = parseSequenceFile(json)
      const { state } = applySequenceFile(file, this.assetManager)
      this.store.replaceState(state)
      this.scheduler.pause()
      this.scheduler.seek(0)
      this.refreshGraph()
      this.onStateChange?.()
      return true
    } catch {
      return false
    }
  }

  splitHoldBlockAtPlayhead(blockId: string, splitTimeMs: number): void {
    const state = this.store.getState()
    this.store.dispatch({
      id: `tx_split_${Date.now()}`,
      label: 'Split block',
      commands: [
        createSplitHoldBlockCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          splitTimeMs,
        }),
      ],
    })
    this.callbacks.onTimelineMutation?.()
  }

  updateBlockBehavior(blockId: string, behavior: BlockBehavior): void {
    const state = this.store.getState()
    this.store.dispatch({
      id: `tx_behavior_${Date.now()}`,
      label: 'Update behavior',
      commands: [
        createUpdateBlockBehaviorCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          behavior,
        }),
      ],
    })
    this.graph.getCache().bumpGraphVersion()
  }

  updateBlockModifiers(blockId: string, modifiers: BlockModifier[]): void {
    const state = this.store.getState()
    this.store.dispatch({
      id: `tx_modifiers_${Date.now()}`,
      label: 'Update modifiers',
      commands: [
        createUpdateBlockModifiersCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          modifiers,
        }),
      ],
    })
    this.graph.getCache().bumpGraphVersion()
  }

  deleteBlock(blockId: string, ripple?: boolean): void {
    const state = this.store.getState()
    const useRipple = ripple ?? state.settings.rippleDelete
    this.store.dispatch({
      id: `tx_delete_${Date.now()}`,
      label: 'Delete block',
      commands: [
        createDeleteBlockCommand({
          sequenceId: state.activeSequenceId,
          blockId,
          ripple: useRipple,
        }),
      ],
    })
    this.callbacks.onTimelineMutation?.()
  }

  updateSettings(patch: Partial<SequenceEngineSettings>): void {
    this.store.dispatch({
      id: `tx_settings_${Date.now()}`,
      label: 'Update settings',
      commands: [createUpdateSequenceSettingsCommand({ settings: patch })],
    })
  }

  convertHoldToSequence(blockId: string): number | null {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const block = state.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (!block) return null
    if (block.type !== 'hold') return null

    const fps = state.sequences[seqId]?.metadata.fps ?? state.settings.fps
    const cmd = createConvertHoldToSequenceCommand({ sequenceId: seqId, blockId, fps })
    this.store.dispatch({
      id: `tx_convert_${Date.now()}`,
      label: 'Convert to sequence',
      commands: [cmd],
    })
    this.refreshGraph()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    const after = this.store.getState()
    const converted = after.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (converted?.type !== 'sequence') return null
    return after.sequences[converted.innerSequenceId]?.blocks.length ?? null
  }

  expandSequenceToFrames(blockId: string): number | null {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const block = state.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (!block || block.type !== 'sequence') return null

    const inner = state.sequences[block.innerSequenceId]
    const frameCount = inner?.blocks.filter((b) => b.type === 'hold').length ?? 0

    this.store.dispatch({
      id: `tx_expand_${Date.now()}`,
      label: 'Expand to frames',
      commands: [createExpandSequenceToFramesCommand({ sequenceId: seqId, blockId })],
    })
    this.refreshGraph()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    if (frameCount > 0) {
      this.callbacks.onExpandedToFrames?.(frameCount, block.label)
    }
    return frameCount || null
  }

  openInnerBlock(blockId: string): boolean {
    const state = this.store.getState()
    const seqId = state.activeSequenceId
    const block = state.sequences[seqId]?.blocks.find((b) => b.id === blockId)
    if (!block || (block.type !== 'sequence' && block.type !== 'compound')) return false

    const innerSequenceId = block.innerSequenceId
    const inner = state.sequences[innerSequenceId]
    if (!inner) return false

    this.scheduler.pause()
    this.store.dispatch({
      id: `tx_open_inner_${Date.now()}`,
      label: 'Open inner sequence',
      commands: [
        createPushEditPathCommand({
          sequenceId: innerSequenceId,
          blockId,
          zoomLevel: 2,
        }),
      ],
    })
    this.scheduler.seek(0)
    this.refreshGraph()
    this.callbacks.onTimelineMutation?.()
    this.onStateChange?.()
    return true
  }

  closeInnerEdit(): boolean {
    const state = this.store.getState()
    if (state.editPath.length <= 1) return false

    this.store.dispatch({
      id: `tx_close_inner_${Date.now()}`,
      label: 'Close inner sequence',
      commands: [createPopEditPathCommand()],
    })
    this.refreshGraph()
    this.onStateChange?.()
    return true
  }

  getEditPath(): ReadonlyArray<{ sequenceId: string; blockId?: string; label: string }> {
    const state = this.store.getState()
    return state.editPath.map((node) => ({
      ...node,
      label: state.sequences[node.sequenceId]?.name ?? node.sequenceId,
    }))
  }

  isNestedEdit(): boolean {
    return this.store.getState().editPath.length > 1
  }

  getSettings(): Readonly<SequenceEngineSettings> {
    return this.store.getState().settings
  }

  getSelectedBlockIds(): string[] {
    const sel = this.store.getState().selection
    return sel.kind === 'blocks' ? sel.ids : []
  }

  seek(timeMs: number): void {
    this.scheduler.seek(timeMs)
  }

  play(): void {
    this.scheduler.play()
  }

  pause(): void {
    this.scheduler.pause()
  }

  togglePlayback(): void {
    const { playing } = this.scheduler.clock.getState()
    if (playing) this.pause()
    else this.play()
  }

  isPlaying(): boolean {
    return this.scheduler.clock.getState().playing
  }

  getCurrentTimeMs(): number {
    return this.scheduler.clock.getState().timeMs
  }

  getScheduler(): SequenceScheduler {
    return this.scheduler
  }

  getStore(): SequenceStore {
    return this.store
  }

  getAssetManager(): AssetManager {
    return this.assetManager
  }

  getFps(): number {
    const state = this.store.getState()
    return state.sequences[state.activeSequenceId]?.metadata.fps ?? state.settings.fps
  }

  frameToMs(frame: number): number {
    return (frame / this.getFps()) * 1000
  }

  msToFrame(timeMs: number): number {
    return msToFrameIndex(timeMs, this.getFps())
  }
}

export function createStudioBridge(
  store: SequenceStore,
  assetManager: AssetManager,
  onStateChange?: () => void,
  callbacks?: BridgeCallbacks,
): StudioBridge {
  return new StudioBridge(store, assetManager, onStateChange, callbacks)
}

export { createAssetRef }
