import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eye, EyeOff, Lock, LockOpen, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { PROPERTY_SECTIONS } from '@/modules/illustrator/components/studio/studio-data'
import { formatDocumentAspectRatio } from '@/modules/illustrator/components/studio/studio-canvas-model'
import {
  activeLayerBlendLabel,
  buildLayerPanelRows,
  getTransformForSelection,
  isRowSelected,
  type LayerPanelRow,
} from '@/modules/illustrator/components/studio/studio-layer-panel-utils'
import { useStudioDocument } from '@/modules/illustrator/components/studio/studio-document-context'
import type { StudioLayerPanelActions } from '@/modules/illustrator/components/studio/studio-layer-panel.types'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'
import { StudioResizeHandle } from '@/modules/illustrator/components/studio/studio-resize-handle'
import { cn } from '@/shared/lib/cn'

type StudioRightStackProps = {
  layersHeight: number
  propsHeight: number
  onLayersResize: (delta: number) => void
  onPropsResize: (delta: number) => void
}

type TransformField = 'w' | 'h' | 'x' | 'y' | 'rotate' | 'opacity'

const TRANSFORM_FIELDS: Array<{ key: TransformField; label: string; suffix?: string }> = [
  { key: 'w', label: 'W' },
  { key: 'h', label: 'H' },
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'rotate', label: 'Rotate', suffix: '°' },
  { key: 'opacity', label: 'Opacity', suffix: '%' },
]

function parseFieldValue(raw: string) {
  const cleaned = raw.replace(/[°%]/g, '').trim()
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

function LayerRow({
  row,
  selected,
  actions,
}: {
  row: LayerPanelRow
  selected: boolean
  actions: StudioLayerPanelActions
}) {
  const isPaint = row.kind === 'paint'
  const visible = isPaint ? row.layer.visible : true
  const locked = isPaint ? row.layer.locked : false
  const thumb = isPaint ? row.thumbnail : undefined

  const handleSelect = () => {
    if (row.kind === 'paint') actions.selectLayer(row.layer.id)
    else actions.selectElement(row.element.id)
  }

  const handleDelete = () => {
    if (row.kind === 'paint') actions.deleteLayer(row.layer.id)
    else actions.deleteElement(row.element.id)
  }

  return (
    <div
      className={cn('mas-layer-row', selected && 'mas-layer-row--active', !visible && 'mas-layer-row--hidden')}
    >
      <button type="button" className="mas-layer-row__main" onClick={handleSelect} aria-label={`Select ${row.label}`}>
        {thumb ? (
          <img src={thumb} alt="" className="mas-layer-thumb mas-layer-thumb--image" />
        ) : (
          <span className="mas-layer-thumb" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate">{row.label}</span>
      </button>

      {isPaint ? (
        <>
          <button
            type="button"
            className={cn('mas-layer-action', visible && 'mas-layer-action--on')}
            aria-label={visible ? `Hide ${row.label}` : `Show ${row.label}`}
            aria-pressed={visible}
            onClick={(e) => {
              e.stopPropagation()
              actions.toggleLayerVisibility(row.layer.id)
            }}
          >
            {visible ? <Eye size={13} strokeWidth={1.75} /> : <EyeOff size={13} strokeWidth={1.75} />}
          </button>
          <button
            type="button"
            className={cn('mas-layer-action', locked && 'mas-layer-action--on')}
            aria-label={locked ? `Unlock ${row.label}` : `Lock ${row.label}`}
            aria-pressed={locked}
            disabled={row.layer.name === 'Background'}
            onClick={(e) => {
              e.stopPropagation()
              actions.toggleLayerLock(row.layer.id)
            }}
          >
            {locked ? <Lock size={12} strokeWidth={1.75} /> : <LockOpen size={12} strokeWidth={1.75} />}
          </button>
        </>
      ) : null}

      {row.deletable ? (
        <button
          type="button"
          className="mas-layer-action mas-layer-action--danger"
          aria-label={`Delete ${row.label}`}
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <Trash2 size={12} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}

export function StudioRightStack({
  layersHeight,
  propsHeight,
  onLayersResize,
  onPropsResize,
}: StudioRightStackProps) {
  const document = useStudioDocument()
  const snapshot = document?.snapshot
  const actions = document?.actions

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PROPERTY_SECTIONS.map((s) => [s.id, s.open])),
  )
  const [draftValues, setDraftValues] = useState<Partial<Record<TransformField, string>>>({})
  const [canvasDraft, setCanvasDraft] = useState<{ width: string; height: string } | null>(null)

  const layerRows = useMemo(
    () =>
      snapshot
        ? buildLayerPanelRows(snapshot.layers, snapshot.elements, snapshot.layerThumbnails)
        : [],
    [snapshot],
  )

  const transform = useMemo(
    () =>
      snapshot
        ? getTransformForSelection(
            snapshot.selection,
            snapshot.layers,
            snapshot.elements,
            snapshot.documentWidth,
            snapshot.documentHeight,
            snapshot.canvasWidth,
            snapshot.canvasHeight,
          )
        : null,
    [snapshot],
  )

  const selectionKey = snapshot?.selection
    ? snapshot.selection.kind === 'layer'
      ? `layer:${snapshot.selection.layerId}`
      : `element:${snapshot.selection.elementId}`
    : 'none'

  useEffect(() => {
    setDraftValues({})
    setCanvasDraft(null)
  }, [selectionKey])

  useEffect(() => {
    setCanvasDraft(null)
  }, [snapshot?.documentWidth, snapshot?.documentHeight])

  const handleCanvasCommit = (key: 'width' | 'height') => {
    if (!actions || !snapshot) return
    const raw = canvasDraft?.[key]
    if (raw === undefined) return
    const parsed = parseFieldValue(raw)
    if (parsed === null || parsed <= 0) return
    actions.updateDocumentSize(
      key === 'width' ? parsed : snapshot.documentWidth,
      key === 'height' ? parsed : snapshot.documentHeight,
    )
    setCanvasDraft(null)
  }

  const canvasWidthValue =
    canvasDraft?.width ?? (snapshot ? String(snapshot.documentWidth) : '')
  const canvasHeightValue =
    canvasDraft?.height ?? (snapshot ? String(snapshot.documentHeight) : '')

  const blendLabel = snapshot
    ? activeLayerBlendLabel(snapshot.selection, snapshot.layers)
    : 'Normal · 100%'

  const handleFieldCommit = (key: TransformField) => {
    if (!actions || !transform) return
    const raw = draftValues[key]
    if (raw === undefined) return
    const parsed = parseFieldValue(raw)
    if (parsed === null) return
    actions.updateTransform({ [key]: parsed })
    setDraftValues((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const displayValue = (key: TransformField) => {
    if (draftValues[key] !== undefined) return draftValues[key]!
    if (!transform) return ''
    const value = transform[key]
    const suffix = TRANSFORM_FIELDS.find((f) => f.key === key)?.suffix ?? ''
    return `${value}${suffix}`
  }

  return (
    <div className="mas-right-stack">
      <div className="mas-right-stack__card" style={{ height: layersHeight, flexShrink: 0 }}>
        <StudioGlass className="mas-card-panel mas-card-panel--layers">
          <div className="mas-card-panel__head">
            <div className="mas-card-panel__head-start">
              <span>Layers</span>
              {actions ? (
                <button
                  type="button"
                  className="mas-layer-head-btn"
                  aria-label="Add layer"
                  onClick={() => actions.addLayer()}
                >
                  <Plus size={14} strokeWidth={1.75} />
                </button>
              ) : null}
            </div>
            <span className="text-[11px] font-medium normal-case tracking-normal">{blendLabel}</span>
          </div>
          <div className="mas-card-panel__body">
            {layerRows.length && snapshot && actions ? (
              layerRows.map((row) => (
                <LayerRow
                  key={row.id}
                  row={row}
                  selected={isRowSelected(row, snapshot.selection)}
                  actions={actions}
                />
              ))
            ) : (
              <p className="mas-layer-empty">No layers yet</p>
            )}
          </div>
        </StudioGlass>
        <StudioResizeHandle edge="s" onDelta={onLayersResize} className="mas-resize-handle--inset" />
      </div>

      <div className="mas-right-stack__card" style={{ height: propsHeight, flexShrink: 0 }}>
        <StudioGlass className="mas-card-panel mas-card-panel--props">
          <div className="mas-card-panel__head">
            <span>Properties</span>
          </div>
          <div className="mas-card-panel__body">
            {PROPERTY_SECTIONS.map((section) => {
              const open = openSections[section.id]
              return (
                <div key={section.id} className="mas-prop-section">
                  <button
                    type="button"
                    className="mas-prop-section__head"
                    onClick={() => setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                  >
                    {section.label}
                    <ChevronDown
                      size={14}
                      strokeWidth={1.75}
                      style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        className="mas-prop-section__body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {section.id === 'canvas' && snapshot && actions ? (
                          <div className="mas-field-grid">
                            <div className="mas-field">
                              <label htmlFor="mas-canvas-width">Width</label>
                              <input
                                id="mas-canvas-width"
                                inputMode="numeric"
                                value={canvasWidthValue}
                                onChange={(e) =>
                                  setCanvasDraft((prev) => ({
                                    width: e.target.value,
                                    height: prev?.height ?? canvasHeightValue,
                                  }))
                                }
                                onBlur={() => handleCanvasCommit('width')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur()
                                }}
                              />
                            </div>
                            <div className="mas-field">
                              <label htmlFor="mas-canvas-height">Height</label>
                              <input
                                id="mas-canvas-height"
                                inputMode="numeric"
                                value={canvasHeightValue}
                                onChange={(e) =>
                                  setCanvasDraft((prev) => ({
                                    width: prev?.width ?? canvasWidthValue,
                                    height: e.target.value,
                                  }))
                                }
                                onBlur={() => handleCanvasCommit('height')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur()
                                }}
                              />
                            </div>
                            <div className="mas-field mas-field--full">
                              <label>Aspect ratio</label>
                              <p className="mas-canvas-meta">
                                {formatDocumentAspectRatio(snapshot.documentWidth, snapshot.documentHeight)}
                              </p>
                            </div>
                            <div className="mas-field">
                              <label>DPI</label>
                              <p className="mas-canvas-meta">{snapshot.documentDpi}</p>
                            </div>
                            <div className="mas-field">
                              <label>Profile</label>
                              <p className="mas-canvas-meta">{snapshot.documentColorProfile}</p>
                            </div>
                          </div>
                        ) : section.id === 'transform' ? (
                          transform && actions ? (
                            <div className="mas-field-grid">
                              {TRANSFORM_FIELDS.map(({ key, label }) => (
                                <div key={key} className="mas-field">
                                  <label htmlFor={`mas-transform-${key}`}>{label}</label>
                                  <input
                                    id={`mas-transform-${key}`}
                                    value={displayValue(key)}
                                    onChange={(e) =>
                                      setDraftValues((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    onBlur={() => handleFieldCommit(key)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.currentTarget.blur()
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs leading-relaxed text-[var(--mas-muted)]">
                              Select a layer to edit transform properties.
                            </p>
                          )
                        ) : section.id === 'effects' && snapshot?.selection ? (
                          <p className="text-xs leading-relaxed text-[var(--mas-muted)]">
                            {snapshot.selection.kind === 'layer'
                              ? 'Layer effects: add glow, blur, or noise from the canvas toolbar.'
                              : 'Element effects are available for shapes and text.'}
                          </p>
                        ) : (
                          <p className="text-xs leading-relaxed text-[var(--mas-muted)]">
                            {section.label} controls appear when a layer is selected.
                          </p>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </StudioGlass>
        <StudioResizeHandle edge="s" onDelta={onPropsResize} className="mas-resize-handle--inset" />
      </div>

      <div className="mas-right-stack__card mas-right-stack__card--grow">
        <StudioGlass className="mas-card-panel mas-card-panel--comments">
          <div className="mas-card-panel__head">
            <span>Comments</span>
            <MessageSquare size={14} strokeWidth={1.75} aria-hidden />
          </div>
          <p className="mas-comment-empty">Invite collaborators to leave feedback directly on the canvas.</p>
        </StudioGlass>
      </div>
    </div>
  )
}
