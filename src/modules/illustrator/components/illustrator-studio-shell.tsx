import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog'
import { toast } from '@/shared/components/ui/sonner'
import { StudioAiDock } from '@/modules/illustrator/components/studio/studio-ai-dock'
import { StudioAssetLibrary } from '@/modules/illustrator/components/studio/studio-asset-library'
import { StudioCanvasStage } from '@/modules/illustrator/components/studio/studio-canvas-stage'
import { StudioColorOrb, swapColors } from '@/modules/illustrator/components/studio/studio-color-orb'
import { StudioDocumentContext } from '@/modules/illustrator/components/studio/studio-document-context'
import { StudioResizeHandle } from '@/modules/illustrator/components/studio/studio-resize-handle'
import { StudioRightStack } from '@/modules/illustrator/components/studio/studio-right-stack'
import { StudioTimeline } from '@/modules/illustrator/components/studio/studio-timeline'
import { StudioToolRail } from '@/modules/illustrator/components/studio/studio-tool-rail'
import { StudioTopBar } from '@/modules/illustrator/components/studio/studio-top-bar'
import type { AssetTabId, StudioArtworkDraft, StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import { DEFAULT_TOOL_SETTINGS, useStudioCanvas } from '@/modules/illustrator/components/studio/use-studio-canvas'
import { DOCUMENT_BG } from '@/modules/illustrator/components/studio/studio-canvas-model'
import { useStudioAutosave } from '@/modules/illustrator/hooks/use-studio-autosave'
import { getIllustratorArtwork } from '@/modules/illustrator/api/illustrator.api'
import { loadPersistedStudioDocument } from '@/modules/illustrator/lib/studio-autosave-db'
import {
  mergeStudioDocuments,
  serializeStudioDocument,
  serializeStudioDocumentAsync,
  toInitialStudioDocument,
  type PersistedStudioDocument,
  type SerializedLayerSnapshot,
} from '@/modules/illustrator/lib/studio-document-persistence'
import { createStudioPreviewDataUrl } from '@/modules/illustrator/lib/studio-preview'
import { usePanelResize } from '@/modules/illustrator/components/studio/use-panel-resize'
import {
  SequenceEngineProvider,
} from '@/modules/illustrator/context/sequence-engine-context'
import { isSequenceEngineEnabled } from '@/modules/illustrator/lib/sequence/feature-flag'
import type { ExportProgress } from '@/modules/illustrator/lib/export/export.types'
import { SequenceEngineBindings, type SequencePaintPayload } from '@/modules/illustrator/components/studio/sequence-engine-bindings'
import type { PersistedSequenceBundle } from '@/modules/illustrator/lib/sequence/sequence-persistence'
import '@/modules/illustrator/styles/illustrator-studio.css'

export type { StudioArtworkDraft } from '@/modules/illustrator/components/studio/studio-types'

type IllustratorStudioShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  artwork?: StudioArtworkDraft
  onPortfolioChange?: () => void
}

type ColorTarget = 'foreground' | 'background'

const TOOL_SHORTCUTS: Record<string, StudioToolId> = {
  v: 'select',
  b: 'brush',
  e: 'erase',
  s: 'smudge',
  g: 'fill',
  u: 'gradient',
  r: 'shape',
  t: 'text',
  i: 'image',
  k: 'sticker',
  f: 'frame',
  a: 'ai',
  z: 'zoom',
  h: 'hand',
}

type StudioWorkspaceProps = {
  artwork?: StudioArtworkDraft
  onClose: () => void
  onPortfolioChange?: () => void
  onFlushSaveReady?: (flushSave: ((options?: { forcePreview?: boolean }) => Promise<void>) | null) => void
}

type StudioWorkspaceInnerProps = StudioWorkspaceProps & {
  persisted: PersistedStudioDocument | null
}

function StudioWorkspace({ artwork, onClose, onPortfolioChange, onFlushSaveReady }: StudioWorkspaceProps) {
  const [persisted, setPersisted] = useState<PersistedStudioDocument | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    if (!artwork?.id || artwork.source === 'feed') {
      setPersisted(null)
      return () => {
        cancelled = true
      }
    }

    void loadPersistedStudioDocument(artwork.id).then((local) => {
      if (cancelled) return

      getIllustratorArtwork(artwork.id)
        .then((detail) => {
          if (!cancelled) {
            const server = detail.studioState as PersistedStudioDocument | null
            setPersisted(mergeStudioDocuments(server, local))
          }
        })
        .catch(() => {
          if (!cancelled) setPersisted(local)
        })
    })

    return () => {
      cancelled = true
    }
  }, [artwork?.id, artwork?.source])

  if (persisted === undefined) {
    return <div className="mas-studio__workspace mas-studio__workspace--loading" aria-busy="true" />
  }

  return (
    <StudioWorkspaceInner
      key={`${artwork?.id ?? 'new'}-${persisted?.savedAt ?? 'empty'}`}
      artwork={artwork}
      onClose={onClose}
      persisted={persisted}
      onPortfolioChange={onPortfolioChange}
      onFlushSaveReady={onFlushSaveReady}
    />
  )
}

function StudioWorkspaceInner({
  artwork,
  onClose,
  persisted,
  onPortfolioChange,
  onFlushSaveReady,
}: StudioWorkspaceInnerProps) {
  const [activeTool, setActiveTool] = useState<StudioToolId>('brush')
  const [assetTab, setAssetTab] = useState<AssetTabId>('assets')
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [colorOpen, setColorOpen] = useState(false)
  const [colorTarget, setColorTarget] = useState<ColorTarget>('foreground')
  const [foreground, setForeground] = useState(persisted?.colors.foreground ?? '#111111')
  const [background, setBackground] = useState(persisted?.colors.background ?? DOCUMENT_BG)
  const [toolSettings, setToolSettings] = useState(persisted?.toolSettings ?? DEFAULT_TOOL_SETTINGS)
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })
  const [docSize, setDocSize] = useState({
    width: persisted?.document.width ?? artwork?.width ?? 3000,
    height: persisted?.document.height ?? artwork?.height ?? 3000,
    dpi: persisted?.document.dpi ?? artwork?.dpi ?? 300,
    colorProfile: persisted?.document.colorProfile ?? artwork?.colorProfile ?? 'sRGB' as const,
  })

  const initialDocument = useMemo(
    () => (persisted ? toInitialStudioDocument(persisted) : null),
    [persisted],
  )

  useEffect(() => {
    if (!artwork || persisted) return
    setDocSize({
      width: artwork.width ?? 3000,
      height: artwork.height ?? 3000,
      dpi: artwork.dpi ?? 300,
      colorProfile: artwork.colorProfile ?? 'sRGB',
    })
  }, [artwork, persisted])

  const assets = usePanelResize(280, 200, 440)
  const right = usePanelResize(280, 220, 400)
  const timeline = usePanelResize(200, 140, 360)
  const layers = usePanelResize(200, 120, 480)
  const props = usePanelResize(180, 100, 400)

  const doc = useMemo(
    () => ({
      title: artwork?.title?.trim() || 'Untitled Artwork',
      status: artwork?.status ?? 'draft',
      width: docSize.width,
      height: docSize.height,
      dpi: docSize.dpi,
      colorProfile: docSize.colorProfile,
      imageUrl: artwork?.source === 'feed' ? artwork?.imageUrl : undefined,
    }),
    [artwork, docSize.colorProfile, docSize.dpi, docSize.height, docSize.width],
  )

  const autosaveMarkDirtyRef = useRef<(options?: { immediate?: boolean }) => void>(() => {})
  const buildPersistedDocumentRef = useRef<() => PersistedStudioDocument | null>(() => null)
  const savedLayerVersionsRef = useRef<Record<string, number>>({})
  const cachedSavedLayersRef = useRef<SerializedLayerSnapshot[]>([])
  const sequencePaintRef = useRef<(payload: SequencePaintPayload) => void>(() => {})
  const sequenceExportRef = useRef<() => PersistedSequenceBundle>(() => ({
    state: {} as PersistedSequenceBundle['state'],
    drawingPayloads: {},
  }))
  const sequenceUndoRef = useRef<{
    undo: () => boolean
    redo: () => boolean
    canUndo: () => boolean
    canRedo: () => boolean
    preferUndo: () => boolean
    clearPrefer: () => void
  } | null>(null)
  const sequenceEscapeRef = useRef<{
    isNestedEdit: () => boolean
    closeInnerEdit: () => boolean
  } | null>(null)
  const sequenceActionsRef = useRef<{
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
  } | null>(null)
  const sequenceValidatePaintRef = useRef<(layerId: string) => boolean>(() => true)
  const [sequenceRevision, setSequenceRevision] = useState(0)

  const canvas = useStudioCanvas({
    activeTool,
    foreground,
    background,
    zoom,
    imageUrl: doc.imageUrl,
    toolSettings,
    documentWidth: doc.width,
    documentHeight: doc.height,
    initialDocument,
    onDocumentCommit: () => {
      autosaveMarkDirtyRef.current()
    },
    onPaintStrokeCommit: isSequenceEngineEnabled()
      ? (payload) => sequencePaintRef.current(payload)
      : undefined,
    canPaintOnLayer: isSequenceEngineEnabled()
      ? (layerId) => sequenceValidatePaintRef.current(layerId)
      : undefined,
    onPaintBlocked: (reason) => {
      if (reason === 'sequence_block') {
        toast.error('Is time pe sequence/reference clip hai — hold frame pe jao')
      } else if (reason === 'background') {
        toast.error('Background pe edit nahi — koi layer select karo')
      } else if (reason === 'locked') {
        toast.error('Layer locked hai — pehle unlock karo')
      } else if (reason === 'no_image') {
        toast.error('Image tool ke liye artwork image chahiye')
      }
    },
    onZoomChange: setZoom,
    onDocumentSizeChange: (width, height) => setDocSize((prev) => ({ ...prev, width, height })),
  })

  const buildPersistedDocument = useCallback(() => {
    if (!artwork?.id) return null
    const snapshot = canvas.getDocumentSnapshot()
    return serializeStudioDocument({
      artwork: {
        ...artwork,
        title: doc.title,
        status: doc.status,
      },
      document: {
        width: doc.width,
        height: doc.height,
        dpi: doc.dpi,
        colorProfile: doc.colorProfile,
      },
      colors: { foreground, background },
      toolSettings,
      activeLayerId: snapshot.activeLayerId,
      layers: snapshot.layers,
      elements: snapshot.elements,
      sequence: isSequenceEngineEnabled() ? sequenceExportRef.current() : undefined,
    })
  }, [
    artwork,
    background,
    canvas.getDocumentSnapshot,
    doc.colorProfile,
    doc.dpi,
    doc.height,
    doc.status,
    doc.title,
    doc.width,
    foreground,
    toolSettings,
  ])

  const buildPersistedDocumentAsync = useCallback(async () => {
    if (!artwork?.id) return null
    const snapshot = canvas.getDocumentSnapshot()
    return serializeStudioDocumentAsync(
      {
        artwork: {
          ...artwork,
          title: doc.title,
          status: doc.status,
        },
        document: {
          width: doc.width,
          height: doc.height,
          dpi: doc.dpi,
          colorProfile: doc.colorProfile,
        },
        colors: { foreground, background },
        toolSettings,
        activeLayerId: snapshot.activeLayerId,
        layers: snapshot.layers,
        elements: snapshot.elements,
        sequence: isSequenceEngineEnabled() ? sequenceExportRef.current() : undefined,
      },
      {
        layerVersions: canvas.getLayerSaveVersions(),
        savedLayerVersions: savedLayerVersionsRef.current,
        cachedLayers: cachedSavedLayersRef.current,
      },
    )
  }, [
    artwork,
    background,
    canvas.getDocumentSnapshot,
    canvas.getLayerSaveVersions,
    doc.colorProfile,
    doc.dpi,
    doc.height,
    doc.status,
    doc.title,
    doc.width,
    foreground,
    toolSettings,
  ])

  buildPersistedDocumentRef.current = buildPersistedDocument

  const { status: saveStatus, markDirty, flushSave, seedFingerprint } = useStudioAutosave({
    enabled: Boolean(artwork?.id && artwork.source !== 'feed'),
    isPainting: canvas.isPainting,
    getDocument: buildPersistedDocument,
    buildDocumentAsync: buildPersistedDocumentAsync,
    getPreviewDataUrl: () => {
      const snapshot = canvas.getDocumentSnapshot()
      return createStudioPreviewDataUrl(snapshot.layers, snapshot.activeLayerId, snapshot.elements)
    },
    onSaved: (savedDoc) => {
      cachedSavedLayersRef.current = savedDoc.layers
      savedLayerVersionsRef.current = canvas.getLayerSaveVersions()
      onPortfolioChange?.()
    },
  })

  autosaveMarkDirtyRef.current = markDirty

  useEffect(() => {
    seedFingerprint(persisted)
    if (persisted?.layers?.length) {
      cachedSavedLayersRef.current = persisted.layers
      savedLayerVersionsRef.current = Object.fromEntries(persisted.layers.map((layer) => [layer.id, 0]))
    }
  }, [persisted, seedFingerprint])

  useEffect(() => {
    onFlushSaveReady?.(flushSave)
    return () => onFlushSaveReady?.(null)
  }, [flushSave, onFlushSaveReady])

  const markSettingsDirty = useCallback(() => {
    markDirty()
  }, [markDirty])

  const documentContextValue = useMemo(
    () => ({
      snapshot: {
        layers: canvas.layers,
        elements: canvas.elements,
        selection: canvas.selection,
        documentWidth: doc.width,
        documentHeight: doc.height,
        documentDpi: doc.dpi,
        documentColorProfile: doc.colorProfile,
        canvasWidth: canvas.canvasWidth,
        canvasHeight: canvas.canvasHeight,
        layerThumbnails: canvas.layerThumbnails,
      },
      actions: {
        selectLayer: canvas.selectLayer,
        selectElement: canvas.selectElement,
        clearSelection: canvas.clearSelection,
        addLayer: canvas.addLayer,
        toggleLayerVisibility: canvas.toggleLayerVisibility,
        toggleLayerLock: canvas.toggleLayerLock,
        deleteLayer: canvas.deleteLayer,
        deleteElement: canvas.deleteElement,
        updateTransform: canvas.updateTransform,
        updateDocumentSize: canvas.updateDocumentSize,
      },
    }),
    [
      canvas.layers,
      canvas.elements,
      canvas.selection,
      canvas.layerThumbnails,
      canvas.selectLayer,
      canvas.selectElement,
      canvas.clearSelection,
      canvas.addLayer,
      canvas.toggleLayerVisibility,
      canvas.toggleLayerLock,
      canvas.deleteLayer,
      canvas.deleteElement,
      canvas.updateTransform,
      canvas.updateDocumentSize,
      doc.width,
      doc.height,
      doc.dpi,
      doc.colorProfile,
      canvas.canvasWidth,
      canvas.canvasHeight,
    ],
  )

  const canvasActionsRef = useRef({
    undo: canvas.undo,
    redo: canvas.redo,
    canUndo: canvas.canUndo,
    canRedo: canvas.canRedo,
    zoomIn: () => canvas.zoomByStep(1),
    zoomOut: () => canvas.zoomByStep(-1),
    zoomFit: () => canvas.fitToView(),
    zoomReset: () => canvas.resetView(),
    zoomActual: () => canvas.zoomToActual(),
  })

  canvasActionsRef.current = {
    undo: canvas.undo,
    redo: canvas.redo,
    canUndo: canvas.canUndo,
    canRedo: canvas.canRedo,
    zoomIn: () => canvas.zoomByStep(1),
    zoomOut: () => canvas.zoomByStep(-1),
    zoomFit: () => canvas.fitToView(),
    zoomReset: () => canvas.resetView(),
    zoomActual: () => canvas.zoomToActual(),
  }

  const performUndo = useCallback(() => {
    const seq = sequenceUndoRef.current
    if (isSequenceEngineEnabled() && seq) {
      if (seq.preferUndo() && seq.canUndo()) {
        seq.undo()
        if (!seq.canUndo()) seq.clearPrefer()
        setSequenceRevision((v) => v + 1)
        return
      }
      if (canvas.canUndo) {
        canvas.undo()
        return
      }
      if (seq.canUndo()) {
        seq.undo()
        setSequenceRevision((v) => v + 1)
      }
      return
    }
    canvas.undo()
  }, [canvas])

  const performRedo = useCallback(() => {
    const seq = sequenceUndoRef.current
    if (isSequenceEngineEnabled() && seq) {
      if (seq.preferUndo() && seq.canRedo()) {
        seq.redo()
        setSequenceRevision((v) => v + 1)
        return
      }
      if (canvas.canRedo) {
        canvas.redo()
        return
      }
      if (seq.canRedo()) {
        seq.redo()
        setSequenceRevision((v) => v + 1)
      }
      return
    }
    canvas.redo()
  }, [canvas])

  useEffect(() => {
    const seq = sequenceUndoRef.current
    setHistoryState((prev) => {
      const canUndo = canvas.canUndo || (seq?.canUndo() ?? false)
      const canRedo = canvas.canRedo || (seq?.canRedo() ?? false)
      return prev.canUndo === canUndo && prev.canRedo === canRedo ? prev : { canUndo, canRedo }
    })
  }, [canvas.canUndo, canvas.canRedo, sequenceRevision])

  const activeColor = colorTarget === 'foreground' ? foreground : background
  const setActiveColor = colorTarget === 'foreground' ? setForeground : setBackground

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (!colorOpen && !settingsOpen && !assetsOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-studio-overlay-trigger]')) return
      if (el.closest('[data-studio-overlay]')) return

      setColorOpen(false)
      setSettingsOpen(false)
      setAssetsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [colorOpen, settingsOpen, assetsOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

      const key = e.key.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) performRedo()
        else performUndo()
        return
      }

      const zoomMod = e.metaKey || e.ctrlKey
      if (zoomMod && (key === '=' || key === '+' || e.code === 'Equal')) {
        e.preventDefault()
        canvasActionsRef.current.zoomIn()
        return
      }
      if (zoomMod && (key === '-' || key === '_' || e.code === 'Minus')) {
        e.preventDefault()
        canvasActionsRef.current.zoomOut()
        return
      }
      if (zoomMod && key === '0') {
        e.preventDefault()
        canvasActionsRef.current.zoomFit()
        return
      }
      if (zoomMod && key === '1') {
        e.preventDefault()
        canvasActionsRef.current.zoomActual()
        return
      }
      if (zoomMod && key === 'r' && e.shiftKey) {
        e.preventDefault()
        canvasActionsRef.current.zoomReset()
        return
      }

      if (!zoomMod && !e.altKey && key === '[') {
        e.preventDefault()
        canvasActionsRef.current.zoomOut()
        return
      }
      if (!zoomMod && !e.altKey && key === ']') {
        e.preventDefault()
        canvasActionsRef.current.zoomIn()
        return
      }

      if (key === 'x' && !e.metaKey && !e.ctrlKey) {
        const swapped = swapColors(foreground, background)
        setForeground(swapped.foreground)
        setBackground(swapped.background)
        return
      }

      if (key === 'l' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setAssetsOpen((v) => !v)
        return
      }

      if (zoomMod && key === 'g' && !e.shiftKey) {
        if (isSequenceEngineEnabled() && sequenceActionsRef.current?.groupCompound()) {
          e.preventDefault()
          setSequenceRevision((v) => v + 1)
          toast.success('Compound created')
        }
        return
      }

      if (key === 'Escape') {
        if (sequenceEscapeRef.current?.isNestedEdit()) {
          sequenceEscapeRef.current.closeInnerEdit()
          setSequenceRevision((v) => v + 1)
          return
        }
        void onClose()
        return
      }

      const tool = TOOL_SHORTCUTS[key]
      if (tool && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setActiveTool(tool)
        if (tool !== 'ai') setColorOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [foreground, background, onClose, performRedo, performUndo])

  const showAi = activeTool === 'ai'
  const showContext = activeTool === 'select'

  const layoutStyle = {
    '--mas-assets-w': assetsOpen ? `${assets.size}px` : '0px',
    '--mas-right-w': `${right.size}px`,
    '--mas-timeline-h': `${timeline.size}px`,
    '--mas-layers-h': `${layers.size}px`,
    '--mas-props-h': `${props.size}px`,
  } as CSSProperties

  const workspace = (
    <StudioDocumentContext.Provider value={documentContextValue}>
      <div
        className={`mas-studio__workspace${assetsOpen ? '' : ' mas-studio__workspace--assets-hidden'}`}
        style={layoutStyle}
      >
        <div className="mas-zone mas-zone--rail">
          <StudioTopBar
            title={doc.title}
            status={doc.status}
            zoom={zoom}
            saved={saveStatus === 'saved'}
            saveStatus={saveStatus}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
            onZoomIn={() => canvasActionsRef.current.zoomIn()}
            onZoomOut={() => canvasActionsRef.current.zoomOut()}
            onUndo={performUndo}
            onRedo={performRedo}
            onExportGif={
              isSequenceEngineEnabled()
                ? async (options) => {
                    const exportGif = sequenceActionsRef.current?.exportGif
                    if (!exportGif) throw new Error('Export unavailable')
                    toast.message('Exporting GIF…')
                    const blob = await exportGif({
                      durationMs: 3000,
                      onProgress: options?.onProgress,
                    })
                    toast.success('GIF downloaded')
                    return blob
                  }
                : undefined
            }
            placement="rail"
          />
          <StudioToolRail
            activeTool={activeTool}
            foreground={foreground}
            background={background}
            toolSettings={toolSettings}
            settingsOpen={settingsOpen}
            onSettingsOpenChange={setSettingsOpen}
            onToolChange={(tool) => {
              setActiveTool(tool)
              if (tool !== 'ai') setColorOpen(false)
            }}
            onSwapColors={() => {
              const swapped = swapColors(foreground, background)
              setForeground(swapped.foreground)
              setBackground(swapped.background)
              markSettingsDirty()
            }}
            onToolSettingsChange={(patch) => {
              setToolSettings((prev) => ({ ...prev, ...patch }))
              markSettingsDirty()
            }}
            onColorOpen={(target) => {
              setColorTarget(target)
              setColorOpen(true)
            }}
            assetsOpen={assetsOpen}
            onAssetsToggle={() => setAssetsOpen((v) => !v)}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
            onUndo={performUndo}
            onRedo={performRedo}
          />
          <StudioColorOrb
            open={colorOpen}
            color={activeColor}
            foreground={foreground}
            background={background}
            colorTarget={colorTarget}
            onToggle={() => setColorOpen((v) => !v)}
            onChange={(color) => {
              setActiveColor(color)
              markSettingsDirty()
            }}
            onColorTargetChange={setColorTarget}
          />
        </div>

        {assetsOpen ? (
          <div className="mas-zone mas-zone--assets" data-studio-overlay="assets">
            <StudioAssetLibrary activeTab={assetTab} onTabChange={setAssetTab} />
            <StudioResizeHandle edge="e" onDelta={(d) => assets.setSize((s) => Math.min(440, Math.max(200, s + d)))} />
          </div>
        ) : null}

        <div className="mas-zone mas-zone--canvas">
          <StudioCanvasStage
            title={doc.title}
            showContext={showContext}
            activeTool={activeTool}
            zoom={zoom}
            documentWidth={doc.width}
            documentHeight={doc.height}
            canvas={canvas}
          />
          {showAi ? <StudioAiDock /> : null}
        </div>

        <div className="mas-zone mas-zone--right">
          <StudioResizeHandle edge="w" onDelta={(d) => right.setSize((s) => Math.min(400, Math.max(220, s + d)))} />
          <StudioRightStack
            layersHeight={layers.size}
            propsHeight={props.size}
            onLayersResize={(d) => layers.setSize((s) => Math.min(480, Math.max(120, s + d)))}
            onPropsResize={(d) => props.setSize((s) => Math.min(400, Math.max(100, s + d)))}
          />
        </div>

        <div className="mas-zone mas-zone--timeline">
          <StudioResizeHandle edge="n" onDelta={(d) => timeline.setSize((s) => Math.min(360, Math.max(140, s + d)))} />
          <StudioTimeline
            captureSnapshot={canvas.captureAnimationFrame}
            applySnapshot={canvas.applyAnimationFrame}
            onOnionSkinPreviewChange={canvas.setOnionSkinPreview}
          />
        </div>
      </div>
    </StudioDocumentContext.Provider>
  )

  if (!isSequenceEngineEnabled()) return workspace

  return (
    <SequenceEngineProvider initialBundle={persisted?.sequence}>
      <SequenceEngineBindings
        onPaintReady={(handler) => {
          sequencePaintRef.current = handler
        }}
        onExportReady={(handler) => {
          sequenceExportRef.current = handler
        }}
        onUndoReady={(handlers) => {
          sequenceUndoRef.current = handlers
        }}
        onEscapeReady={(handlers) => {
          sequenceEscapeRef.current = handlers
        }}
        onActionsReady={(handlers) => {
          sequenceActionsRef.current = handlers
        }}
        onValidatePaintReady={(handler) => {
          sequenceValidatePaintRef.current = handler
        }}
        onStoreChange={() => setSequenceRevision((v) => v + 1)}
      />
      {workspace}
    </SequenceEngineProvider>
  )
}

export function IllustratorStudioShell({
  open,
  onOpenChange,
  artwork,
  onPortfolioChange,
}: IllustratorStudioShellProps) {
  const flushSaveRef = useRef<((options?: { forcePreview?: boolean }) => Promise<void>) | null>(null)
  const closingRef = useRef(false)

  const requestClose = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    try {
      await flushSaveRef.current?.({ forcePreview: true })
      onPortfolioChange?.()
      onOpenChange(false)
    } finally {
      closingRef.current = false
    }
  }, [onOpenChange, onPortfolioChange])

  if (!open) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) onOpenChange(true)
        else void requestClose()
      }}
    >
      <DialogContent
        hideCloseButton
        elevated
        overlayClassName="bg-black/90"
        className="mas-studio inset-0 left-0 top-0 h-[100dvh] w-full max-h-none max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-[#090909] p-0 shadow-none"
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          void requestClose()
        }}
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement
          if (target.closest('[data-studio-overlay]')) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement
          if (target.closest('[data-studio-overlay]')) event.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">{artwork?.title?.trim() || 'Untitled Artwork'} — Creative Studio</DialogTitle>
        <div className="mas-studio__ambient" aria-hidden />
        <StudioWorkspace
          key={artwork?.id ?? 'new-draft'}
          artwork={artwork}
          onClose={() => void requestClose()}
          onPortfolioChange={onPortfolioChange}
          onFlushSaveReady={(flush) => {
            flushSaveRef.current = flush
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
