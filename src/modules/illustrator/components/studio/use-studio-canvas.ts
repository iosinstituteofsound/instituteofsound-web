import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import {
  paintBrushSegment,
  paintBrushSegmentsBatch,
  paintDab,
  pressureFromEvent,
  stabilizePoint,
  type BrushPoint,
  type BrushSegment,
} from '@/modules/illustrator/components/studio/studio-brush-engine'
import {
  DEFAULT_TOOL_SETTINGS,
  elementBounds,
  hitTestElement,
  resolveWorkingCanvasSize,
  scaleCanvasElements,
  type CanvasElement,
  type CanvasPixelSize,
  type Point,
  type ToolSettings,
} from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { OnionSkinPreview } from '@/modules/illustrator/components/studio/studio-animation.types'
import {
  floodFillCanvas,
  loadBaseImage,
  renderScene,
  buildPaintFrameCache,
  blitPaintFrame,
  expandBlitDirtyRect,
  type BlitDirtyRect,
  type PaintFrameCache,
} from '@/modules/illustrator/components/studio/studio-canvas-render'
import {
  createDefaultLayers,
  createLayer,
  fillBackgroundLayer,
  layerThumbnailDataUrl,
  nextLayerName,
  resizePaintLayers,
  restoreActiveLayerFromCanvas,
  restoreLayerCanvasSnapshot,
  snapshotLayerCanvas,
  snapshotLayersCanvas,
  type LayerCanvasSnapshot,
  type PaintLayer,
} from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { InitialStudioDocument } from '@/modules/illustrator/lib/studio-document-persistence'
import { applyTransformPatchToElement } from '@/modules/illustrator/components/studio/studio-layer-panel-utils'
import type { StudioSelection, StudioTransformFields } from '@/modules/illustrator/components/studio/studio-layer-panel.types'
import { useSmoothViewport, VIEWPORT_MAX_ZOOM, VIEWPORT_MIN_ZOOM } from '@/modules/illustrator/components/studio/use-smooth-viewport'
import { clientToCanvasPoint } from '@/modules/illustrator/components/studio/viewport-coords'
import { consumeWithinBudget, PAINT_FRAME_BUDGET_MS } from '@/modules/illustrator/lib/studio-paint-scheduler'

type UseStudioCanvasOptions = {
  activeTool: StudioToolId
  foreground: string
  background: string
  zoom: number
  imageUrl?: string
  toolSettings: ToolSettings
  documentWidth: number
  documentHeight: number
  initialDocument?: InitialStudioDocument | null
  onDocumentCommit?: () => void
  onPaintStrokeCommit?: (payload: { layerId: string; layerName: string; snapshot: LayerCanvasSnapshot }) => void
  /** When false, brush/erase/smudge/fill are blocked (e.g. sequence clip at playhead). */
  canPaintOnLayer?: (layerId: string) => boolean
  onPaintBlocked?: (reason: 'locked' | 'sequence_block' | 'background' | 'no_image') => void
  onZoomChange?: (zoom: number) => void
  onDocumentSizeChange?: (width: number, height: number) => void
}

type DragState =
  | { mode: 'shape'; start: Point; current: Point }
  | { mode: 'gradient'; start: Point; current: Point }
  | { mode: 'frame'; start: Point; current: Point }
  | { mode: 'pan'; startClient: Point; origin: Point }
  | { mode: 'zoom-scrub'; startClient: Point; startZoom: number; moved: boolean }
  | { mode: 'marquee'; start: Point; current: Point }
  | { mode: 'move'; start: Point; elementIds: string[] }

const MAX_UNDO_HISTORY = 20
const THUMBNAIL_DEBOUNCE_MS = 450

type BrushPreviewState = {
  x: number
  y: number
  size: number
  color: string
  opacity: number
}

function applyBrushPreview(el: HTMLDivElement | null, preview: BrushPreviewState | null, canvasW: number, canvasH: number) {
  if (!el) return
  if (!preview) {
    el.style.display = 'none'
    return
  }
  el.style.display = 'block'
  el.style.left = `${(preview.x / canvasW) * 100}%`
  el.style.top = `${(preview.y / canvasH) * 100}%`
  el.style.width = `${(preview.size / canvasW) * 100}%`
  el.style.height = `${(preview.size / canvasH) * 100}%`
  el.style.background = preview.color
  el.style.opacity = String(preview.opacity)
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isPaintTool(tool: StudioToolId) {
  return tool === 'brush' || tool === 'erase' || tool === 'smudge'
}

function readRestoredLayerPixelSize(layers: PaintLayer[] | undefined): CanvasPixelSize | null {
  const layer = layers?.find((item) => item.canvas.width > 0 && item.canvas.height > 0)
  if (!layer) return null
  return { width: layer.canvas.width, height: layer.canvas.height }
}

function resolveActiveLayerId(layers: PaintLayer[], preferredId: string) {
  const preferred = layers.find((layer) => layer.id === preferredId)
  if (preferred && !preferred.locked) return preferred.id
  const editable = layers.find((layer) => layer.name !== 'Background' && !layer.locked)
  return editable?.id ?? preferredId
}

export function useStudioCanvas({
  activeTool,
  foreground,
  background,
  zoom,
  imageUrl,
  toolSettings,
  documentWidth,
  documentHeight,
  initialDocument,
  onDocumentCommit,
  onPaintStrokeCommit,
  canPaintOnLayer,
  onPaintBlocked,
  onZoomChange,
  onDocumentSizeChange,
}: UseStudioCanvasOptions) {
  const workingSize = useMemo(() => {
    const restored = readRestoredLayerPixelSize(initialDocument?.layers)
    if (restored) return restored
    return resolveWorkingCanvasSize(documentWidth, documentHeight)
  }, [documentHeight, documentWidth, initialDocument?.layers])
  const workingSizeRef = useRef(workingSize)
  workingSizeRef.current = workingSize
  const documentReadyRef = useRef(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baseImageRef = useRef<HTMLImageElement | null>(null)
  const onDocumentCommitRef = useRef(onDocumentCommit)
  onDocumentCommitRef.current = onDocumentCommit
  const onPaintStrokeCommitRef = useRef(onPaintStrokeCommit)
  onPaintStrokeCommitRef.current = onPaintStrokeCommit
  const canPaintOnLayerRef = useRef(canPaintOnLayer)
  canPaintOnLayerRef.current = canPaintOnLayer
  const onPaintBlockedRef = useRef(onPaintBlocked)
  onPaintBlockedRef.current = onPaintBlocked

  const defaultLayers = useRef<PaintLayer[] | null>(null)
  if (!defaultLayers.current) {
    defaultLayers.current = initialDocument?.layers ?? createDefaultLayers(background, workingSize)
  }
  const seedLayers = defaultLayers.current
  const layersRef = useRef<PaintLayer[]>(seedLayers)
  const [layers, setLayers] = useState<PaintLayer[]>(layersRef.current)
  const moonLayer = seedLayers.find((l) => l.name === 'Layer 1')
  const [activeLayerId, setActiveLayerId] = useState(() => {
    const preferred =
      initialDocument?.activeLayerId ??
      moonLayer?.id ??
      seedLayers[1]?.id ??
      seedLayers[0].id
    return resolveActiveLayerId(seedLayers, preferred)
  })
  const [elements, setElements] = useState<CanvasElement[]>(initialDocument?.elements ?? [])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [layerThumbnails, setLayerThumbnails] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<CanvasElement | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const lastPaintPoint = useRef<Point | null>(null)
  const repaintRef = useRef<() => void>(() => {})
  const paintDragRef = useRef<{ points: BrushPoint[]; snapshot: LayerCanvasSnapshot; dirty: BlitDirtyRect | null } | null>(null)
  const paintFrameCacheRef = useRef<PaintFrameCache | null>(null)
  const paintRafRef = useRef<number | null>(null)
  const pendingPaintSamplesRef = useRef<Array<{ point: Point; pressure: number }>>([])
  const brushPreviewRef = useRef<HTMLDivElement | null>(null)
  const brushPreviewStateRef = useRef<BrushPreviewState | null>(null)
  const [isPainting, setIsPainting] = useState(false)
  const skipNextLayersEffectRef = useRef(false)
  const thumbDebounceRef = useRef<number | null>(null)
  const elementsRef = useRef(elements)
  elementsRef.current = elements
  const layerSaveVersionRef = useRef<Record<string, number>>({})
  const renderElementsRef = useRef<CanvasElement[] | null>(null)
  const foregroundRef = useRef(foreground)
  foregroundRef.current = foreground
  const onionSkinRef = useRef<OnionSkinPreview | null>(null)

  const cancelForGesture = useCallback(() => {
    if (paintRafRef.current !== null) {
      cancelAnimationFrame(paintRafRef.current)
      paintRafRef.current = null
    }
    pendingPaintSamplesRef.current = []
    if (paintDragRef.current) {
      restoreActiveLayerFromCanvas(layersRef.current, paintDragRef.current.snapshot)
      paintDragRef.current = null
      paintFrameCacheRef.current = null
      setIsPainting(false)
      repaintRef.current()
    }
    setDrag(null)
    setDraft(null)
    lastPaintPoint.current = null
    brushPreviewStateRef.current = null
    applyBrushPreview(brushPreviewRef.current, null, workingSizeRef.current.width, workingSizeRef.current.height)
  }, [])

  const {
    viewportRef,
    pan,
    scale,
    rotation,
    zoomAt,
    zoomByStep,
    fitToView,
    resetView,
    zoomToActual,
    getZoom,
    setPanImmediate,
    getPan,
  } = useSmoothViewport({
    zoom,
    onZoomChange,
    onGestureStart: cancelForGesture,
  })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const historyRef = useRef<Array<{ layers: LayerCanvasSnapshot[]; elements: CanvasElement[] }>>([
    { layers: snapshotLayersCanvas(layersRef.current), elements: initialDocument?.elements ?? [] },
  ])
  const historyIndexRef = useRef(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [textPrompt, setTextPrompt] = useState<Point | null>(null)

  const viewportTransformRef = useRef({ pan: { x: 0, y: 0 }, scale: 1, rotation: 0 })

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    const viewport = viewportRef.current
    if (!canvas || !viewport) return { x: 0, y: 0 }
    const t = viewportTransformRef.current
    return clientToCanvasPoint(canvas, viewport, clientX, clientY, t)
  }, [viewportRef])

  viewportTransformRef.current = { pan, scale, rotation }

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  const commitDocument = useCallback((nextLayers: PaintLayer[], nextElements: CanvasElement[]) => {
    layersRef.current = nextLayers
    setLayers(nextLayers)
    setElements(nextElements)
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1)
    let updated = [...trimmed, { layers: snapshotLayersCanvas(nextLayers), elements: nextElements }]
    if (updated.length > MAX_UNDO_HISTORY) {
      updated = updated.slice(updated.length - MAX_UNDO_HISTORY)
    }
    historyRef.current = updated
    historyIndexRef.current = updated.length - 1
    syncHistoryFlags()
    onDocumentCommitRef.current?.()
  }, [syncHistoryFlags])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    const entry = historyRef.current[historyIndexRef.current]
    const restored = restoreLayerCanvasSnapshot(layersRef.current, entry.layers)
    layersRef.current = restored
    setLayers(restored)
    setElements(entry.elements)
    syncHistoryFlags()
    onDocumentCommitRef.current?.()
  }, [syncHistoryFlags])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const entry = historyRef.current[historyIndexRef.current]
    const restored = restoreLayerCanvasSnapshot(layersRef.current, entry.layers)
    layersRef.current = restored
    setLayers(restored)
    setElements(entry.elements)
    syncHistoryFlags()
    onDocumentCommitRef.current?.()
  }, [syncHistoryFlags])

  const getActiveLayer = useCallback(() => {
    return layersRef.current.find((l) => l.id === activeLayerId) ?? layersRef.current[layersRef.current.length - 1]
  }, [activeLayerId])

  const guardPixelEdit = useCallback((layer: PaintLayer): boolean => {
    if (layer.name === 'Background') {
      onPaintBlockedRef.current?.('background')
      return false
    }
    if (layer.locked) {
      onPaintBlockedRef.current?.('locked')
      return false
    }
    if (canPaintOnLayerRef.current && !canPaintOnLayerRef.current(layer.id)) {
      onPaintBlockedRef.current?.('sequence_block')
      return false
    }
    return true
  }, [])

  const commitPaintStroke = useCallback(() => {
    const active = getActiveLayer()
    const afterLayerSnap = snapshotLayerCanvas(active)
    const prev = historyRef.current[historyIndexRef.current]
    const nextLayerSnaps = prev.layers.map((snap) => (snap.id === afterLayerSnap.id ? afterLayerSnap : snap))
    const nextElements = elementsRef.current

    setLayers([...layersRef.current])
    setElements(nextElements)

    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1)
    let updated = [...trimmed, { layers: nextLayerSnaps, elements: nextElements }]
    if (updated.length > MAX_UNDO_HISTORY) {
      updated = updated.slice(updated.length - MAX_UNDO_HISTORY)
    }
    historyRef.current = updated
    historyIndexRef.current = updated.length - 1
    layerSaveVersionRef.current[afterLayerSnap.id] = (layerSaveVersionRef.current[afterLayerSnap.id] ?? 0) + 1
    syncHistoryFlags()
    onDocumentCommitRef.current?.()
    onPaintStrokeCommitRef.current?.({
      layerId: afterLayerSnap.id,
      layerName: afterLayerSnap.name,
      snapshot: afterLayerSnap,
    })
  }, [getActiveLayer, syncHistoryFlags])

  const selection = useMemo((): StudioSelection => {
    if (selectedIds[0]) return { kind: 'element', elementId: selectedIds[0] }
    if (activeLayerId) return { kind: 'layer', layerId: activeLayerId }
    return null
  }, [activeLayerId, selectedIds])

  const refreshLayerThumbnails = useCallback((layerIds?: string[]) => {
    const targets = layerIds
      ? layersRef.current.filter((layer) => layerIds.includes(layer.id))
      : layersRef.current
    const next: Record<string, string> = {}
    for (const layer of targets) {
      try {
        next[layer.id] = layerThumbnailDataUrl(layer)
      } catch {
        next[layer.id] = ''
      }
    }
    setLayerThumbnails((prev) => {
      const merged = { ...prev, ...next }
      const keys = Object.keys(merged)
      if (keys.length === Object.keys(prev).length && keys.every((key) => prev[key] === merged[key])) {
        return prev
      }
      return merged
    })
  }, [])

  const scheduleLayerThumbnails = useCallback((layerIds?: string[]) => {
    if (thumbDebounceRef.current !== null) {
      window.clearTimeout(thumbDebounceRef.current)
    }
    thumbDebounceRef.current = window.setTimeout(() => {
      thumbDebounceRef.current = null
      refreshLayerThumbnails(layerIds)
    }, THUMBNAIL_DEBOUNCE_MS)
  }, [refreshLayerThumbnails])

  const selectLayer = useCallback((layerId: string) => {
    setActiveLayerId(layerId)
    setSelectedIds([])
  }, [])

  const selectElement = useCallback((elementId: string) => {
    setSelectedIds([elementId])
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const addLayer = useCallback(() => {
    const newLayer = createLayer(nextLayerName(layersRef.current), undefined, workingSize)
    const next = [...layersRef.current, newLayer]
    layersRef.current = next
    setLayers(next)
    setActiveLayerId(newLayer.id)
    setSelectedIds([])
    commitDocument(next, elements)
    refreshLayerThumbnails()
    repaintRef.current()
  }, [commitDocument, elements, refreshLayerThumbnails, workingSize])

  const toggleLayerVisibility = useCallback((layerId: string) => {
    const next = layersRef.current.map((layer) =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
    )
    layersRef.current = next
    setLayers(next)
    refreshLayerThumbnails()
    repaintRef.current()
    onDocumentCommitRef.current?.()
  }, [refreshLayerThumbnails])

  const toggleLayerLock = useCallback((layerId: string) => {
    const target = layersRef.current.find((l) => l.id === layerId)
    if (!target || target.name === 'Background') return
    const next = layersRef.current.map((layer) =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
    )
    layersRef.current = next
    setLayers(next)
    onDocumentCommitRef.current?.()
  }, [])

  const deleteLayer = useCallback((layerId: string) => {
    const target = layersRef.current.find((l) => l.id === layerId)
    if (!target || target.name === 'Background' || target.locked) return
    if (layersRef.current.length <= 2) return

    const next = layersRef.current.filter((l) => l.id !== layerId)
    layersRef.current = next
    setLayers(next)

    if (activeLayerId === layerId) {
      const fallback = next.find((l) => l.name !== 'Background') ?? next[next.length - 1]
      setActiveLayerId(fallback.id)
    }

    commitDocument(next, elements)
    refreshLayerThumbnails()
    repaintRef.current()
  }, [activeLayerId, commitDocument, elements, refreshLayerThumbnails])

  const deleteElement = useCallback((elementId: string) => {
    const next = elements.filter((el) => el.id !== elementId)
    commitDocument(layersRef.current, next)
    setSelectedIds((prev) => prev.filter((id) => id !== elementId))
    repaintRef.current()
  }, [commitDocument, elements])

  const updateTransform = useCallback((patch: Partial<StudioTransformFields>) => {
    const elementId = selectedIds[0]

    if (!elementId) {
      if (patch.opacity !== undefined) {
        const opacity = Math.min(100, Math.max(0, patch.opacity)) / 100
        const next = layersRef.current.map((layer) =>
          layer.id === activeLayerId ? { ...layer, opacity } : layer,
        )
        layersRef.current = next
        setLayers(next)
        commitDocument(next, elements)
        repaintRef.current()
      }
      if (patch.w !== undefined || patch.h !== undefined) {
        onDocumentSizeChange?.(
          patch.w ?? documentWidth,
          patch.h ?? documentHeight,
        )
      }
      return
    }

    const next = elements.map((el) => {
      if (el.id !== elementId) return el
      const updated = applyTransformPatchToElement(
        el,
        patch,
        documentWidth,
        documentHeight,
        workingSize.width,
        workingSize.height,
      )
      if (patch.opacity !== undefined && updated.kind === 'stroke') {
        return { ...updated, opacity: patch.opacity / 100 }
      }
      return updated
    })
    commitDocument(layersRef.current, next)
    setElements(next)
  }, [activeLayerId, commitDocument, documentHeight, documentWidth, elements, onDocumentSizeChange, selectedIds, workingSize.height, workingSize.width])

  const updateDocumentSize = useCallback((width: number, height: number) => {
    onDocumentSizeChange?.(Math.max(1, width), Math.max(1, height))
  }, [onDocumentSizeChange])

  const blitPaintFrameToDisplay = useCallback((dirty?: BlitDirtyRect | null) => {
    const canvas = canvasRef.current
    const cache = paintFrameCacheRef.current
    if (!canvas || !cache) return
    const ctx = canvas.getContext('2d', { desynchronized: true })
    if (!ctx) return
    const rect = dirty ?? paintDragRef.current?.dirty ?? null
    blitPaintFrame(ctx, cache, layersRef.current, rect)
  }, [])

  const repaint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderScene(
      ctx,
      layersRef.current,
      renderElementsRef.current ?? elements,
      baseImageRef.current,
      draft,
      selectedIds,
      paintDragRef.current ? activeLayerId : null,
      repaint,
      onionSkinRef.current,
    )
  }, [activeLayerId, draft, elements, selectedIds])

  repaintRef.current = repaint

  useEffect(() => {
    const prev = workingSizeRef.current
    if (prev.width === workingSize.width && prev.height === workingSize.height) return

    const resizedLayers = resizePaintLayers(layersRef.current, workingSize)

    setElements((current) => {
      const next = scaleCanvasElements(current, prev, workingSize)
      layersRef.current = resizedLayers
      commitDocument(resizedLayers, next)
      return next
    })

    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = workingSize.width
      canvas.height = workingSize.height
      canvas.getContext('2d', { alpha: true, desynchronized: true })
    }

    workingSizeRef.current = workingSize
    paintFrameCacheRef.current = null
    repaintRef.current()
    refreshLayerThumbnails()
  }, [commitDocument, refreshLayerThumbnails, workingSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width === workingSize.width && canvas.height === workingSize.height) return
    canvas.width = workingSize.width
    canvas.height = workingSize.height
    canvas.getContext('2d', { alpha: true, desynchronized: true })
    workingSizeRef.current = workingSize
    repaintRef.current()
  }, [workingSize.height, workingSize.width])

  useEffect(() => {
    if (documentReadyRef.current) return
    documentReadyRef.current = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fitToView()
      })
    })
  }, [documentWidth, documentHeight, fitToView])

  useEffect(() => {
    if (!imageUrl) {
      baseImageRef.current = null
      repaint()
      return
    }
    let cancelled = false
    loadBaseImage(imageUrl)
      .then((img) => {
        if (!cancelled) {
          baseImageRef.current = img
          repaint()
        }
      })
      .catch(() => {
        baseImageRef.current = null
      })
    return () => {
      cancelled = true
    }
  }, [imageUrl, repaint])

  useEffect(() => {
    if (paintDragRef.current) return
    if (skipNextLayersEffectRef.current) {
      skipNextLayersEffectRef.current = false
      return
    }
    repaint()
    scheduleLayerThumbnails()
  }, [layers, elements, draft, selectedIds, repaint, scheduleLayerThumbnails])

  useEffect(() => {
    const bgLayer = layersRef.current.find((layer) => layer.name === 'Background')
    if (!bgLayer) return
    fillBackgroundLayer(bgLayer, background)
    repaint()
    refreshLayerThumbnails()
  }, [background, repaint, refreshLayerThumbnails])

  useEffect(() => {
    if (!initialDocument?.layers?.length) return

    layersRef.current = initialDocument.layers
    setLayers(initialDocument.layers)
    setElements(initialDocument.elements)
    setActiveLayerId(resolveActiveLayerId(initialDocument.layers, initialDocument.activeLayerId))

    historyRef.current = [
      { layers: snapshotLayersCanvas(initialDocument.layers), elements: initialDocument.elements },
    ]
    historyIndexRef.current = 0
    syncHistoryFlags()

    const layerSize = readRestoredLayerPixelSize(initialDocument.layers)
    const canvas = canvasRef.current
    if (layerSize && canvas) {
      canvas.width = layerSize.width
      canvas.height = layerSize.height
      workingSizeRef.current = layerSize
    }

    requestAnimationFrame(() => {
      repaintRef.current()
      refreshLayerThumbnails()
    })
  }, [initialDocument, refreshLayerThumbnails, syncHistoryFlags])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceHeld(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const pushElement = useCallback((el: CanvasElement) => {
    commitDocument(layersRef.current, [...elements, el])
  }, [commitDocument, elements])

  const paintOnLayer = useCallback((points: BrushPoint[], erase?: boolean, smudge?: boolean, flushDisplay = true): number => {
    const layer = getActiveLayer()
    if (layer.locked) return 0
    const ctx = layer.canvas.getContext('2d', { desynchronized: true })
    if (!ctx || points.length < 1) return 0

    const size = erase ? toolSettings.eraserSize : toolSettings.brushSize
    const opacity = erase ? 1 : smudge ? toolSettings.smudgeStrength : toolSettings.brushOpacity
    const color = smudge ? foreground : erase ? '#000000' : foreground
    let dabRadius = size

    if (points.length === 1) {
      dabRadius = paintDab(ctx, points[0].x, points[0].y, size * (0.35 + points[0].pressure * 0.95), color, opacity, toolSettings.brushHardness, erase)
    } else {
      const last = points[points.length - 2]
      const next = points[points.length - 1]
      if (smudge) {
        dabRadius = paintBrushSegmentsBatch(ctx, [{ from: last, to: next }], color, size, opacity, toolSettings.brushHardness, false, true)
      } else {
        dabRadius = paintBrushSegment(ctx, last, next, color, size, opacity, toolSettings.brushHardness, erase)
      }
    }

    if (!flushDisplay) return dabRadius

    if (paintFrameCacheRef.current) {
      blitPaintFrameToDisplay()
    } else {
      repaint()
    }
    return dabRadius
  }, [blitPaintFrameToDisplay, foreground, getActiveLayer, repaint, toolSettings])

  const flushPendingPaint = useCallback(() => {
    paintRafRef.current = null
    const drag = paintDragRef.current
    if (!drag) {
      pendingPaintSamplesRef.current = []
      return
    }

    if (!paintFrameCacheRef.current) {
      paintFrameCacheRef.current = buildPaintFrameCache(
        layersRef.current,
        activeLayerId,
        elementsRef.current,
        baseImageRef.current,
        draft,
        selectedIds,
      )
    }

    const incoming = pendingPaintSamplesRef.current
    pendingPaintSamplesRef.current = []

    const erase = effectiveToolRef.current === 'erase'
    const smudge = effectiveToolRef.current === 'smudge'
    const settings = toolSettingsRef.current
    const size = erase ? settings.eraserSize : settings.brushSize
    const opacity = erase ? 1 : smudge ? settings.smudgeStrength : settings.brushOpacity
    const color = smudge ? foregroundRef.current : erase ? '#000000' : foregroundRef.current
    const hardness = settings.brushHardness
  const canvasSize = workingSizeRef.current

    let prevPoint = lastPaintPoint.current
    let segmentStart = drag.points[drag.points.length - 1]
    const segments: BrushSegment[] = []

    const remaining = consumeWithinBudget(incoming, PAINT_FRAME_BUDGET_MS, (sample) => {
      const stabilized = stabilizePoint(prevPoint, sample.point, settings.streamline)
      const brushPoint: BrushPoint = { ...stabilized, pressure: sample.pressure }
      segments.push({ from: segmentStart, to: brushPoint })
      drag.points.push(brushPoint)
      segmentStart = brushPoint
      prevPoint = stabilized
      drag.dirty = expandBlitDirtyRect(
        drag.dirty,
        brushPoint.x,
        brushPoint.y,
        size,
        canvasSize.width,
        canvasSize.height,
      )
    })

    if (remaining.length) {
      pendingPaintSamplesRef.current = remaining.concat(pendingPaintSamplesRef.current)
    }

    if (segments.length) {
      const layer = getActiveLayer()
      if (!layer.locked) {
        const ctx = layer.canvas.getContext('2d', { desynchronized: true })
        if (ctx) {
          const maxRadius = paintBrushSegmentsBatch(ctx, segments, color, size, opacity, hardness, erase, smudge)
          const last = segments[segments.length - 1]?.to
          if (last) {
            drag.dirty = expandBlitDirtyRect(
              drag.dirty,
              last.x,
              last.y,
              maxRadius,
              canvasSize.width,
              canvasSize.height,
            )
          }
        }
      }
      lastPaintPoint.current = prevPoint
      blitPaintFrameToDisplay(drag.dirty)
    }

    if (pendingPaintSamplesRef.current.length) {
      paintRafRef.current = requestAnimationFrame(flushPendingPaint)
    }
  }, [activeLayerId, blitPaintFrameToDisplay, draft, getActiveLayer, selectedIds])

  const effectiveTool = spaceHeld || activeTool === 'hand' ? 'hand' : activeTool
  const effectiveToolRef = useRef(effectiveTool)
  const toolSettingsRef = useRef(toolSettings)
  effectiveToolRef.current = effectiveTool
  toolSettingsRef.current = toolSettings

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    const point = getCanvasPoint(e.clientX, e.clientY)

    if (effectiveTool === 'hand') {
      setDrag({ mode: 'pan', startClient: { x: e.clientX, y: e.clientY }, origin: getPan() })
      return
    }

    if (effectiveTool === 'zoom') {
      setDrag({
        mode: 'zoom-scrub',
        startClient: { x: e.clientX, y: e.clientY },
        startZoom: getZoom(),
        moved: false,
      })
      return
    }

    if (effectiveTool === 'select') {
      const hit = [...elements].reverse().find((el) => hitTestElement(el, point))
      if (hit) {
        setSelectedIds([hit.id])
        setDrag({ mode: 'move', start: point, elementIds: [hit.id] })
      } else {
        setSelectedIds([])
        setDrag({ mode: 'marquee', start: point, current: point })
      }
      return
    }

    if (isPaintTool(effectiveTool)) {
      const layer = getActiveLayer()
      if (!guardPixelEdit(layer)) return
      const stabilized = stabilizePoint(lastPaintPoint.current, point, toolSettings.streamline)
      const brushPoint: BrushPoint = { ...stabilized, pressure: pressureFromEvent(e) }
      lastPaintPoint.current = stabilized
      const snapshot = snapshotLayerCanvas(layer)
      const dabRadius = (effectiveTool === 'erase' ? toolSettings.eraserSize : toolSettings.brushSize) * 0.65
      paintDragRef.current = {
        points: [brushPoint],
        snapshot,
        dirty: expandBlitDirtyRect(
          null,
          brushPoint.x,
          brushPoint.y,
          dabRadius,
          workingSizeRef.current.width,
          workingSizeRef.current.height,
        ),
      }
      setIsPainting(true)
      paintOnLayer([brushPoint], effectiveTool === 'erase', effectiveTool === 'smudge', false)
      requestAnimationFrame(() => {
        if (!paintDragRef.current) return
        paintFrameCacheRef.current = buildPaintFrameCache(
          layersRef.current,
          activeLayerId,
          elementsRef.current,
          baseImageRef.current,
          draft,
          selectedIds,
        )
        blitPaintFrameToDisplay(paintDragRef.current.dirty)
      })
      return
    }

    if (effectiveTool === 'fill') {
      const layer = getActiveLayer()
      if (!guardPixelEdit(layer)) return
      const ctx = layer.canvas.getContext('2d')
      if (!ctx) return
      const fillData = floodFillCanvas(ctx, point.x, point.y, foreground)
      if (fillData) {
        ctx.putImageData(fillData, 0, 0)
        repaint()
        commitPaintStroke()
        scheduleLayerThumbnails([layer.id])
      }
      return
    }

    if (effectiveTool === 'gradient') {
      setDrag({ mode: 'gradient', start: point, current: point })
      return
    }

    if (effectiveTool === 'shape') {
      setDrag({ mode: 'shape', start: point, current: point })
      return
    }

    if (effectiveTool === 'frame') {
      setDrag({ mode: 'frame', start: point, current: point })
      return
    }

    if (effectiveTool === 'text') {
      setTextPrompt(point)
      return
    }

    if (effectiveTool === 'sticker') {
      pushElement({ id: uid(), kind: 'sticker', x: point.x, y: point.y, size: 48, emoji: toolSettings.stickerEmoji })
      return
    }

    if (effectiveTool === 'image') {
      if (!imageUrl?.trim()) {
        onPaintBlockedRef.current?.('no_image')
        return
      }
      pushElement({
        id: uid(),
        kind: 'image',
        x: point.x - 120,
        y: point.y - 120,
        w: 240,
        h: 240,
        src: imageUrl ?? '',
      })
    }
  }, [
    commitDocument,
    commitPaintStroke,
    effectiveTool,
    elements,
    activeLayerId,
    draft,
    selectedIds,
    foreground,
    getActiveLayer,
    guardPixelEdit,
    getCanvasPoint,
    getPan,
    getZoom,
    imageUrl,
    paintOnLayer,
    pushElement,
    repaint,
    scheduleLayerThumbnails,
    setPanImmediate,
    toolSettings,
    zoomAt,
  ])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const point = getCanvasPoint(e.clientX, e.clientY)
    const paintingStroke = Boolean(paintDragRef.current)
    const size = workingSizeRef.current

    if (isPaintTool(effectiveTool) && !paintingStroke) {
      const brushSize = effectiveTool === 'erase' ? toolSettings.eraserSize : toolSettings.brushSize
      const color = effectiveTool === 'erase' ? '#ffffff' : foreground
      const opacity =
        effectiveTool === 'brush' ? toolSettings.brushOpacity : effectiveTool === 'smudge' ? toolSettings.smudgeStrength : 1
      const preview = { x: point.x, y: point.y, size: brushSize, color, opacity }
      brushPreviewStateRef.current = preview
      applyBrushPreview(brushPreviewRef.current, preview, size.width, size.height)
    } else if (!paintingStroke) {
      brushPreviewStateRef.current = null
      applyBrushPreview(brushPreviewRef.current, null, size.width, size.height)
    }

    if (paintDragRef.current) {
      const coalesced =
        typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent]

      for (const event of coalesced) {
        const sample = getCanvasPoint(event.clientX, event.clientY)
        pendingPaintSamplesRef.current.push({
          point: sample,
          pressure: pressureFromEvent(event),
        })
      }

      if (paintRafRef.current === null) {
        paintRafRef.current = requestAnimationFrame(flushPendingPaint)
      }
      return
    }

    if (!drag) return

    if (drag.mode === 'pan') {
      setPanImmediate({
        x: drag.origin.x + (e.clientX - drag.startClient.x),
        y: drag.origin.y + (e.clientY - drag.startClient.y),
      })
      return
    }

    if (drag.mode === 'zoom-scrub') {
      const dy = drag.startClient.y - e.clientY
      const moved = drag.moved || Math.abs(dy) > 3
      if (moved) {
        const next = Math.min(
          VIEWPORT_MAX_ZOOM,
          Math.max(VIEWPORT_MIN_ZOOM, drag.startZoom * Math.exp(dy * 0.009)),
        )
        const viewport = viewportRef.current
        if (viewport) {
          const rect = viewport.getBoundingClientRect()
          const factor = next / getZoom()
          if (Math.abs(factor - 1) > 0.0005) {
            zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor)
          }
        }
      }
      if (moved && !drag.moved) setDrag({ ...drag, moved: true })
      return
    }

    if (drag.mode === 'marquee') {
      setDrag({ ...drag, current: point })
      return
    }

    if (drag.mode === 'move') {
      const dx = point.x - drag.start.x
      const dy = point.y - drag.start.y
      const moved = elementsRef.current.map((el) => {
        if (!drag.elementIds.includes(el.id)) return el
        if (el.kind === 'stroke') {
          return { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
        }
        if ('x' in el && 'y' in el && typeof el.x === 'number') return { ...el, x: el.x + dx, y: el.y + dy }
        if (el.kind === 'gradient') {
          return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy }
        }
        return el
      })
      renderElementsRef.current = moved
      repaintRef.current()
      setDrag({ ...drag, start: point })
      return
    }

    if (drag.mode === 'shape') {
      const x = Math.min(drag.start.x, point.x)
      const y = Math.min(drag.start.y, point.y)
      const w = Math.abs(point.x - drag.start.x)
      const h = Math.abs(point.y - drag.start.y)
      setDraft({
        id: 'draft',
        kind: 'shape',
        shape: toolSettings.shape,
        x,
        y,
        w: e.shiftKey ? Math.max(w, h) : w,
        h: e.shiftKey ? Math.max(w, h) : h,
        color: foreground,
        strokeWidth: toolSettings.strokeWidth,
        filled: toolSettings.shapeFilled,
      })
      setDrag({ ...drag, current: point })
      return
    }

    if (drag.mode === 'gradient') {
      setDraft({
        id: 'draft',
        kind: 'gradient',
        x1: drag.start.x,
        y1: drag.start.y,
        x2: point.x,
        y2: point.y,
        from: foreground,
        to: background,
      })
      setDrag({ ...drag, current: point })
      return
    }

    if (drag.mode === 'frame') {
      const x = Math.min(drag.start.x, point.x)
      const y = Math.min(drag.start.y, point.y)
      setDraft({
        id: 'draft',
        kind: 'frame',
        x,
        y,
        w: Math.abs(point.x - drag.start.x),
        h: Math.abs(point.y - drag.start.y),
        color: foreground,
        thickness: toolSettings.frameThickness,
      })
      setDrag({ ...drag, current: point })
    }
  }, [background, drag, effectiveTool, flushPendingPaint, foreground, getCanvasPoint, getZoom, repaint, setPanImmediate, toolSettings, viewportRef, zoomAt])

  const handlePointerUp = useCallback((e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (paintDragRef.current) {
      if (paintRafRef.current !== null) {
        cancelAnimationFrame(paintRafRef.current)
        paintRafRef.current = null
        flushPendingPaint()
      }
      skipNextLayersEffectRef.current = true
      commitPaintStroke()
      paintDragRef.current = null
      paintFrameCacheRef.current = null
      lastPaintPoint.current = null
      setIsPainting(false)
      repaintRef.current()
      scheduleLayerThumbnails([activeLayerId])
      return
    }

    if (!drag) return

    if (drag.mode === 'zoom-scrub' && !drag.moved && e) {
      const factor = e.altKey ? 1 / 1.2 : 1.2
      zoomAt(e.clientX, e.clientY, factor)
    }

    if (drag.mode === 'shape' && draft?.kind === 'shape' && draft.w > 4 && draft.h > 4) {
      pushElement({ ...draft, id: uid() })
    }

    if (drag.mode === 'gradient' && draft?.kind === 'gradient') {
      pushElement({ ...draft, id: uid() })
    }

    if (drag.mode === 'frame' && draft?.kind === 'frame' && draft.w > 4 && draft.h > 4) {
      pushElement({ ...draft, id: uid() })
    }

    if (drag.mode === 'marquee') {
      const x = Math.min(drag.start.x, drag.current.x)
      const y = Math.min(drag.start.y, drag.current.y)
      const w = Math.abs(drag.current.x - drag.start.x)
      const h = Math.abs(drag.current.y - drag.start.y)
      const hits = elements.filter((el) => {
        const bounds = elementBounds(el)
        if (!bounds) return false
        return bounds.x + bounds.w >= x && bounds.x <= x + w && bounds.y + bounds.h >= y && bounds.y <= y + h
      })
      setSelectedIds(hits.map((el) => el.id))
    }

    if (drag.mode === 'move') {
      const nextElements = renderElementsRef.current ?? elementsRef.current
      renderElementsRef.current = null
      commitDocument(layersRef.current, nextElements)
    }

    lastPaintPoint.current = null
    setDrag(null)
    setDraft(null)
  }, [activeLayerId, commitPaintStroke, draft, drag, elements, flushPendingPaint, pushElement, scheduleLayerThumbnails, zoomAt])

  const submitText = useCallback((text: string) => {
    if (!textPrompt || !text.trim()) {
      setTextPrompt(null)
      return
    }
    pushElement({
      id: uid(),
      kind: 'text',
      x: textPrompt.x,
      y: textPrompt.y,
      text: text.trim(),
      color: foreground,
      fontSize: toolSettings.fontSize,
    })
    setTextPrompt(null)
  }, [foreground, pushElement, textPrompt, toolSettings.fontSize])

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return
    commitDocument(layersRef.current, elements.filter((el) => !selectedIds.includes(el.id)))
    setSelectedIds([])
  }, [commitDocument, elements, selectedIds])

  const cursorClass = `mas-canvas-viewport--tool-${effectiveTool}${spaceHeld ? ' mas-canvas-viewport--space-pan' : ''}`

  const getDocumentSnapshot = useCallback(() => ({
    layers: layersRef.current,
    elements,
    activeLayerId,
  }), [activeLayerId, elements])

  const getLayerSaveVersions = useCallback(() => ({ ...layerSaveVersionRef.current }), [])

  const captureAnimationFrame = useCallback(() => ({
    layers: snapshotLayersCanvas(layersRef.current),
    elements: [...elementsRef.current],
  }), [])

  const applyAnimationFrame = useCallback((layerSnaps: LayerCanvasSnapshot[], nextElements: CanvasElement[]) => {
    const restored = restoreLayerCanvasSnapshot(layersRef.current, layerSnaps)
    layersRef.current = restored
    setLayers(restored)
    setElements(nextElements)
  }, [])

  const setOnionSkinPreview = useCallback((preview: OnionSkinPreview | null) => {
    onionSkinRef.current = preview
    repaintRef.current()
  }, [])

  return {
    canvasRef,
    viewportRef,
    pan,
    scale,
    rotation,
    canvasWidth: workingSize.width,
    canvasHeight: workingSize.height,
    documentWidth,
    documentHeight,
    layers,
    elements,
    selection,
    layerThumbnails,
    selectedIds,
    textPrompt,
    brushPreviewRef,
    cursorClass,
    isPainting,
    canUndo,
    canRedo,
    undo,
    redo,
    submitText,
    deleteSelected,
    selectLayer,
    selectElement,
    clearSelection,
    addLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    deleteElement,
    updateTransform,
    updateDocumentSize,
    getDocumentSnapshot,
    getLayerSaveVersions,
    captureAnimationFrame,
    applyAnimationFrame,
    setOnionSkinPreview,
    zoomByStep,
    fitToView,
    resetView,
    zoomToActual,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => {
        brushPreviewStateRef.current = null
        applyBrushPreview(brushPreviewRef.current, null, workingSizeRef.current.width, workingSizeRef.current.height)
        handlePointerUp(e)
      },
    },
  }
}

export { DEFAULT_TOOL_SETTINGS }
export type { ToolSettings }
export type StudioCanvasController = ReturnType<typeof useStudioCanvas>
