import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import type { StudioCanvasController } from '@/modules/illustrator/components/studio/use-studio-canvas'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'

type StudioCanvasStageProps = {
  title: string
  showContext: boolean
  activeTool: StudioToolId
  zoom: number
  documentWidth: number
  documentHeight: number
  canvas: StudioCanvasController
}

const CONTEXT_ACTIONS = ['Opacity', 'Blend', 'Mask', 'Duplicate', 'Arrange', 'Effects', 'Align', 'Delete'] as const

export function StudioCanvasStage({
  title,
  showContext,
  activeTool,
  zoom,
  documentWidth,
  documentHeight,
  canvas,
}: StudioCanvasStageProps) {
  const textInputRef = useRef<HTMLInputElement>(null)
  const [zoomHud, setZoomHud] = useState(false)
  const zoomHudTimer = useRef(0)

  const {
    canvasRef,
    viewportRef,
    pan,
    scale,
    rotation,
    canvasWidth,
    canvasHeight,
    textPrompt,
    brushPreviewRef,
    cursorClass,
    submitText,
    deleteSelected,
    handlers,
  } = canvas

  const painting = activeTool === 'brush' || activeTool === 'erase' || activeTool === 'smudge'
  const frameStyle = useMemo((): CSSProperties => {
    const docW = Math.max(1, documentWidth)
    const docH = Math.max(1, documentHeight)
    const ratio = docW / docH
    return {
      aspectRatio: `${docW} / ${docH}`,
      width: `min(72vw, 920px, calc(72vh * ${ratio}))`,
      maxHeight: '72vh',
    }
  }, [documentHeight, documentWidth])

  useEffect(() => {
    setZoomHud(true)
    window.clearTimeout(zoomHudTimer.current)
    zoomHudTimer.current = window.setTimeout(() => setZoomHud(false), 900)
    return () => window.clearTimeout(zoomHudTimer.current)
  }, [zoom, rotation])

  useEffect(() => {
    if (textPrompt) textInputRef.current?.focus()
  }, [textPrompt])

  return (
    <div className={`mas-canvas-zone${painting ? ' mas-canvas-zone--paint' : ''}`}>
      <div className="mas-canvas-zone__grid" aria-hidden />

      {showContext ? (
        <div className="mas-context-wrap" data-testid="studio-select-context">
          <StudioGlass className="mas-context" small pill>
            {CONTEXT_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className={`mas-context__chip${action === 'Delete' ? ' mas-context__chip--danger' : ''}`}
                onClick={() => {
                  if (action === 'Delete') deleteSelected()
                }}
              >
                {action}
              </button>
            ))}
          </StudioGlass>
        </div>
      ) : null}

      <div ref={viewportRef} className={`mas-canvas-viewport ${cursorClass}${painting ? ' mas-canvas-viewport--paint' : ''}`} data-testid="studio-canvas-viewport">
        {zoomHud ? (
          <div className="mas-zoom-hud" aria-live="polite">
            {Math.round(zoom)}%
            {Math.abs(rotation) > 0.5 ? ` · ${Math.round(rotation)}°` : ''}
          </div>
        ) : null}
        <div
          className="mas-canvas-stage"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
          }}
        >
          <div className="mas-canvas-frame" style={frameStyle}>
            <canvas
              ref={canvasRef}
              className="mas-canvas-surface"
              width={canvasWidth}
              height={canvasHeight}
              aria-label={`${title} canvas`}
              {...handlers}
            />

            <div
              ref={brushPreviewRef}
              className="mas-brush-preview"
              style={{ display: 'none' }}
              aria-hidden
            />

            {textPrompt ? (
              <div
                className="mas-canvas-text-input"
                style={{
                  left: `${(textPrompt.x / canvasWidth) * 100}%`,
                  top: `${(textPrompt.y / canvasHeight) * 100}%`,
                }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  placeholder="Type here…"
                  data-testid="studio-text-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitText(e.currentTarget.value)
                    if (e.key === 'Escape') submitText('')
                  }}
                  onBlur={(e) => submitText(e.currentTarget.value)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {!painting ? <p className="mas-canvas-hint" data-testid="studio-canvas-hint">{toolHint(activeTool)}</p> : null}
    </div>
  )
}

function toolHint(tool: StudioToolId) {
  switch (tool) {
    case 'select':
      return 'Tap to select · drag to move'
    case 'brush':
      return 'Draw · trackpad: 2-finger pan, pinch zoom, twist rotate'
    case 'erase':
      return 'Erase on the active layer'
    case 'smudge':
      return 'Blend colors on the canvas'
    case 'fill':
      return 'Tap a region to fill'
    case 'gradient':
      return 'Drag to create a gradient'
    case 'shape':
      return 'Drag to draw · Shift for proportional'
    case 'text':
      return 'Tap to place text'
    case 'hand':
      return 'Drag to move the canvas'
    case 'zoom':
      return 'Drag up/down to zoom · tap to step · Alt+tap out · pinch · scroll'
    default:
      return 'Trackpad: 2-finger pan · pinch zoom · twist rotate · Alt+scroll rotate'
  }
}
