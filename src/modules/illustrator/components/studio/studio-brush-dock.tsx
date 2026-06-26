import { useCallback, useState } from 'react'
import { Redo2, Undo2 } from 'lucide-react'
import type { StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import type { ToolSettings } from '@/modules/illustrator/components/studio/use-studio-canvas'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'
import { StudioIconTooltip } from '@/modules/illustrator/components/studio/studio-icon-tooltip'

type PaintToolId = 'brush' | 'erase' | 'smudge'

type DragTarget = 'size' | 'secondary'

type StudioBrushDockProps = {
  activeTool: PaintToolId
  settings: ToolSettings
  foreground: string
  canUndo: boolean
  canRedo: boolean
  onChange: (patch: Partial<ToolSettings>) => void
  onUndo: () => void
  onRedo: () => void
  onOpenSettings?: () => void
}

export function StudioBrushDock({
  activeTool,
  settings,
  foreground,
  canUndo,
  canRedo,
  onChange,
  onUndo,
  onRedo,
  onOpenSettings,
}: StudioBrushDockProps) {
  const [dragging, setDragging] = useState<DragTarget | null>(null)

  const size = activeTool === 'erase' ? settings.eraserSize : settings.brushSize
  const sizeMin = activeTool === 'erase' ? 4 : 2
  const sizeMax = 120

  const secondary = getSecondaryControl(activeTool, settings, onChange)
  const previewPx = Math.max(5, Math.min(22, size * 0.38))

  const endDrag = useCallback(() => setDragging(null), [])

  const previewColor = activeTool === 'erase' ? 'rgba(255,255,255,0.9)' : foreground
  const previewOpacity = activeTool === 'brush' ? settings.brushOpacity : 1

  return (
    <div className="mas-brush-dock-wrap">
      {dragging === 'size' ? (
        <div className="mas-brush-dock__readout mas-brush-dock__readout--size" aria-live="polite">
          <div
            className="mas-brush-dock__size-stage"
            style={{ width: size, height: size }}
          >
            <span
              className="mas-brush-dock__size-ring"
              style={{
                width: size,
                height: size,
                background: previewColor,
                opacity: previewOpacity,
              }}
            />
          </div>
          <span className="mas-brush-dock__readout-value">{size}px</span>
        </div>
      ) : dragging === 'secondary' && secondary ? (
        <div className="mas-brush-dock__readout mas-brush-dock__readout--secondary" aria-live="polite">
          {secondary.value}%
        </div>
      ) : null}

      <StudioGlass className="mas-brush-dock" small>
        <VerticalSlider
          label={activeTool === 'erase' ? 'Eraser size' : 'Brush size'}
          value={size}
          min={sizeMin}
          max={sizeMax}
          onChange={(v) => onChange(activeTool === 'erase' ? { eraserSize: v } : { brushSize: v })}
          onDragStart={() => setDragging('size')}
          onDragEnd={endDrag}
        />

        <StudioIconTooltip label="Brush settings">
          <button
            type="button"
            className="mas-brush-dock__preview"
            aria-label="Brush settings"
            onClick={onOpenSettings}
          >
            <span
              className="mas-brush-dock__preview-dot"
              style={{
                width: previewPx,
                height: previewPx,
                background: activeTool === 'erase' ? 'rgba(255,255,255,0.85)' : foreground,
                opacity: activeTool === 'brush' ? settings.brushOpacity : 1,
              }}
            />
          </button>
        </StudioIconTooltip>

        {secondary ? (
          <VerticalSlider
            label={secondary.label}
            value={secondary.value}
            min={secondary.min}
            max={secondary.max}
            onChange={secondary.onChange}
            onDragStart={() => setDragging('secondary')}
            onDragEnd={endDrag}
          />
        ) : null}

        <div className="mas-brush-dock__history">
          <StudioIconTooltip label="Undo" shortcut="⌘Z">
            <button
              type="button"
              className="mas-brush-dock__history-btn"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={onUndo}
            >
              <Undo2 size={16} strokeWidth={1.75} />
            </button>
          </StudioIconTooltip>
          <StudioIconTooltip label="Redo" shortcut="⇧⌘Z">
            <button
              type="button"
              className="mas-brush-dock__history-btn"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={onRedo}
            >
              <Redo2 size={16} strokeWidth={1.75} />
            </button>
          </StudioIconTooltip>
        </div>
      </StudioGlass>
    </div>
  )
}

export function isPaintTool(tool: StudioToolId): tool is PaintToolId {
  return tool === 'brush' || tool === 'erase' || tool === 'smudge'
}

function getSecondaryControl(
  tool: PaintToolId,
  settings: ToolSettings,
  onChange: (patch: Partial<ToolSettings>) => void,
) {
  switch (tool) {
    case 'brush':
      return {
        label: 'Opacity',
        value: Math.round(settings.brushOpacity * 100),
        min: 5,
        max: 100,
        onChange: (v: number) => onChange({ brushOpacity: v / 100 }),
      }
    case 'smudge':
      return {
        label: 'Strength',
        value: Math.round(settings.smudgeStrength * 100),
        min: 10,
        max: 90,
        onChange: (v: number) => onChange({ smudgeStrength: v / 100 }),
      }
    default:
      return null
  }
}

function VerticalSlider({
  label,
  value,
  min,
  max,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <label className="mas-brush-dock__slider">
      <span className="sr-only">{label}</span>
      <div className="mas-brush-dock__track">
        <div className="mas-brush-dock__fill" style={{ height: `${pct}%` }} />
        <span className="mas-brush-dock__thumb" style={{ bottom: `${pct}%` }} aria-hidden />
        <input
          type="range"
          className="mas-brush-dock__range"
          min={min}
          max={max}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={onDragStart}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onBlur={onDragEnd}
        />
      </div>
    </label>
  )
}
