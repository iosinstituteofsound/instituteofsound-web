import type { CanvasElement } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { ToolSettings } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { StudioArtworkDraft } from '@/modules/illustrator/components/studio/studio-types'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { restoreLayerSnapshot, snapshotLayers } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { encodeLayerBuffersAsync, extractLayerPixelPayloads } from '@/modules/illustrator/lib/studio-layer-encode'

import type { PersistedSequenceBundle } from '@/modules/illustrator/lib/sequence/sequence-persistence'

export const STUDIO_AUTOSAVE_VERSION = 1 as const

export type SerializedImageData = {
  width: number
  height: number
  dataBase64?: string
  /** @deprecated Legacy JSON pixel array — still read for older saves. */
  data?: number[]
}

export type SerializedLayerSnapshot = {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  imageData: SerializedImageData
}

export type SerializedCanvasElement =
  | Exclude<CanvasElement, { kind: 'bitmap' }>
  | {
      id: string
      kind: 'bitmap'
      data: SerializedImageData
    }

export type PersistedStudioDocument = {
  version: typeof STUDIO_AUTOSAVE_VERSION
  artworkId: string
  savedAt: string
  title: string
  status: 'draft' | 'published'
  document: {
    width: number
    height: number
    dpi: number
    colorProfile: 'sRGB' | 'CMYK'
  }
  colors: {
    foreground: string
    background: string
  }
  toolSettings: ToolSettings
  activeLayerId: string
  layers: SerializedLayerSnapshot[]
  elements: SerializedCanvasElement[]
  hasPaintedContent?: boolean
  /** Sequence engine state — present when VITE_SEQUENCE_ENGINE is enabled */
  sequence?: PersistedSequenceBundle
}

export type InitialStudioDocument = {
  layers: PaintLayer[]
  elements: CanvasElement[]
  activeLayerId: string
}

function bytesToBase64(bytes: Uint8ClampedArray): string {
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8ClampedArray {
  const binary = atob(base64)
  const bytes = new Uint8ClampedArray(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function serializeImageData(imageData: ImageData): SerializedImageData {
  return {
    width: imageData.width,
    height: imageData.height,
    dataBase64: bytesToBase64(imageData.data),
  }
}

function deserializeImageData(payload: SerializedImageData): ImageData {
  if (payload.dataBase64) {
    const bytes = base64ToBytes(payload.dataBase64)
    return new ImageData(new Uint8ClampedArray(bytes), payload.width, payload.height)
  }
  if (payload.data?.length) {
    return new ImageData(new Uint8ClampedArray(payload.data), payload.width, payload.height)
  }
  return new ImageData(payload.width, payload.height)
}

export function layerHasPaintedPixels(layer: PaintLayer): boolean {
  if (layer.name === 'Background') return false
  const ctx = layer.canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  const { width, height } = layer.canvas
  if (!width || !height) return false
  const data = ctx.getImageData(0, 0, width, height).data
  for (let i = 3; i < data.length; i += 64) {
    if (data[i] > 0) return true
  }
  return false
}

export function documentHasPaintedContent(doc: PersistedStudioDocument | null | undefined): boolean {
  if (!doc) return false
  if (doc.hasPaintedContent) return true

  return doc.layers.some((layer) => {
    if (layer.name === 'Background') return false
    const payload = layer.imageData
    if (payload.data?.length) {
      for (let i = 3; i < payload.data.length; i += 64) {
        if (payload.data[i] > 0) return true
      }
    }
    if (payload.dataBase64) {
      try {
        const bytes = base64ToBytes(payload.dataBase64)
        for (let i = 3; i < bytes.length; i += 256) {
          if (bytes[i] > 0) return true
        }
      } catch {
        return false
      }
    }
    return false
  })
}

export function mergeStudioDocuments(
  server: PersistedStudioDocument | null,
  local: PersistedStudioDocument | null,
): PersistedStudioDocument | null {
  if (!server && !local) return null
  if (!server) return local
  if (!local) return server

  const serverPainted = documentHasPaintedContent(server)
  const localPainted = documentHasPaintedContent(local)
  if (localPainted && !serverPainted) return local
  if (serverPainted && !localPainted) return server

  return local.savedAt >= server.savedAt ? local : server
}

export function serializeCanvasElement(element: CanvasElement): SerializedCanvasElement {
  if (element.kind !== 'bitmap') return element
  return {
    id: element.id,
    kind: 'bitmap',
    data: serializeImageData(element.data),
  }
}

export function deserializeCanvasElement(element: SerializedCanvasElement): CanvasElement {
  if (element.kind !== 'bitmap') return element
  return {
    id: element.id,
    kind: 'bitmap',
    data: deserializeImageData(element.data),
  }
}

export function serializeStudioDocument(input: {
  artwork: StudioArtworkDraft
  document: PersistedStudioDocument['document']
  colors: PersistedStudioDocument['colors']
  toolSettings: ToolSettings
  activeLayerId: string
  layers: PaintLayer[]
  elements: CanvasElement[]
  sequence?: PersistedSequenceBundle
}): PersistedStudioDocument {
  return {
    version: STUDIO_AUTOSAVE_VERSION,
    artworkId: input.artwork.id,
    savedAt: new Date().toISOString(),
    title: input.artwork.title?.trim() || 'Untitled Artwork',
    status: input.artwork.status ?? 'draft',
    document: input.document,
    colors: input.colors,
    toolSettings: input.toolSettings,
    activeLayerId: input.activeLayerId,
    hasPaintedContent: input.layers.some(layerHasPaintedPixels),
    layers: snapshotLayers(input.layers).map((layer) => ({
      ...layer,
      locked: layer.locked ?? false,
      imageData: serializeImageData(layer.imageData),
    })),
    elements: input.elements.map(serializeCanvasElement),
    sequence: input.sequence,
  }
}

export async function serializeStudioDocumentAsync(
  input: {
    artwork: StudioArtworkDraft
    document: PersistedStudioDocument['document']
    colors: PersistedStudioDocument['colors']
    toolSettings: ToolSettings
    activeLayerId: string
    layers: PaintLayer[]
    elements: CanvasElement[]
    sequence?: PersistedSequenceBundle
  },
  options?: {
    layerVersions?: Record<string, number>
    savedLayerVersions?: Record<string, number>
    cachedLayers?: SerializedLayerSnapshot[]
  },
): Promise<PersistedStudioDocument> {
  const payloads = extractLayerPixelPayloads(input.layers)
  const encodeIndexes: number[] = []
  const buffers: ArrayBuffer[] = []
  const cachedById = new Map((options?.cachedLayers ?? []).map((layer) => [layer.id, layer]))
  const layerVersions = options?.layerVersions ?? {}
  const savedLayerVersions = options?.savedLayerVersions ?? {}

  const serializedLayers: SerializedLayerSnapshot[] = payloads.map((payload, index) => {
    const cached = cachedById.get(payload.id)
    const version = layerVersions[payload.id] ?? 0
    const savedVersion = savedLayerVersions[payload.id]
    if (cached && savedVersion !== undefined && version === savedVersion) {
      return cached
    }
    if (!payload.buffer.byteLength) {
      return {
        id: payload.id,
        name: payload.name,
        visible: payload.visible,
        locked: payload.locked,
        opacity: payload.opacity,
        imageData: { width: payload.width, height: payload.height },
      }
    }
    encodeIndexes.push(index)
    buffers.push(payload.buffer)
    return {
      id: payload.id,
      name: payload.name,
      visible: payload.visible,
      locked: payload.locked,
      opacity: payload.opacity,
      imageData: { width: payload.width, height: payload.height },
    }
  })

  if (buffers.length) {
    const encoded = await encodeLayerBuffersAsync(buffers)
    encoded.forEach((dataBase64, encodedIndex) => {
      const layerIndex = encodeIndexes[encodedIndex]
      serializedLayers[layerIndex] = {
        ...serializedLayers[layerIndex],
        imageData: {
          ...serializedLayers[layerIndex].imageData,
          dataBase64,
        },
      }
    })
  }

  return {
    version: STUDIO_AUTOSAVE_VERSION,
    artworkId: input.artwork.id,
    savedAt: new Date().toISOString(),
    title: input.artwork.title?.trim() || 'Untitled Artwork',
    status: input.artwork.status ?? 'draft',
    document: input.document,
    colors: input.colors,
    toolSettings: input.toolSettings,
    activeLayerId: input.activeLayerId,
    hasPaintedContent: input.layers.some(layerHasPaintedPixels),
    layers: serializedLayers,
    elements: input.elements.map(serializeCanvasElement),
    sequence: input.sequence,
  }
}

export function restoreLayersFromPersisted(layers: SerializedLayerSnapshot[]): PaintLayer[] {
  return restoreLayerSnapshot(
    [],
    layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      imageData: deserializeImageData(layer.imageData),
    })),
  )
}

export function toInitialStudioDocument(doc: PersistedStudioDocument): InitialStudioDocument {
  return {
    layers: restoreLayersFromPersisted(doc.layers),
    elements: doc.elements.map(deserializeCanvasElement),
    activeLayerId: doc.activeLayerId,
  }
}

export function fingerprintStudioDocument(doc: PersistedStudioDocument) {
  const layerSignature = doc.layers.map((layer) => {
    const bytes = layer.imageData.dataBase64
      ? layer.imageData.dataBase64.length
      : layer.imageData.data?.length ?? 0
    return `${layer.imageData.width}x${layer.imageData.height}:${bytes}`
  })

  return JSON.stringify({
    title: doc.title,
    status: doc.status,
    document: doc.document,
    colors: doc.colors,
    toolSettings: doc.toolSettings,
    activeLayerId: doc.activeLayerId,
    layerSignature,
    elementCount: doc.elements.length,
    elements: doc.elements,
  })
}
