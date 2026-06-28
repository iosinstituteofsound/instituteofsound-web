import { useEffect, useLayoutEffect } from 'react'
import { toast } from '@/shared/components/ui/sonner'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { useSequenceEngine } from '@/modules/illustrator/context/sequence-engine-context'
import type { ExportProgress } from '@/modules/illustrator/lib/export/export.types'
import {
  exportSequenceBundle,
  type PersistedSequenceBundle,
} from '@/modules/illustrator/lib/sequence/sequence-persistence'

export type SequencePaintPayload = {
  layerId: string
  layerName: string
  snapshot: LayerCanvasSnapshot
}

type SequenceEngineBindingsProps = {
  onPaintReady: (handler: (payload: SequencePaintPayload) => void) => void
  onExportReady: (handler: () => PersistedSequenceBundle) => void
  onUndoReady: (handlers: {
    undo: () => boolean
    redo: () => boolean
    canUndo: () => boolean
    canRedo: () => boolean
    preferUndo: () => boolean
    clearPrefer: () => void
  }) => void
  onEscapeReady?: (handlers: { isNestedEdit: () => boolean; closeInnerEdit: () => boolean }) => void
  onActionsReady?: (handlers: {
    groupCompound: () => boolean
    exportSequenceFile: () => string
    importSequenceFile: (json: string) => boolean
    exportGif: (options?: {
      durationMs?: number
      onProgress?: (progress: ExportProgress) => void
    }) => Promise<Blob>
    exportWebm: (options?: {
      durationMs?: number
      onProgress?: (progress: ExportProgress) => void
    }) => Promise<Blob>
  }) => void
  onValidatePaintReady?: (handler: (layerId: string) => boolean) => void
  onStoreChange?: () => void
}

/** Registers bridge callbacks for paint commit, persistence export, and sequence undo. */
export function SequenceEngineBindings({
  onPaintReady,
  onExportReady,
  onUndoReady,
  onEscapeReady,
  onActionsReady,
  onValidatePaintReady,
  onStoreChange,
}: SequenceEngineBindingsProps) {
  const { store, assetManager, bridge, clearSequenceUndoPreference, shouldPreferSequenceUndo } = useSequenceEngine()

  useLayoutEffect(() => {
    onPaintReady((payload) => {
      clearSequenceUndoPreference()
      const result = bridge.onCanvasPaintCommit({
        layerId: payload.layerId,
        layerName: payload.layerName,
        snapshot: payload.snapshot,
        startTimeMs: bridge.getCurrentTimeMs(),
        durationMs: 1000,
      })
      if (result?.created) {
        toast.success(`Hold clip on ${result.trackLabel}`)
      } else if (result?.blocked) {
        if (result.reason === 'non_hold_block') {
          toast.error('Is time pe sequence/reference clip hai — hold frame pe jao ya clip hatao')
        } else if (result.reason === 'background') {
          toast.error('Background pe paint nahi — koi layer select karo')
        } else {
          toast.error('Timeline clip not created — paint on a layer (not Background)')
        }
      } else if (!result) {
        toast.error('Timeline clip not created — paint on a layer (not Background)')
      }
    })
    onExportReady(() => exportSequenceBundle(store, assetManager))
    onUndoReady({
      undo: () => bridge.undo(),
      redo: () => bridge.redo(),
      canUndo: () => bridge.canUndo(),
      canRedo: () => bridge.canRedo(),
      preferUndo: () => shouldPreferSequenceUndo(),
      clearPrefer: () => clearSequenceUndoPreference(),
    })
    onEscapeReady?.({
      isNestedEdit: () => bridge.isNestedEdit(),
      closeInnerEdit: () => bridge.closeInnerEdit(),
    })
    onActionsReady?.({
      groupCompound: () => bridge.groupSelectedBlocks(),
      exportSequenceFile: () => bridge.exportSequenceFile(),
      importSequenceFile: (json) => bridge.importSequenceFile(json),
      exportGif: (options) =>
        bridge.exportAndDownload('gif', 'animation.gif', {
          durationMs: options?.durationMs ?? 3000,
          onProgress: options?.onProgress,
        }),
      exportWebm: (options) =>
        bridge.exportAndDownload('webm', 'animation.webm', {
          durationMs: options?.durationMs,
          onProgress: options?.onProgress,
        }),
    })
    onValidatePaintReady?.((layerId) => bridge.canPaintAtPlayhead(layerId))
  }, [
    assetManager,
    bridge,
    clearSequenceUndoPreference,
    onActionsReady,
    onEscapeReady,
    onExportReady,
    onPaintReady,
    onUndoReady,
    onValidatePaintReady,
    shouldPreferSequenceUndo,
    store,
  ])

  useEffect(() => {
    const unsub = store.subscribe(() => onStoreChange?.())
    return unsub
  }, [onStoreChange, store])

  return null
}
