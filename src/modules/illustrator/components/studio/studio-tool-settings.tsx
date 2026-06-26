import type { StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import type { ToolSettings } from '@/modules/illustrator/components/studio/use-studio-canvas'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'

type StudioToolSettingsProps = {
  activeTool: StudioToolId
  settings: ToolSettings
  onChange: (patch: Partial<ToolSettings>) => void
}

export function StudioToolSettings({ activeTool, settings, onChange }: StudioToolSettingsProps) {
  const rows = getRows(activeTool, settings, onChange)
  if (!rows.length) return null

  return (
    <StudioGlass className="mas-tool-settings" small>
      <p className="mas-tool-settings__title">{labelForTool(activeTool)} settings</p>
      {rows}
    </StudioGlass>
  )
}

function labelForTool(tool: StudioToolId) {
  return tool.charAt(0).toUpperCase() + tool.slice(1)
}

function getRows(
  tool: StudioToolId,
  settings: ToolSettings,
  onChange: (patch: Partial<ToolSettings>) => void,
) {
  switch (tool) {
    case 'brush':
      return [
        slider('Brush size', settings.brushSize, 2, 120, (brushSize) => onChange({ brushSize })),
        slider('Opacity', Math.round(settings.brushOpacity * 100), 5, 100, (v) => onChange({ brushOpacity: v / 100 })),
        slider('Hardness', Math.round(settings.brushHardness * 100), 10, 100, (v) => onChange({ brushHardness: v / 100 })),
        slider('Streamline', Math.round(settings.streamline * 100), 0, 95, (v) => onChange({ streamline: v / 100 })),
      ]
    case 'erase':
      return [slider('Eraser size', settings.eraserSize, 4, 120, (eraserSize) => onChange({ eraserSize }))]
    case 'smudge':
      return [
        slider('Brush size', settings.brushSize, 8, 96, (brushSize) => onChange({ brushSize })),
        slider('Strength', Math.round(settings.smudgeStrength * 100), 10, 90, (v) =>
          onChange({ smudgeStrength: v / 100 }),
        ),
      ]
    case 'shape':
      return [
        <div key="shape-kind" className="mas-tool-settings__row">
          <span>Shape</span>
          <div className="mas-tool-settings__chips">
            {(['rect', 'ellipse', 'triangle'] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                className={`mas-tool-settings__chip${settings.shape === shape ? ' mas-tool-settings__chip--active' : ''}`}
                onClick={() => onChange({ shape })}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>,
        slider('Stroke', settings.strokeWidth, 1, 16, (strokeWidth) => onChange({ strokeWidth })),
        <label key="filled" className="mas-tool-settings__check">
          <input
            type="checkbox"
            checked={settings.shapeFilled}
            onChange={(e) => onChange({ shapeFilled: e.target.checked })}
          />
          Filled
        </label>,
      ]
    case 'text':
      return [slider('Font size', settings.fontSize, 12, 96, (fontSize) => onChange({ fontSize }))]
    case 'frame':
      return [slider('Border', settings.frameThickness, 2, 32, (frameThickness) => onChange({ frameThickness }))]
    case 'sticker':
      return [
        <label key="emoji" className="mas-tool-settings__field">
          <span>Sticker</span>
          <input
            type="text"
            maxLength={2}
            value={settings.stickerEmoji}
            onChange={(e) => onChange({ stickerEmoji: e.target.value || '✨' })}
          />
        </label>,
      ]
    default:
      return []
  }
}

function slider(
  label: string,
  value: number,
  min: number,
  max: number,
  onChange: (value: number) => void,
) {
  return (
    <label key={label} className="mas-tool-settings__slider">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <em>{value}</em>
    </label>
  )
}
