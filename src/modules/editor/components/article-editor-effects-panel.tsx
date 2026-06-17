import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Data } from '@measured/puck'
import {
  CANVAS_EFFECT_CATEGORIES,
  findCanvasEffectPreset,
  getDefaultCanvasEffectCategoryId,
} from '@/modules/editor/lib/article-canvas-effects-library'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import {
  canvasEffectPreviewThumbStyle,
  canvasEffectsFilterStyle,
  canvasEffectsOverlayStyle,
  clearCanvasEffects,
  readCanvasEffects,
  updateCanvasEffects,
} from '@/modules/editor/lib/canvas-effects-utils'
import {
  DEFAULT_ARTICLE_CANVAS_EFFECTS,
  hasCanvasEffects,
} from '@/modules/editor/types/article-canvas-effects.types'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleEditEffectsModalProps {
  data: Data
  onChange: (data: Data) => void
  onClose: () => void
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div className="article-bg-artifacts__stepper">
      <button type="button" aria-label="Decrease" onClick={() => onChange(clamp(value - 1))}>
        <Minus className="h-3 w-3" />
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(clamp(value + 1))}>
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

export function ArticleEditEffectsModal({ data, onChange, onClose }: ArticleEditEffectsModalProps) {
  const latestDataRef = useRef(data)
  const effects = readCanvasEffects(data)
  const background = readCanvasBackground(data)
  const backgroundStyle = canvasBackgroundToStyle(background)
  const appliedPreset = findCanvasEffectPreset(effects.presetId)

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    if (appliedPreset) {
      const category = CANVAS_EFFECT_CATEGORIES.find((item) =>
        item.presets.some((preset) => preset.id === appliedPreset.id),
      )
      return category?.id ?? getDefaultCanvasEffectCategoryId()
    }
    return getDefaultCanvasEffectCategoryId()
  })

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  const activeCategory = useMemo(
    () =>
      CANVAS_EFFECT_CATEGORIES.find((category) => category.id === activeCategoryId) ??
      CANVAS_EFFECT_CATEGORIES[0],
    [activeCategoryId],
  )

  const previewFilterStyle = hasCanvasEffects(effects) ? canvasEffectsFilterStyle(effects) : undefined
  const previewOverlayStyle = hasCanvasEffects(effects) ? canvasEffectsOverlayStyle(effects) : undefined

  const applyEffects = (patch: Partial<typeof effects>) => {
    const next = updateCanvasEffects(latestDataRef.current, patch)
    latestDataRef.current = next
    onChange(next)
  }

  const handlePresetClick = (presetId: string) => {
    const isSame = effects.presetId === presetId
    if (isSame && hasCanvasEffects(effects)) {
      handleClear()
      return
    }
    applyEffects({
      presetId,
      hidden: false,
      intensity: DEFAULT_ARTICLE_CANVAS_EFFECTS.intensity,
    })
  }

  const handleIntensityChange = (intensity: number) => {
    if (!hasCanvasEffects(effects)) return
    applyEffects({ intensity })
  }

  const handleClear = () => {
    const next = clearCanvasEffects(latestDataRef.current)
    latestDataRef.current = next
    onChange(next)
  }

  return (
    <div className="article-edit-effects-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Effects</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-effects-modal__body article-editor-effects">
        <p className="article-editor-effects__subtitle">
          Overall polish for the full canvas — background, layers, text, and media.
        </p>

      <div
        className="article-editor-effects__preview"
        style={Object.keys(backgroundStyle).length ? backgroundStyle : { background: 'var(--background)' }}
      >
        <div className="article-editor-effects__preview-stage" style={previewFilterStyle}>
          <div className="article-editor-effects__preview-sample">
            <span className="article-editor-effects__preview-heading">Feature</span>
            <span className="article-editor-effects__preview-body">Editorial preview</span>
          </div>
        </div>
        {previewOverlayStyle?.background ? (
          <div className="article-editor-effects__preview-overlay" style={previewOverlayStyle} />
        ) : null}
        <span className="article-editor-effects__preview-label">
          {appliedPreset?.label ?? 'No effect'}
        </span>
      </div>

      <div className="article-editor-effects__picker">
        <div className="article-editor-effects__categories" aria-label="Effect categories">
          {CANVAS_EFFECT_CATEGORIES.map((category) => {
            const Icon = category.icon
            const isActive = activeCategoryId === category.id
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                aria-label={category.label}
                title={category.label}
                className={cn(
                  'article-editor-effects__category',
                  isActive && 'article-editor-effects__category--active',
                )}
                onClick={() => setActiveCategoryId(category.id)}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )
          })}
        </div>

        <div className="article-editor-effects__presets">
          <p className="article-editor-effects__presets-title">{activeCategory.label}</p>
          <div className="article-editor-effects__preset-grid">
            {activeCategory.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-label={preset.label}
                title={preset.description}
                className={cn(
                  'article-editor-effects__preset',
                  effects.presetId === preset.id && 'article-editor-effects__preset--active',
                )}
                onClick={() => handlePresetClick(preset.id)}
              >
                <span
                  className="article-editor-effects__preset-thumb"
                  style={canvasEffectPreviewThumbStyle(preset.id)}
                >
                  <span className="article-editor-effects__preset-thumb-inner" />
                </span>
                <span className="article-editor-effects__preset-label">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="article-editor-effects__sliders">
        <div className="article-text-tool__slider-row">
          <Label className="article-text-tool__slider-label">Intensity (%)</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={effects.intensity}
            aria-label="Effect intensity"
            disabled={!hasCanvasEffects(effects)}
            onChange={(e) => handleIntensityChange(Number(e.target.value))}
            className="article-text-tool__slider"
          />
          <NumberStepper
            value={effects.intensity}
            min={0}
            max={100}
            onChange={handleIntensityChange}
          />
        </div>
      </div>

      {hasCanvasEffects(effects) ? (
        <div className="article-editor-effects__actions">
          <p className="article-editor-effects__applied">{appliedPreset?.description}</p>
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleClear}>
            Remove effect
          </Button>
        </div>
      ) : (
        <p className="article-editor-effects__hint">
          Tap any preset — it applies instantly to your whole article canvas.
        </p>
      )}
      </div>
    </div>
  )
}
