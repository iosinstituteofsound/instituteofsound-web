import { elementBounds, type CanvasElement } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { StudioSelection, StudioTransformFields } from '@/modules/illustrator/components/studio/studio-layer-panel.types'

export type LayerPanelRow =
  | {
      kind: 'paint'
      id: string
      label: string
      layer: PaintLayer
      thumbnail?: string
      deletable: boolean
    }
  | {
      kind: 'element'
      id: string
      label: string
      element: CanvasElement
      deletable: true
    }

export function elementLabel(el: CanvasElement): string {
  switch (el.kind) {
    case 'text':
      return el.text.trim().slice(0, 28) || 'Text'
    case 'sticker':
      return `Sticker ${el.emoji}`
    case 'shape':
      return el.shape === 'rect' ? 'Rectangle' : el.shape === 'ellipse' ? 'Ellipse' : 'Triangle'
    case 'image':
      return 'Image'
    case 'frame':
      return 'Frame'
    case 'gradient':
      return 'Gradient'
    case 'stroke':
      return 'Stroke'
    case 'bitmap':
      return 'Bitmap'
    default:
      return 'Layer'
  }
}

/** Top of list = top of stack (elements, then paint layers reversed). */
export function buildLayerPanelRows(
  layers: PaintLayer[],
  elements: CanvasElement[],
  thumbnails: Record<string, string>,
): LayerPanelRow[] {
  const elementRows: LayerPanelRow[] = [...elements].reverse().map((element) => ({
    kind: 'element',
    id: element.id,
    label: elementLabel(element),
    element,
    deletable: true as const,
  }))

  const paintRows: LayerPanelRow[] = [...layers].reverse().map((layer) => ({
    kind: 'paint',
    id: layer.id,
    label: layer.name,
    layer,
    thumbnail: thumbnails[layer.id],
    deletable: layer.name !== 'Background' && !layer.locked,
  }))

  return [...elementRows, ...paintRows]
}

export function isRowSelected(row: LayerPanelRow, selection: StudioSelection) {
  if (!selection) return false
  if (selection.kind === 'layer' && row.kind === 'paint') return row.layer.id === selection.layerId
  if (selection.kind === 'element' && row.kind === 'element') return row.element.id === selection.elementId
  return false
}

export function getTransformForSelection(
  selection: StudioSelection,
  layers: PaintLayer[],
  elements: CanvasElement[],
  documentWidth: number,
  documentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): StudioTransformFields | null {
  if (!selection) return null

  if (selection.kind === 'layer') {
    const layer = layers.find((l) => l.id === selection.layerId)
    if (!layer) return null
    return {
      w: documentWidth,
      h: documentHeight,
      x: 0,
      y: 0,
      rotate: 0,
      opacity: Math.round(layer.opacity * 100),
    }
  }

  const el = elements.find((e) => e.id === selection.elementId)
  if (!el) return null
  const bounds = elementBounds(el)
  if (!bounds) return null

  return {
    w: Math.round(bounds.w * (documentWidth / canvasWidth)),
    h: Math.round(bounds.h * (documentHeight / canvasHeight)),
    x: Math.round(bounds.x * (documentWidth / canvasWidth)),
    y: Math.round(bounds.y * (documentHeight / canvasHeight)),
    rotate: 0,
    opacity: 100,
  }
}

export function canvasUnitsFromDoc(value: number, documentSize: number, canvasSize: number) {
  return (value / documentSize) * canvasSize
}

export function applyTransformPatchToElement(
  el: CanvasElement,
  patch: Partial<StudioTransformFields>,
  documentWidth: number,
  documentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): CanvasElement {
  if (el.kind === 'shape' || el.kind === 'frame' || el.kind === 'image') {
    return {
      ...el,
      x: patch.x !== undefined ? canvasUnitsFromDoc(patch.x, documentWidth, canvasWidth) : el.x,
      y: patch.y !== undefined ? canvasUnitsFromDoc(patch.y, documentHeight, canvasHeight) : el.y,
      w: patch.w !== undefined ? canvasUnitsFromDoc(patch.w, documentWidth, canvasWidth) : el.w,
      h: patch.h !== undefined ? canvasUnitsFromDoc(patch.h, documentHeight, canvasHeight) : el.h,
    }
  }

  if (el.kind === 'text' || el.kind === 'sticker') {
    return {
      ...el,
      x: patch.x !== undefined ? canvasUnitsFromDoc(patch.x, documentWidth, canvasWidth) : el.x,
      y: patch.y !== undefined ? canvasUnitsFromDoc(patch.y, documentHeight, canvasHeight) : el.y,
      ...(el.kind === 'sticker' && patch.w !== undefined
        ? { size: canvasUnitsFromDoc(patch.w, documentWidth, canvasWidth) }
        : {}),
      ...(el.kind === 'text' && patch.h !== undefined
        ? { fontSize: canvasUnitsFromDoc(patch.h, documentHeight, canvasHeight) }
        : {}),
    }
  }

  if (el.kind === 'gradient') {
    const dx = patch.x !== undefined ? canvasUnitsFromDoc(patch.x, documentWidth, canvasWidth) - el.x1 : 0
    const dy = patch.y !== undefined ? canvasUnitsFromDoc(patch.y, documentHeight, canvasHeight) - el.y1 : 0
    return {
      ...el,
      x1: patch.x !== undefined ? canvasUnitsFromDoc(patch.x, documentWidth, canvasWidth) : el.x1,
      y1: patch.y !== undefined ? canvasUnitsFromDoc(patch.y, documentHeight, canvasHeight) : el.y1,
      x2: el.x2 + dx,
      y2: el.y2 + dy,
    }
  }

  return el
}

export function activeLayerBlendLabel(selection: StudioSelection, layers: PaintLayer[]) {
  if (selection?.kind === 'layer') {
    const layer = layers.find((l) => l.id === selection.layerId)
    if (layer) return `Normal · ${Math.round(layer.opacity * 100)}%`
  }
  return 'Normal · 100%'
}
