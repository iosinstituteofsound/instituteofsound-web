import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  createCustomCanvasPreset,
  listCanvasPresets,
  type CanvasColorProfile,
  type CanvasDimensionUnit,
  type CanvasPreset,
  type CanvasPresetId,
} from '@/modules/illustrator/lib/studio-canvas-presets'
import '@/modules/illustrator/styles/new-canvas-dialog.css'

type NewCanvasDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (preset: CanvasPreset) => void
  busy?: boolean
}

const UNIT_OPTIONS: { id: CanvasDimensionUnit; label: string }[] = [
  { id: 'px', label: 'px' },
  { id: 'mm', label: 'mm' },
  { id: 'in', label: 'in' },
]

const PROFILE_OPTIONS: CanvasColorProfile[] = ['sRGB', 'CMYK']

function PresetRow({
  preset,
  featured = false,
  active = false,
  showDivider = false,
  onSelect,
}: {
  preset: CanvasPreset
  featured?: boolean
  active?: boolean
  showDivider?: boolean
  onSelect: (id: CanvasPresetId) => void
}) {
  return (
    <button
      type="button"
      className={[
        'ios-new-canvas__row',
        featured ? 'ios-new-canvas__row--featured' : '',
        active ? 'ios-new-canvas__row--active' : '',
        showDivider ? 'ios-new-canvas__row--divider' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(preset.id)}
    >
      <span className="ios-new-canvas__row-label">{preset.label}</span>
      <span className="ios-new-canvas__row-tags">
        <span className="ios-new-canvas__tag ios-new-canvas__tag--profile">{preset.colorProfile}</span>
        <span className="ios-new-canvas__tag ios-new-canvas__tag--size">{preset.dimensionsLabel}</span>
      </span>
    </button>
  )
}

export function NewCanvasDialog({ open, onOpenChange, onSelect, busy = false }: NewCanvasDialogProps) {
  const presets = useMemo(() => listCanvasPresets(), [open])
  const [featured, ...rest] = presets

  const [customOpen, setCustomOpen] = useState(false)
  const [customWidth, setCustomWidth] = useState('3000')
  const [customHeight, setCustomHeight] = useState('3000')
  const [customUnit, setCustomUnit] = useState<CanvasDimensionUnit>('px')
  const [customProfile, setCustomProfile] = useState<CanvasColorProfile>('sRGB')

  useEffect(() => {
    if (!open) {
      setCustomOpen(false)
    }
  }, [open])

  const customPreview = useMemo(() => {
    const width = Number.parseFloat(customWidth)
    const height = Number.parseFloat(customHeight)
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null
    }
    return createCustomCanvasPreset(width, height, customUnit, customProfile)
  }, [customHeight, customProfile, customUnit, customWidth])

  const handlePresetSelect = (id: CanvasPresetId) => {
    if (busy) return
    if (id === 'custom') {
      setCustomOpen(true)
      return
    }

    const preset = presets.find((item) => item.id === id)
    if (!preset) return
    onSelect(preset)
  }

  const handleCustomCreate = () => {
    if (busy || !customPreview) return
    onSelect(customPreview)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ios-new-canvas" overlayClassName="bg-black/60">
        <header className="ios-new-canvas__header">
          <DialogTitle className="ios-new-canvas__title">New canvas</DialogTitle>
        </header>

        <div className="ios-new-canvas__list" aria-label="Canvas size presets">
          {featured ? (
            <PresetRow preset={featured} featured onSelect={handlePresetSelect} />
          ) : null}

          {rest.map((preset, index) => (
            <PresetRow
              key={preset.id}
              preset={preset}
              showDivider={index > 0 || Boolean(featured)}
              onSelect={handlePresetSelect}
            />
          ))}

          <PresetRow
            preset={{
              id: 'custom',
              label: 'Custom',
              colorProfile: customProfile,
              dimensionsLabel: customPreview?.dimensionsLabel ?? 'Set size',
              width: customPreview?.width ?? 0,
              height: customPreview?.height ?? 0,
              dpi: customPreview?.dpi ?? 300,
            }}
            active={customOpen}
            showDivider
            onSelect={handlePresetSelect}
          />
        </div>

        {customOpen ? (
          <div className="ios-new-canvas__custom">
            <div className="ios-new-canvas__custom-grid">
              <label className="ios-new-canvas__field">
                <span>Width</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="any"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="ios-new-canvas__input"
                />
              </label>

              <label className="ios-new-canvas__field">
                <span>Height</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="any"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="ios-new-canvas__input"
                />
              </label>
            </div>

            <div className="ios-new-canvas__custom-grid ios-new-canvas__custom-grid--compact">
              <label className="ios-new-canvas__field">
                <span>Unit</span>
                <div className="ios-new-canvas__segmented" role="group" aria-label="Dimension unit">
                  {UNIT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`ios-new-canvas__segment${customUnit === option.id ? ' is-active' : ''}`}
                      onClick={() => setCustomUnit(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>

              <label className="ios-new-canvas__field">
                <span>Profile</span>
                <div className="ios-new-canvas__segmented" role="group" aria-label="Color profile">
                  {PROFILE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ios-new-canvas__segment${customProfile === option ? ' is-active' : ''}`}
                      onClick={() => setCustomProfile(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {customPreview ? (
              <p className="ios-new-canvas__custom-hint">
                Output: {customPreview.dimensionsLabel}
                {customUnit !== 'px' ? ` · ${customPreview.width} x ${customPreview.height}px at 300 DPI` : ''}
              </p>
            ) : (
              <p className="ios-new-canvas__custom-hint ios-new-canvas__custom-hint--error">
                Enter width and height greater than zero.
              </p>
            )}

            <button
              type="button"
              className="ios-new-canvas__create-btn"
              disabled={!customPreview}
              onClick={handleCustomCreate}
            >
              Create canvas
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
