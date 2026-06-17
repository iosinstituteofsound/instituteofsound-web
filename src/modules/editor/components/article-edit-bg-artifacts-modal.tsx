import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Data } from '@measured/puck'
import {
  BG_ARTIFACT_CATEGORIES,
  BG_ARTIFACT_DESIGNS_PER_CATEGORY,
  findArtifactCategory,
  getDefaultArtifactCategoryId,
} from '@/modules/editor/lib/article-bg-artifacts-library'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import {
  artifactDesignToThumbStyle,
  canvasArtifactToStyle,
  clearCanvasArtifact,
  isDefaultArtifactTransform,
  readCanvasArtifact,
  updateCanvasArtifact,
} from '@/modules/editor/lib/canvas-artifact-utils'
import { resolveInitialArtifactZIndex } from '@/modules/editor/lib/canvas-layers-utils'
import {
  DEFAULT_CANVAS_ARTIFACT_TRANSFORM,
  hasCanvasArtifact,
  type CanvasArtifactTransform,
} from '@/modules/editor/types/article-canvas-artifact.types'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleEditBgArtifactsModalProps {
  data: Data
  onChange: (data: Data) => void
  onClose: () => void
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
  className,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  className?: string
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div className={cn('article-bg-artifacts__stepper', className)}>
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

export function ArticleEditBgArtifactsModal({
  data,
  onChange,
  onClose,
}: ArticleEditBgArtifactsModalProps) {
  const latestDataRef = useRef(data)
  const designGridRef = useRef<HTMLDivElement>(null)
  const artifact = readCanvasArtifact(data)
  const background = readCanvasBackground(data)
  const backgroundStyle = canvasBackgroundToStyle(background)

  const [activeCategoryId, setActiveCategoryId] = useState(
    artifact.categoryId || getDefaultArtifactCategoryId(),
  )

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategoryId(categoryId)
    requestAnimationFrame(() => {
      designGridRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const activeCategory = useMemo(
    () => BG_ARTIFACT_CATEGORIES.find((category) => category.id === activeCategoryId) ?? BG_ARTIFACT_CATEGORIES[0],
    [activeCategoryId],
  )

  const appliedDesign =
    artifact.categoryId === activeCategoryId
      ? activeCategory.designs.find((design) => design.id === artifact.designId)
      : undefined

  const previewArtifactStyle = hasCanvasArtifact(artifact) ? canvasArtifactToStyle(artifact) : undefined
  const appliedCategory = findArtifactCategory(artifact.categoryId)

  const applyArtifact = (
    patch: Partial<{
      categoryId: string
      designId: string
      zIndex: number
      hidden: boolean
      transform: Partial<CanvasArtifactTransform>
    }>,
  ) => {
    const next = updateCanvasArtifact(latestDataRef.current, patch)
    latestDataRef.current = next
    onChange(next)
  }

  const handleDesignClick = (designId: string) => {
    const current = readCanvasArtifact(latestDataRef.current)
    const isNew = !hasCanvasArtifact(current)
    const isSameDesign =
      !isNew && current.categoryId === activeCategoryId && current.designId === designId
    if (isSameDesign) {
      handleClear()
      return
    }
    applyArtifact({
      categoryId: activeCategoryId,
      designId,
      hidden: false,
      transform: { ...DEFAULT_CANVAS_ARTIFACT_TRANSFORM },
      ...(isNew ? { zIndex: resolveInitialArtifactZIndex(latestDataRef.current) } : {}),
    })
  }

  const handleTransformChange = (transform: Partial<CanvasArtifactTransform>) => {
    if (!hasCanvasArtifact(artifact)) return
    applyArtifact({ transform: { ...artifact.transform, ...transform } })
  }

  const handleRestoreDefaults = () => {
    if (!hasCanvasArtifact(artifact)) return
    applyArtifact({ transform: { ...DEFAULT_CANVAS_ARTIFACT_TRANSFORM } })
  }

  const handleClear = () => {
    const next = clearCanvasArtifact(latestDataRef.current)
    latestDataRef.current = next
    onChange(next)
  }

  const canRestoreDefaults = hasCanvasArtifact(artifact) && !isDefaultArtifactTransform(artifact.transform)

  return (
    <div className="article-edit-bg-artifacts-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">BG Artifacts</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-bg-artifacts-modal__body">
        <div
          className="article-edit-bg-artifacts-modal__preview"
          style={Object.keys(backgroundStyle).length ? backgroundStyle : { background: 'var(--background)' }}
        >
          {previewArtifactStyle ? (
            <div className="article-edit-bg-artifacts-modal__preview-artifact" style={previewArtifactStyle} />
          ) : null}
          <span className="article-edit-bg-artifacts-modal__preview-label">
            {hasCanvasArtifact(artifact) ? appliedCategory?.label ?? 'Applied' : 'Pick a design'}
          </span>
        </div>

        <div className="article-edit-bg-artifacts-modal__picker">
          <div className="article-edit-bg-artifacts-modal__categories" aria-label="Artifact categories">
            {BG_ARTIFACT_CATEGORIES.map((category) => {
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
                    'article-edit-bg-artifacts-modal__category',
                    isActive && 'article-edit-bg-artifacts-modal__category--active',
                  )}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleCategoryClick(category.id)
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )
            })}
          </div>

          <div key={activeCategoryId} className="article-edit-bg-artifacts-modal__designs">
            <p className="article-edit-bg-artifacts-modal__designs-title">
              {activeCategory.label}
              <span className="article-edit-bg-artifacts-modal__designs-count">
                {BG_ARTIFACT_DESIGNS_PER_CATEGORY}
              </span>
            </p>
            <div ref={designGridRef} className="article-edit-bg-artifacts-modal__design-grid">
              {activeCategory.designs.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  aria-label={design.label}
                  title={design.label}
                  className={cn(
                    'article-edit-bg-artifacts-modal__design',
                    appliedDesign?.id === design.id && 'article-edit-bg-artifacts-modal__design--active',
                  )}
                  onClick={() => handleDesignClick(design.id)}
                >
                  <span
                    className="article-edit-bg-artifacts-modal__design-thumb"
                    style={artifactDesignToThumbStyle(design.svg, design.fit ?? 'tile')}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="article-edit-bg-artifacts-modal__sliders">
          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Rotate (°)</Label>
            <input
              type="range"
              min={0}
              max={360}
              value={artifact.transform.rotate}
              aria-label="Rotate artifact"
              disabled={!hasCanvasArtifact(artifact)}
              onChange={(e) => handleTransformChange({ rotate: Number(e.target.value) })}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={artifact.transform.rotate}
              min={0}
              max={360}
              onChange={(rotate) => handleTransformChange({ rotate })}
            />
          </div>

          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Effect size (%)</Label>
            <input
              type="range"
              min={25}
              max={300}
              value={artifact.transform.effectSize}
              aria-label="Overall effect size"
              disabled={!hasCanvasArtifact(artifact)}
              onChange={(e) => handleTransformChange({ effectSize: Number(e.target.value) })}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={artifact.transform.effectSize}
              min={25}
              max={300}
              onChange={(effectSize) => handleTransformChange({ effectSize })}
            />
          </div>

          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Pattern (%)</Label>
            <input
              type="range"
              min={25}
              max={300}
              value={artifact.transform.scale}
              aria-label="Pattern size"
              disabled={!hasCanvasArtifact(artifact)}
              onChange={(e) => handleTransformChange({ scale: Number(e.target.value) })}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={artifact.transform.scale}
              min={25}
              max={300}
              onChange={(scale) => handleTransformChange({ scale })}
            />
          </div>

          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">X (%)</Label>
            <input
              type="range"
              min={-50}
              max={50}
              value={artifact.transform.offsetX}
              aria-label="Horizontal position"
              disabled={!hasCanvasArtifact(artifact)}
              onChange={(e) => handleTransformChange({ offsetX: Number(e.target.value) })}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={artifact.transform.offsetX}
              min={-50}
              max={50}
              onChange={(offsetX) => handleTransformChange({ offsetX })}
            />
          </div>

          <div className="article-text-tool__slider-row">
            <Label className="article-text-tool__slider-label">Y (%)</Label>
            <input
              type="range"
              min={-50}
              max={50}
              value={artifact.transform.offsetY}
              aria-label="Vertical position"
              disabled={!hasCanvasArtifact(artifact)}
              onChange={(e) => handleTransformChange({ offsetY: Number(e.target.value) })}
              className="article-text-tool__slider"
            />
            <NumberStepper
              value={artifact.transform.offsetY}
              min={-50}
              max={50}
              onChange={(offsetY) => handleTransformChange({ offsetY })}
            />
          </div>
        </div>

        <div className="article-edit-bg-artifacts-modal__actions">
          <button
            type="button"
            className="article-edit-bg-artifacts-modal__restore"
            disabled={!canRestoreDefaults}
            onClick={handleRestoreDefaults}
          >
            Restore defaults
          </button>
        </div>

        {hasCanvasArtifact(artifact) ? (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleClear}>
            Remove artifact
          </Button>
        ) : (
          <p className="article-edit-bg-artifacts-modal__hint">
            Tap any design — it applies instantly on your canvas background.
          </p>
        )}
      </div>
    </div>
  )
}
