import type { CanvasElement } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'

export type StudioSelection =
  | { kind: 'layer'; layerId: string }
  | { kind: 'element'; elementId: string }
  | null

export type StudioTransformFields = {
  w: number
  h: number
  x: number
  y: number
  rotate: number
  opacity: number
}

export type StudioLayerPanelSnapshot = {
  layers: PaintLayer[]
  elements: CanvasElement[]
  selection: StudioSelection
  documentWidth: number
  documentHeight: number
  documentDpi: number
  documentColorProfile: 'sRGB' | 'CMYK'
  canvasWidth: number
  canvasHeight: number
  layerThumbnails: Record<string, string>
}

export type StudioLayerPanelActions = {
  selectLayer: (layerId: string) => void
  selectElement: (elementId: string) => void
  clearSelection: () => void
  addLayer: () => void
  toggleLayerVisibility: (layerId: string) => void
  toggleLayerLock: (layerId: string) => void
  deleteLayer: (layerId: string) => void
  deleteElement: (elementId: string) => void
  updateTransform: (patch: Partial<StudioTransformFields>) => void
  updateDocumentSize: (width: number, height: number) => void
}
