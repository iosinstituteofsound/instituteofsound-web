import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Data } from '@measured/puck'
import {
  ARTIFACT_FX_CATEGORIES,
  artifactFxPreviewThumbStyle,
  findArtifactFxPreset,
  getDefaultArtifactFxCategoryId,
} from '@/modules/editor/lib/article-artifact-fx-library'
import {
  artifactDesignToThumbStyle,
  canvasArtifactToStyle,
  readCanvasArtifact,
} from '@/modules/editor/lib/canvas-artifact-utils'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import {
  canvasArtifactFxFilterStyle,
  canvasArtifactFxMeshStyle,
  canvasArtifactFxOverlayStyle,
  clearCanvasArtifactFx,
  readCanvasArtifactFx,
  updateCanvasArtifactFx,
} from '@/modules/editor/lib/canvas-artifact-fx-utils'
import { findArtifactDesign } from '@/modules/editor/lib/article-bg-artifacts-library'
import {
  DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX,
  hasCanvasArtifactFx,
} from '@/modules/editor/types/article-canvas-artifact-fx.types'
import { hasCanvasArtifact } from '@/modules/editor/types/article-canvas-artifact.types'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleEditArtifactsFxModalProps {
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

export function ArticleEditArtifactsFxModal({ data, onChange, onClose }: ArticleEditArtifactsFxModalProps) {
  const latestDataRef = useRef(data)
  const artifact = readCanvasArtifact(data)
  const fx = readCanvasArtifactFx(data)
  const background = readCanvasBackground(data)
  const backgroundStyle = canvasBackgroundToStyle(background)
  const appliedPreset = findArtifactFxPreset(fx.presetId)
  const artifactDesign = hasCanvasArtifact(artifact)
    ? findArtifactDesign(artifact.categoryId, artifact.designId)
    : undefined

  const [activeCategoryId, setActiveCategoryId] = useState(() => {
    if (appliedPreset) {
      const category = ARTIFACT_FX_CATEGORIES.find((item) =>
        item.presets.some((preset) => preset.id === appliedPreset.id),
      )
      return category?.id ?? getDefaultArtifactFxCategoryId()
    }
    return getDefaultArtifactFxCategoryId()
  })

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  const activeCategory = useMemo(
    () =>
      ARTIFACT_FX_CATEGORIES.find((category) => category.id === activeCategoryId) ??
      ARTIFACT_FX_CATEGORIES[0],
    [activeCategoryId],
  )

  const previewArtifactStyle = hasCanvasArtifact(artifact) ? canvasArtifactToStyle(artifact) : undefined
  const previewFxFilterStyle = hasCanvasArtifactFx(fx) ? canvasArtifactFxFilterStyle(fx) : undefined
  const previewOverlayStyle = hasCanvasArtifactFx(fx) ? canvasArtifactFxOverlayStyle(fx) : undefined
  const previewMeshStyle = hasCanvasArtifactFx(fx) ? canvasArtifactFxMeshStyle(fx) : undefined

  const applyFx = (patch: Partial<typeof fx>) => {
    const next = updateCanvasArtifactFx(latestDataRef.current, patch)
    latestDataRef.current = next
    onChange(next)
  }

  const handlePresetClick = (presetId: string) => {
    const isSame = fx.presetId === presetId
    if (isSame && hasCanvasArtifactFx(fx)) {
      handleClear()
      return
    }
    applyFx({
      presetId,
      hidden: false,
      intensity: DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX.intensity,
    })
  }

  const handleIntensityChange = (intensity: number) => {
    if (!hasCanvasArtifactFx(fx)) return
    applyFx({ intensity })
  }

  const handleClear = () => {
    const next = clearCanvasArtifactFx(latestDataRef.current)
    latestDataRef.current = next
    onChange(next)
  }

  return (
    <div className="article-edit-artifacts-fx-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Artifacts FX</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-artifacts-fx-modal__body article-editor-artifacts-fx">
        <p className="article-editor-artifacts-fx__subtitle">
          Glow, celestial bloom, and mesh overlays — applied only to your BG artifact layer.
        </p>

        <div
          className="article-editor-artifacts-fx__preview"
          style={Object.keys(backgroundStyle).length ? backgroundStyle : { background: 'var(--background)' }}
        >
          {previewArtifactStyle ? (
            <div className="article-editor-artifacts-fx__preview-stage" style={previewFxFilterStyle}>
              <div className="article-editor-artifacts-fx__preview-artifact" style={previewArtifactStyle} />
            </div>
          ) : artifactDesign ? null : (
            <div
              className="article-editor-artifacts-fx__preview-placeholder"
              style={artifactDesignToThumbStyle(
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M4 12h16M12 4v16" fill="none" stroke="currentColor" stroke-width="0.8"/></svg>',
              )}
            />
          )}
          {previewOverlayStyle?.background ? (
            <div className="article-editor-artifacts-fx__preview-overlay" style={previewOverlayStyle} />
          ) : null}
          {previewMeshStyle?.background ? (
            <div className="article-editor-artifacts-fx__preview-mesh" style={previewMeshStyle} />
          ) : null}
          <span className="article-editor-artifacts-fx__preview-label">
            {appliedPreset?.label ?? (hasCanvasArtifact(artifact) ? 'No FX' : 'Add artifact first')}
          </span>
        </div>

        <div className="article-editor-artifacts-fx__picker">
          <div className="article-editor-artifacts-fx__categories" aria-label="Artifact FX categories">
            {ARTIFACT_FX_CATEGORIES.map((category) => {
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
                    'article-editor-artifacts-fx__category',
                    isActive && 'article-editor-artifacts-fx__category--active',
                  )}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )
            })}
          </div>

          <div className="article-editor-artifacts-fx__presets">
            <p className="article-editor-artifacts-fx__presets-title">{activeCategory.label}</p>
            <div className="article-editor-artifacts-fx__preset-grid">
              {activeCategory.presets.map((preset) => {
                const thumbStyle = artifactFxPreviewThumbStyle(preset.id)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.label}
                    title={preset.description}
                    className={cn(
                      'article-editor-artifacts-fx__preset',
                      fx.presetId === preset.id && 'article-editor-artifacts-fx__preset--active',
                    )}
                    onClick={() => handlePresetClick(preset.id)}
                  >
                    <span
                      className="article-editor-artifacts-fx__preset-thumb"
                      style={{
                        filter: thumbStyle.filter,
                        background: thumbStyle.background,
                      }}
                    >
                      <span className="article-editor-artifacts-fx__preset-thumb-inner" />
                    </span>
                    <span className="article-editor-artifacts-fx__preset-label">{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="article-editor-artifacts-fx__sliders">
          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Intensity (%)</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={fx.intensity}
              aria-label="FX intensity"
              disabled={!hasCanvasArtifactFx(fx)}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={fx.intensity}
              min={0}
              max={100}
              onChange={handleIntensityChange}
            />
          </div>
        </div>

        {hasCanvasArtifactFx(fx) ? (
          <div className="article-editor-artifacts-fx__actions">
            <p className="article-editor-artifacts-fx__applied">{appliedPreset?.description}</p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleClear}>
              Remove FX
            </Button>
          </div>
        ) : (
          <p className="article-editor-artifacts-fx__hint">
            {hasCanvasArtifact(artifact)
              ? 'Tap any preset — it applies instantly to your BG artifact only.'
              : 'Add a BG artifact first, then apply glow and mesh FX to it.'}
          </p>
        )}
      </div>
    </div>
  )
}
