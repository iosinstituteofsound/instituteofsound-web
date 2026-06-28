import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { AssetKind, AssetRef } from '@/modules/illustrator/lib/sequence/sequence.types'

export type { AssetRef, AssetKind }

export function createAssetRef(assetId: string, kind: AssetKind, versionPin?: string): AssetRef {
  const id = versionPin ? `ref_${assetId}@${versionPin}` : `ref_${assetId}`
  return { id, assetId, kind, versionPin }
}

export type SerializedDrawingPayload = {
  /** Placeholder for layer snapshot id in asset store */
  dataKey: string
}

export type DrawingVersionInput = {
  logicalId: string
  layerId: string
  label: string
  parentVersionId?: string
  payload: SerializedDrawingPayload
  snapshot?: LayerCanvasSnapshot
}
