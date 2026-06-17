import { Minus, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Data } from '@measured/puck'
import {
  getDefaultText3dEffectCategoryId,
  TEXT_3D_EFFECT_CATEGORIES,
  findText3dEffectPreset,
  text3dEffectPreviewStyle,
} from '@/modules/editor/lib/article-text-3d-effects-library'
import { clearText3dEffectPatch } from '@/modules/editor/lib/canvas-text-3d-effects-utils'
import { parseBlockStyle, updateCanvasBlocksStyle } from '@/modules/editor/lib/canvas-block-utils'
import { resolveFontFamily } from '@/modules/editor/lib/article-font-library'
import {
  DEFAULT_TEXT_3D_EFFECT,
  hasText3dEffect,
} from '@/modules/editor/types/article-text-3d-effect.types'
import type { CanvasBlockStyle } from '@/modules/editor/types/article-canvas.types'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleText3dEffectsModalProps {
  data: Data
  selectedBlockIds: string[]
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

export function ArticleText3dEffectsModal({
  data,
  selectedBlockIds,
  onChange,
  onClose,
}: ArticleText3dEffectsModalProps) {
  const primaryBlock = data.content.find(
    (block) => selectedBlockIds.includes(String((block.props as Record<string, unknown>).blockId)),
  )
  const style = primaryBlock
    ? parseBlockStyle((primaryBlock.props as Record<string, unknown>).style)
    : null

  const presetId = style?.text3dPresetId ?? ''
  const intensity = style?.text3dIntensity ?? DEFAULT_TEXT_3D_EFFECT.intensity
  const appliedPreset = findText3dEffectPreset(presetId)
  const hasTextSelection = selectedBlockIds.length > 0

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    if (appliedPreset) {
      const category = TEXT_3D_EFFECT_CATEGORIES.find((item) =>
        item.presets.some((preset) => preset.id === appliedPreset.id),
      )
      return category?.id ?? getDefaultText3dEffectCategoryId()
    }
    return getDefaultText3dEffectCategoryId()
  })

  const activeCategory = useMemo(
    () =>
      TEXT_3D_EFFECT_CATEGORIES.find((category) => category.id === activeCategoryId) ??
      TEXT_3D_EFFECT_CATEGORIES[0],
    [activeCategoryId],
  )

  const applyPatch = (patch: Partial<CanvasBlockStyle>) => {
    onChange(updateCanvasBlocksStyle(data, selectedBlockIds, patch))
  }

  const handleClear = () => {
    if (!hasTextSelection) return
    onChange(updateCanvasBlocksStyle(data, selectedBlockIds, clearText3dEffectPatch()))
  }

  const handlePresetClick = (nextPresetId: string) => {
    if (!hasTextSelection) return
    const isSame = presetId === nextPresetId
    if (isSame && hasText3dEffect({ presetId, intensity })) {
      handleClear()
      return
    }
    applyPatch({
      text3dPresetId: nextPresetId,
      text3dIntensity: DEFAULT_TEXT_3D_EFFECT.intensity,
    })
  }

  const handleIntensityChange = (nextIntensity: number) => {
    if (!hasTextSelection || !hasText3dEffect({ presetId, intensity })) return
    applyPatch({ text3dIntensity: nextIntensity })
  }

  const previewFont = style ? resolveFontFamily(style.fontFamilyId) : undefined

  return (
    <div className="article-text-3d-effects-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">3D Text Effects</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-text-3d-effects-modal__body article-editor-text-3d">
        <p className="article-editor-text-3d__subtitle">
          World-class 3D depth — extrusion, perspective tilt, chrome blocks, and neon dimension.
        </p>

        <div className="article-editor-text-3d__preview">
          <span
            className="article-editor-text-3d__preview-sample"
            style={{
              fontFamily: previewFont,
              ...text3dEffectPreviewStyle(appliedPreset?.id ?? ''),
            }}
          >
            {appliedPreset?.label ?? '3D'}
          </span>
          <span className="article-editor-text-3d__preview-label">
            {appliedPreset?.label ?? 'No effect'}
          </span>
        </div>

        <div className="article-editor-text-3d__picker">
          <div className="article-editor-text-3d__categories" aria-label="3D effect categories">
            {TEXT_3D_EFFECT_CATEGORIES.map((category) => {
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
                    'article-editor-text-3d__category',
                    isActive && 'article-editor-text-3d__category--active',
                  )}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )
            })}
          </div>

          <div className="article-editor-text-3d__presets">
            <p className="article-editor-text-3d__presets-title">{activeCategory.label}</p>
            <div className="article-editor-text-3d__preset-grid">
              {activeCategory.presets.map((preset) => {
                const thumbStyle = text3dEffectPreviewStyle(preset.id)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.label}
                    title={preset.description}
                    className={cn(
                      'article-editor-text-3d__preset',
                      presetId === preset.id && 'article-editor-text-3d__preset--active',
                    )}
                    onClick={() => handlePresetClick(preset.id)}
                  >
                    <span
                      className="article-editor-text-3d__preset-thumb"
                      style={{
                        fontFamily: previewFont,
                        textShadow: thumbStyle.textShadow,
                        WebkitTextStroke: thumbStyle.WebkitTextStroke,
                        color: thumbStyle.color ?? 'var(--foreground)',
                        backgroundImage: thumbStyle.backgroundImage,
                        WebkitBackgroundClip: thumbStyle.backgroundImage ? 'text' : undefined,
                        backgroundClip: thumbStyle.backgroundImage ? 'text' : undefined,
                        filter: thumbStyle.filter,
                        transform: thumbStyle.transform,
                      }}
                    >
                      Aa
                    </span>
                    <span className="article-editor-text-3d__preset-label">{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="article-editor-text-3d__sliders">
          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Intensity (%)</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={intensity}
              aria-label="3D effect intensity"
              disabled={!hasText3dEffect({ presetId, intensity })}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={intensity}
              min={0}
              max={100}
              onChange={handleIntensityChange}
            />
          </div>
        </div>

        {hasText3dEffect({ presetId, intensity }) ? (
          <div className="article-editor-text-3d__actions">
            <p className="article-editor-text-3d__applied">{appliedPreset?.description}</p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleClear}>
              Remove 3D effect
            </Button>
          </div>
        ) : (
          <p className="article-editor-text-3d__hint">
            {hasTextSelection
              ? 'Tap any preset — cinematic 3D depth applies instantly to your text.'
              : 'Select a text block on the canvas, then pick a world-class 3D effect.'}
          </p>
        )}
      </div>
    </div>
  )
}
