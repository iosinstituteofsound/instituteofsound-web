import { useState } from 'react'
import { Library, Settings } from 'lucide-react'
import { isPaintTool, StudioBrushDock } from '@/modules/illustrator/components/studio/studio-brush-dock'
import { STUDIO_TOOLS } from '@/modules/illustrator/components/studio/studio-data'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'
import { StudioIconTooltip } from '@/modules/illustrator/components/studio/studio-icon-tooltip'
import { StudioToolSettings } from '@/modules/illustrator/components/studio/studio-tool-settings'
import type { StudioToolId } from '@/modules/illustrator/components/studio/studio-types'
import type { ToolSettings } from '@/modules/illustrator/components/studio/use-studio-canvas'

type ColorTarget = 'foreground' | 'background'

type StudioToolRailProps = {
  activeTool: StudioToolId
  foreground: string
  background: string
  toolSettings: ToolSettings
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
  onToolChange: (tool: StudioToolId) => void
  onSwapColors: () => void
  onToolSettingsChange: (patch: Partial<ToolSettings>) => void
  onColorOpen?: (target: ColorTarget) => void
  assetsOpen: boolean
  onAssetsToggle: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

export function StudioToolRail({
  activeTool,
  foreground,
  background,
  toolSettings,
  settingsOpen,
  onSettingsOpenChange,
  onToolChange,
  onSwapColors,
  onToolSettingsChange,
  onColorOpen,
  assetsOpen,
  onAssetsToggle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: StudioToolRailProps) {
  const [dockOpen, setDockOpen] = useState(true)

  const paintTool = isPaintTool(activeTool) ? activeTool : null
  const showDock = Boolean(paintTool && dockOpen)

  const openColor = (target: ColorTarget) => {
    onColorOpen?.(target)
  }

  const setSettingsOpen = onSettingsOpenChange

  return (
    <div className="mas-rail-wrap">
      <StudioGlass className="mas-rail">
        <div className="mas-rail__panels">
          <StudioIconTooltip label="Library" shortcut="L">
            <button
              type="button"
              className={`mas-rail__tool${assetsOpen ? ' mas-rail__tool--active' : ''}`}
              aria-label="Library"
              aria-pressed={assetsOpen}
              data-studio-overlay-trigger="assets"
              onClick={onAssetsToggle}
            >
              <Library size={18} strokeWidth={1.75} />
            </button>
          </StudioIconTooltip>
        </div>

        <div className="mas-rail__tools">
          {STUDIO_TOOLS.map((tool) => {
            const Icon = tool.icon
            const active = activeTool === tool.id
            return (
              <StudioIconTooltip key={tool.id} label={tool.label} shortcut={tool.shortcut}>
                <button
                  type="button"
                  className={`mas-rail__tool${active ? ' mas-rail__tool--active' : ''}`}
                  aria-label={tool.label}
                  aria-pressed={active}
                  onClick={() => {
                    if (isPaintTool(tool.id)) {
                      if (activeTool === tool.id) {
                        setDockOpen((v) => !v)
                      } else {
                        onToolChange(tool.id)
                        setDockOpen(true)
                        setSettingsOpen(false)
                      }
                      return
                    }

                    onToolChange(tool.id)
                    setDockOpen(false)
                    setSettingsOpen(tool.id !== 'ai' && tool.id !== 'zoom' && tool.id !== 'hand')
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </button>
              </StudioIconTooltip>
            )
          })}
        </div>

        <div className="mas-rail__spacer" />

        <div className="mas-rail__swatches">
          <StudioIconTooltip label="Foreground color">
            <button
              type="button"
              className="mas-swatch mas-swatch--fg"
              aria-label="Foreground color"
              data-studio-overlay-trigger="color"
              style={{ background: foreground }}
              onClick={() => openColor('foreground')}
            />
          </StudioIconTooltip>
          <StudioIconTooltip label="Background color" shortcut="X">
            <button
              type="button"
              className="mas-swatch mas-swatch--bg"
              aria-label="Background color"
              data-studio-overlay-trigger="color"
              style={{ background: background, borderColor: foreground }}
              onClick={() => openColor('background')}
              onContextMenu={(e) => {
                e.preventDefault()
                onSwapColors()
              }}
            />
          </StudioIconTooltip>
          <StudioIconTooltip label="Tool settings">
            <button
              type="button"
              className={`mas-icon-btn${settingsOpen ? ' mas-icon-btn--active' : ''}`}
              aria-label="Tool settings"
              aria-pressed={settingsOpen}
              data-studio-overlay-trigger="settings"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <Settings size={16} strokeWidth={1.75} />
            </button>
          </StudioIconTooltip>
        </div>
      </StudioGlass>

      {showDock && paintTool ? (
        <StudioBrushDock
          activeTool={paintTool}
          settings={toolSettings}
          foreground={foreground}
          canUndo={canUndo}
          canRedo={canRedo}
          onChange={onToolSettingsChange}
          onUndo={() => onUndo?.()}
          onRedo={() => onRedo?.()}
          onOpenSettings={() => setSettingsOpen(!settingsOpen)}
        />
      ) : null}

      {settingsOpen ? (
        <div data-studio-overlay="settings">
          <StudioToolSettings
            activeTool={activeTool}
            settings={toolSettings}
            onChange={onToolSettingsChange}
          />
        </div>
      ) : null}
    </div>
  )
}
