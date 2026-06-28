import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { AssetManager } from '@/modules/illustrator/lib/assets/asset-manager'
import {
  createEmptyManifest,
  type SequenceManifest,
} from '@/modules/illustrator/lib/sequence/sequence-manifest'
import {
  DEFAULT_SEQUENCE_SETTINGS,
  type MasterAsset,
  type SequenceState,
} from '@/modules/illustrator/lib/sequence/sequence.types'

export const SEQUENCE_FILE_EXTENSION = '.sequence'

export type SequenceFileFormat = 'embedded' | 'linked'

export type SequenceFile = {
  format: SequenceFileFormat
  manifest: SequenceManifest
  /** Embedded payloads keyed by dataKey — populated when format === 'embedded' */
  payloads?: Record<string, unknown>
  masters?: MasterAsset[]
}

export function serializeSequenceState(
  state: SequenceState,
  format: SequenceFileFormat = 'embedded',
): SequenceFile {
  const manifest = createEmptyManifest(state.activeSequenceId)
  manifest.sequences = structuredClone(state.sequences) as SequenceFile['manifest']['sequences']
  manifest.updatedAt = new Date().toISOString()
  return { format, manifest, payloads: format === 'embedded' ? {} : undefined }
}

export function serializeSequenceBundle(
  state: SequenceState,
  assetManager: AssetManager,
  format: SequenceFileFormat = 'embedded',
): SequenceFile {
  const manifest = createEmptyManifest(state.activeSequenceId)
  manifest.sequences = structuredClone(state.sequences) as SequenceFile['manifest']['sequences']
  manifest.updatedAt = new Date().toISOString()
  return {
    format,
    manifest,
    payloads: format === 'embedded' ? assetManager.exportDrawingPayloads() : undefined,
    masters: assetManager.listMasters(),
  }
}

export function applySequenceFile(
  file: SequenceFile,
  assetManager: AssetManager,
): { state: SequenceState; rootSequenceId: string } {
  if (file.payloads) {
    assetManager.importDrawingPayloads(file.payloads as Record<string, LayerCanvasSnapshot>)
  }
  if (file.masters) {
    for (const master of file.masters) {
      assetManager.registerMaster(master)
    }
  }

  const rootSequenceId = file.manifest.rootSequenceId
  const state: SequenceState = {
    activeSequenceId: rootSequenceId,
    openTabIds: [rootSequenceId],
    sequences: file.manifest.sequences,
    selection: { kind: 'empty' },
    editPath: [{ sequenceId: rootSequenceId, zoomLevel: 1 }],
    settings: { ...DEFAULT_SEQUENCE_SETTINGS },
  }
  return { state, rootSequenceId }
}

export function parseSequenceFile(json: string): SequenceFile {
  const parsed = JSON.parse(json) as SequenceFile
  if (!parsed.manifest || parsed.manifest.version !== 1) {
    throw new Error('Invalid .sequence file: unsupported manifest version')
  }
  return parsed
}

export function sequenceFileToJson(file: SequenceFile): string {
  return JSON.stringify(file, null, 2)
}
