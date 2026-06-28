import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import type { SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'
import { SequenceStore, createInitialSequenceState } from '@/modules/illustrator/lib/sequence/sequence-store'

export type PersistedSequenceBundle = {
  state: SequenceState
  drawingPayloads: Record<string, LayerCanvasSnapshot>
}

export function exportSequenceBundle(
  store: SequenceStore,
  assetManager: AssetManager,
): PersistedSequenceBundle {
  return {
    state: structuredClone(store.getState()) as SequenceState,
    drawingPayloads: assetManager.exportDrawingPayloads(),
  }
}

export function importSequenceBundle(
  bundle: PersistedSequenceBundle | null | undefined,
): { store: SequenceStore; payloads: Record<string, LayerCanvasSnapshot> } {
  if (!bundle?.state) {
    return { store: new SequenceStore(createInitialSequenceState()), payloads: {} }
  }
  return {
    store: new SequenceStore(bundle.state),
    payloads: bundle.drawingPayloads ?? {},
  }
}
