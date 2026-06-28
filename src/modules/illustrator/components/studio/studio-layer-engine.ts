import {
  CANVAS_SIZE,
  DOCUMENT_BG,
  type CanvasPixelSize,
} from '@/modules/illustrator/components/studio/studio-canvas-model'

export type PaintLayer = {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  canvas: HTMLCanvasElement
}

function defaultCanvasSize(): CanvasPixelSize {
  return { width: CANVAS_SIZE, height: CANVAS_SIZE }
}

export function createLayer(
  name: string,
  fill?: string,
  size: CanvasPixelSize = defaultCanvasSize(),
): PaintLayer {
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  if (fill) {
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (ctx) {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, size.width, size.height)
    }
  }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    visible: true,
    locked: false,
    opacity: 1,
    canvas,
  }
}

export function createDefaultLayers(backgroundColor = DOCUMENT_BG, size: CanvasPixelSize = defaultCanvasSize()) {
  const background = createLayer('Background', backgroundColor, size)
  background.locked = true
  return [background, createLayer('Layer 1', undefined, size)]
}

export function fillBackgroundLayer(layer: PaintLayer, color: string) {
  const ctx = layer.canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = color
  ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height)
}

export function nextLayerName(layers: PaintLayer[]) {
  const nums = layers
    .map((layer) => /^Layer (\d+)$/.exec(layer.name)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number(value))
  return `Layer ${nums.length ? Math.max(...nums) + 1 : 1}`
}

export type LayerSnapshot = {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  imageData: ImageData
}

export type LayerCanvasSnapshot = {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  pixelCanvas: HTMLCanvasElement
}

function copyLayerCanvas(layer: PaintLayer): HTMLCanvasElement {
  const copy = document.createElement('canvas')
  copy.width = layer.canvas.width
  copy.height = layer.canvas.height
  const ctx = copy.getContext('2d')
  if (ctx) ctx.drawImage(layer.canvas, 0, 0)
  return copy
}

export function snapshotLayerCanvas(layer: PaintLayer): LayerCanvasSnapshot {
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    locked: layer.locked,
    opacity: layer.opacity,
    pixelCanvas: copyLayerCanvas(layer),
  }
}

/** Blank pixels for a layer (used when no hold block covers playhead time). */
export function blankLayerCanvasSnapshot(layer: PaintLayer): LayerCanvasSnapshot {
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = layer.canvas.width
  pixelCanvas.height = layer.canvas.height
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    locked: layer.locked,
    opacity: layer.opacity,
    pixelCanvas,
  }
}

/**
 * Merge engine eval output into full canvas layer list.
 * Timeline-linked layers without eval data are cleared; others keep current pixels.
 */
export function mergeCompositeIntoLayerSnapshots(
  layers: PaintLayer[],
  evaluated: LayerCanvasSnapshot[],
  linkedLayerIds: ReadonlySet<string>,
): LayerCanvasSnapshot[] {
  const byId = new Map(evaluated.map((snap) => [snap.id, snap]))
  return layers.map((layer) => {
    if (!linkedLayerIds.has(layer.id)) {
      return snapshotLayerCanvas(layer)
    }
    return byId.get(layer.id) ?? blankLayerCanvasSnapshot(layer)
  })
}

export function snapshotLayersCanvas(layers: PaintLayer[]): LayerCanvasSnapshot[] {
  return layers.map(snapshotLayerCanvas)
}

export function restoreActiveLayerFromCanvas(layers: PaintLayer[], snapshot: LayerCanvasSnapshot) {
  const layer = layers.find((item) => item.id === snapshot.id)
  if (!layer) return
  const ctx = layer.canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
  ctx.drawImage(snapshot.pixelCanvas, 0, 0)
}

export function snapshotLayer(layer: PaintLayer): LayerSnapshot {
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    locked: layer.locked,
    opacity: layer.opacity,
    imageData: layer.canvas
      .getContext('2d')!
      .getImageData(0, 0, layer.canvas.width, layer.canvas.height),
  }
}

export function snapshotLayers(layers: PaintLayer[]): LayerSnapshot[] {
  return layers.map(snapshotLayer)
}

export function restoreActiveLayerPixels(layers: PaintLayer[], snapshot: LayerSnapshot) {
  const layer = layers.find((item) => item.id === snapshot.id)
  if (!layer) return
  const ctx = layer.canvas.getContext('2d')
  if (!ctx) return
  ctx.putImageData(snapshot.imageData, 0, 0)
}

export function restoreLayerCanvasSnapshot(
  layers: PaintLayer[],
  snapshot: LayerCanvasSnapshot[],
): PaintLayer[] {
  return snapshot.map((snap) => {
    const existing = layers.find((item) => item.id === snap.id)
    const canvas = existing?.canvas ?? document.createElement('canvas')
    canvas.width = snap.pixelCanvas.width
    canvas.height = snap.pixelCanvas.height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(snap.pixelCanvas, 0, 0)
    }
    return {
      id: snap.id,
      name: snap.name,
      visible: snap.visible,
      locked: snap.locked ?? false,
      opacity: snap.opacity,
      canvas,
    }
  })
}

const thumbCanvasCache = document.createElement('canvas')
thumbCanvasCache.width = 28
thumbCanvasCache.height = 28

export function layerThumbnailDataUrl(layer: PaintLayer, size = 28): string {
  if (thumbCanvasCache.width !== size || thumbCanvasCache.height !== size) {
    thumbCanvasCache.width = size
    thumbCanvasCache.height = size
  }
  const ctx = thumbCanvasCache.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = DOCUMENT_BG
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(layer.canvas, 0, 0, size, size)
  return thumbCanvasCache.toDataURL('image/png')
}

export function snapshotThumbnailDataUrl(snapshot: LayerCanvasSnapshot, size = 96): string {
  if (thumbCanvasCache.width !== size || thumbCanvasCache.height !== size) {
    thumbCanvasCache.width = size
    thumbCanvasCache.height = size
  }
  const ctx = thumbCanvasCache.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = DOCUMENT_BG
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(snapshot.pixelCanvas, 0, 0, size, size)
  return thumbCanvasCache.toDataURL('image/png')
}

export function restoreLayerSnapshot(
  layers: PaintLayer[],
  snapshot: LayerSnapshot[],
): PaintLayer[] {
  return snapshot.map((snap) => {
    const existing = layers.find((l) => l.id === snap.id)
    const canvas = existing?.canvas ?? document.createElement('canvas')
    canvas.width = snap.imageData.width
    canvas.height = snap.imageData.height
    canvas.getContext('2d')!.putImageData(snap.imageData, 0, 0)
    return {
      id: snap.id,
      name: snap.name,
      visible: snap.visible,
      locked: snap.locked ?? false,
      opacity: snap.opacity,
      canvas,
    }
  })
}

export function resizePaintLayers(layers: PaintLayer[], size: CanvasPixelSize): PaintLayer[] {
  return layers.map((layer) => {
    const oldW = layer.canvas.width
    const oldH = layer.canvas.height
    if (oldW === size.width && oldH === size.height) return layer

    const nextCanvas = document.createElement('canvas')
    nextCanvas.width = size.width
    nextCanvas.height = size.height
    const ctx = nextCanvas.getContext('2d')
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(layer.canvas, 0, 0, oldW, oldH, 0, 0, size.width, size.height)
    }

    return { ...layer, canvas: nextCanvas }
  })
}

export function compositeLayers(
  ctx: CanvasRenderingContext2D,
  layers: PaintLayer[],
  draftLayerId?: string | null,
  options?: { skipClear?: boolean },
) {
  if (!options?.skipClear) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (const layer of layers) {
    if (!layer.visible) continue
    ctx.save()
    ctx.globalAlpha = layer.opacity
    if (draftLayerId === layer.id) {
      ctx.globalAlpha = layer.opacity
    }
    ctx.drawImage(layer.canvas, 0, 0)
    ctx.restore()
  }
}
