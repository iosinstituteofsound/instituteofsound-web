import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { DrawingEventSource } from '@/modules/illustrator/lib/assets/drawing-event-source'
import { DrawingHandle, type AssetHandle } from '@/modules/illustrator/lib/assets/asset-handle'
import { createAssetRef, type DrawingVersionInput } from '@/modules/illustrator/lib/assets/asset-ref'
import type { AssetRef, DrawingAsset, MasterAsset } from '@/modules/illustrator/lib/sequence/sequence.types'
import { AssetDependencyGraph } from '@/modules/illustrator/lib/assets/asset-dependency-graph'

type PayloadStore = Map<string, unknown>

export class AssetManager {
  readonly dependencyGraph = new AssetDependencyGraph()
  readonly drawingEvents = new DrawingEventSource()
  private drawings = new Map<string, DrawingAsset>()
  private drawingHeads = new Map<string, string>()
  private masters = new Map<string, MasterAsset>()
  private payloads: PayloadStore = new Map()
  private handles = new Map<string, AssetHandle>()

  appendDrawingVersion(input: DrawingVersionInput): AssetRef {
    const headId = this.drawingHeads.get(input.logicalId)
    const version = headId
      ? (this.drawings.get(headId)?.version ?? 0) + 1
      : 1
    const id = `${input.logicalId}@v${version}`
    const asset: DrawingAsset = {
      id,
      logicalId: input.logicalId,
      version,
      parentVersionId: input.parentVersionId ?? headId,
      layerId: input.layerId,
      label: input.label,
      createdAt: new Date().toISOString(),
      payloadRef: input.payload.dataKey,
    }
    this.drawings.set(id, asset)
    this.drawingHeads.set(input.logicalId, id)
    if (input.snapshot) {
      this.payloads.set(input.payload.dataKey, input.snapshot)
    }
    this.drawingEvents.append(input.logicalId, {
      kind: 'snapshotCommitted',
      payload: {
        version,
        versionId: id,
        dataKey: input.payload.dataKey,
        layerId: input.layerId,
        parentVersionId: input.parentVersionId ?? headId ?? null,
      },
    })
    this.dependencyGraph.addNode({ id, kind: 'drawing' })
    if (headId) {
      this.dependencyGraph.addEdge({ from: id, to: headId, kind: 'references' })
    }
    this.handles.delete(createAssetRef(input.logicalId, 'drawing').id)
    return createAssetRef(input.logicalId, 'drawing')
  }

  setDrawingPayload(dataKey: string, snapshot: LayerCanvasSnapshot): void {
    this.payloads.set(dataKey, snapshot)
    for (const handle of this.handles.values()) {
      handle.release()
    }
    this.handles.clear()
  }

  getDrawingPayload(dataKey: string): LayerCanvasSnapshot | undefined {
    return this.payloads.get(dataKey) as LayerCanvasSnapshot | undefined
  }

  exportDrawingPayloads(): Record<string, LayerCanvasSnapshot> {
    const out: Record<string, LayerCanvasSnapshot> = {}
    for (const drawing of this.drawings.values()) {
      const snap = this.payloads.get(drawing.payloadRef)
      if (snap) out[drawing.payloadRef] = snap as LayerCanvasSnapshot
    }
    return out
  }

  importDrawingPayloads(payloads: Record<string, LayerCanvasSnapshot>): void {
    for (const [key, snap] of Object.entries(payloads)) {
      this.payloads.set(key, snap)
    }
    this.handles.clear()
  }

  getHandle<T = unknown>(ref: AssetRef): AssetHandle<T> {
    const cached = this.handles.get(ref.id)
    if (cached) return cached as AssetHandle<T>

    const handle = new DrawingHandle(ref, () => {
      const versionId = ref.versionPin ?? this.drawingHeads.get(ref.assetId)
      if (!versionId) return null
      const drawing = this.drawings.get(versionId)
      if (!drawing) return null
      return this.payloads.get(drawing.payloadRef) ?? null
    })
    this.handles.set(ref.id, handle)
    return handle as AssetHandle<T>
  }

  getHandleByRefId(refId: string): AssetHandle {
    const cached = this.handles.get(refId)
    if (cached) return cached

    const assetId = refId.replace(/^ref_/, '').split('@')[0] ?? refId
    const versionPin = refId.includes('@') ? refId.split('@')[1] : undefined
    return this.getHandle({ id: refId, assetId, kind: 'drawing', versionPin })
  }

  registerMaster(master: MasterAsset): void {
    this.masters.set(master.id, master)
    this.dependencyGraph.addNode({ id: master.id, kind: 'master' })
  }

  registerMasterFromHold(hold: { assetRefId: string; label: string }): MasterAsset {
    const id = `master_${hold.assetRefId.replace(/^ref_/, '').split('@')[0]}`
    const existing = this.masters.get(id)
    if (existing) return existing
    const master: MasterAsset = {
      id,
      label: hold.label,
      kind: 'hold',
      assetRefId: hold.assetRefId,
    }
    this.registerMaster(master)
    return master
  }

  getMaster(masterId: string): MasterAsset | undefined {
    return this.masters.get(masterId)
  }

  getMasterByRefId(masterAssetRefId: string): MasterAsset | undefined {
    const masterId = masterAssetRefId.replace(/^ref_/, '').split('@')[0]
    return this.masters.get(masterId)
  }

  masterRefId(masterId: string): string {
    return `ref_${masterId}`
  }

  listMasters(): MasterAsset[] {
    return [...this.masters.values()]
  }

  getDrawing(versionId: string): DrawingAsset | undefined {
    return this.drawings.get(versionId)
  }

  releaseHandle(refId: string): void {
    const handle = this.handles.get(refId)
    handle?.release()
    this.handles.delete(refId)
  }
}
