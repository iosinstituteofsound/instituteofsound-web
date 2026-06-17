import { useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Loader2,
  Minus,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import type { Data } from '@measured/puck'
import { ARTICLE_COLOR_TOKENS, colorTokenToCss } from '@/modules/editor/lib/article-color-tokens'
import {
  duplicateCanvasBlock,
  parseBlockStyle,
  removeCanvasBlocks,
  reorderBlock,
  rotateBlockAngle,
  toggleBlocksEffect,
  updateCanvasBlock,
  updateCanvasBlocksStyle,
} from '@/modules/editor/lib/canvas-block-utils'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import type {
  BlendMode,
  CanvasBlockEffects,
  CanvasBlockStyle,
  ImageShapeType,
} from '@/modules/editor/types/article-canvas.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/cn'

interface ArticleImageToolPanelProps {
  data: Data
  selectedBlockIds: string[]
  blockType: CanvasBlockType
  objectCount: number
  onChange: (data: Data) => void
  onDeselect: () => void
}

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft light' },
  { value: 'hard-light', label: 'Hard light' },
]

const EFFECT_LABELS: { key: keyof CanvasBlockEffects; label: string }[] = [
  { key: 'outline', label: 'Outline' },
  { key: 'dropShadow', label: 'Drop Shadow' },
  { key: 'innerGlow', label: 'Inner Glow' },
  { key: 'emboss', label: 'Emboss' },
  { key: 'transform', label: 'Transform' },
  { key: 'longShadow', label: 'Long Shadow' },
  { key: 'outerGlow', label: 'Outer Glow' },
  { key: 'innerShadow', label: 'Inner Shadow' },
  { key: 'overlaysMasks', label: 'Overlays & Masks' },
]

const SHAPE_OPTIONS: { value: ImageShapeType; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
]

function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  disabled,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className={cn('article-text-tool__stepper', disabled && 'opacity-50', className)}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="article-text-tool__stepper-input"
      />
      <div className="article-text-tool__stepper-arrows">
        <button type="button" disabled={disabled} onClick={() => onChange(clamp(value + step))} aria-label="Increase">
          ▲
        </button>
        <button type="button" disabled={disabled} onClick={() => onChange(clamp(value - step))} aria-label="Decrease">
          ▼
        </button>
      </div>
    </div>
  )
}

function ToolIconButton({
  active,
  title,
  onClick,
  children,
  destructive,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'article-text-tool__icon-btn',
        active && 'article-text-tool__icon-btn--active',
        destructive && 'article-text-tool__icon-btn--destructive',
      )}
    >
      {children}
    </button>
  )
}

export function ArticleImageToolPanel({
  data,
  selectedBlockIds,
  objectCount,
  onChange,
  onDeselect,
}: ArticleImageToolPanelProps) {
  const [shapesOpen, setShapesOpen] = useState(true)
  const [shapesTab, setShapesTab] = useState<'basic' | 'shapes'>('basic')
  const [replacing, setReplacing] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const primaryBlockId = selectedBlockIds[0]
  const selectedBlock = primaryBlockId
    ? data.content.find((block) => (block.props as Record<string, unknown>).blockId === primaryBlockId)
    : null
  if (!selectedBlock || !primaryBlockId) return null

  const blockProps = selectedBlock.props as Record<string, unknown>
  const style = parseBlockStyle(blockProps.style)
  const imageUrl = String(blockProps.imageUrl ?? '')
  const panelTitle = objectCount > 1 ? `Image (${objectCount})` : 'Image'

  const applyStyle = (patch: Partial<CanvasBlockStyle>) => {
    onChange(updateCanvasBlocksStyle(data, selectedBlockIds, patch))
  }

  const handleReplaceFile = async (file: File) => {
    if (replacing || objectCount !== 1) return
    setReplacing(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      onChange(updateCanvasBlock(data, primaryBlockId, { imageUrl: uploaded.url }))
    } finally {
      setReplacing(false)
    }
  }

  return (
    <div className="article-text-tool article-image-tool article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">{panelTitle}</span>
        <button
          type="button"
          className="article-edit-tool-panel__close"
          title="Close"
          onClick={onDeselect}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Replace image"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleReplaceFile(file)
          e.target.value = ''
        }}
      />

      {objectCount === 1 ? (
        <div className="article-image-tool__replace">
          {imageUrl ? (
            <div className="article-image-tool__preview">
              <img src={imageUrl} alt="" className="article-image-tool__preview-img" />
            </div>
          ) : null}
          <button
            type="button"
            className="article-image-tool__replace-btn"
            disabled={replacing}
            onClick={() => replaceInputRef.current?.click()}
          >
            {replacing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{imageUrl ? 'Replace image' : 'Upload image'}</span>
          </button>
        </div>
      ) : null}

      <div className="article-text-tool__actions">
        <ToolIconButton
          title="Delete"
          destructive
          onClick={() => {
            onChange(removeCanvasBlocks(data, selectedBlockIds))
            onDeselect()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton title="Duplicate" onClick={() => onChange(duplicateCanvasBlock(data, primaryBlockId))}>
          <Copy className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton
          title="Send backward (one layer)"
          onClick={() => onChange(reorderBlock(data, primaryBlockId, 'back'))}
        >
          <ArrowDownToLine className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton
          title="Bring forward (one layer)"
          onClick={() => onChange(reorderBlock(data, primaryBlockId, 'front'))}
        >
          <ArrowUpToLine className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton
          title="Rotate counter-clockwise"
          onClick={() => onChange(rotateBlockAngle(data, primaryBlockId, -15))}
        >
          <RotateCcw className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton
          title="Rotate clockwise"
          onClick={() => onChange(rotateBlockAngle(data, primaryBlockId, 15))}
        >
          <RotateCw className="h-4 w-4" />
        </ToolIconButton>
        <ToolIconButton title="More" onClick={() => undefined}>
          <MoreHorizontal className="h-4 w-4" />
        </ToolIconButton>
      </div>

      <div className="article-image-tool__options-row">
        <div className="article-text-tool__checkbox-row article-image-tool__checkbox-grid">
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.preserveAspectRatio}
              onCheckedChange={(checked) => applyStyle({ preserveAspectRatio: Boolean(checked) })}
            />
            <span>Preserve aspect ratio</span>
          </label>
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.antiAlias}
              onCheckedChange={(checked) => applyStyle({ antiAlias: Boolean(checked) })}
            />
            <span>Anti-alias</span>
          </label>
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.backgroundEnabled}
              onCheckedChange={(checked) => applyStyle({ backgroundEnabled: Boolean(checked) })}
            />
            <span>Background</span>
          </label>
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.fillEnabled}
              onCheckedChange={(checked) => applyStyle({ fillEnabled: Boolean(checked) })}
            />
            <span>Fill</span>
          </label>
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.colorEnabled}
              onCheckedChange={(checked) => applyStyle({ colorEnabled: Boolean(checked) })}
            />
            <span>Color</span>
          </label>
          <label className="article-text-tool__checkbox">
            <Checkbox
              checked={style.masksEnabled}
              onCheckedChange={(checked) => applyStyle({ masksEnabled: Boolean(checked) })}
            />
            <span>Masks</span>
          </label>
        </div>
        <div className="article-image-tool__scale">
          <span>Scale:</span>
          <strong>{style.scale}%</strong>
        </div>
      </div>

      {style.backgroundEnabled ? (
        <div className="article-text-tool__bg-swatches px-2 pb-2">
          {ARTICLE_COLOR_TOKENS.slice(0, 6).map((token) => (
            <button
              key={token.id}
              type="button"
              title={token.label}
              onClick={() => applyStyle({ backgroundColorToken: token.id })}
              className={cn(
                'article-text-tool__color-dot article-text-tool__color-dot--sm',
                style.backgroundColorToken === token.id && 'article-text-tool__color-dot--active',
              )}
              style={{ backgroundColor: colorTokenToCss(token.id) }}
            />
          ))}
        </div>
      ) : null}

      {style.colorEnabled ? (
        <div className="article-text-tool__theme-colors px-2 pb-2">
          {ARTICLE_COLOR_TOKENS.map((token) => (
            <button
              key={token.id}
              type="button"
              title={token.label}
              onClick={() => applyStyle({ imageColorToken: token.id })}
              className={cn(
                'article-text-tool__color-dot',
                style.imageColorToken === token.id && 'article-text-tool__color-dot--active',
              )}
              style={{ backgroundColor: colorTokenToCss(token.id) }}
            />
          ))}
        </div>
      ) : null}

      <div className="article-text-tool__slider-row">
        <Label className="article-text-tool__slider-label">Angle</Label>
        <input
          type="range"
          min={0}
          max={360}
          value={style.angle}
          onChange={(e) => applyStyle({ angle: Number(e.target.value) })}
          className="article-text-tool__slider"
        />
        <NumberStepper
          value={style.angle}
          min={0}
          max={360}
          onChange={(angle) => applyStyle({ angle })}
          className="article-text-tool__slider-value"
        />
      </div>

      <div className="article-text-tool__slider-row">
        <Label className="article-text-tool__slider-label">Opacity</Label>
        <input
          type="range"
          min={0}
          max={100}
          value={style.opacity}
          onChange={(e) => applyStyle({ opacity: Number(e.target.value) })}
          className="article-text-tool__slider"
        />
        <NumberStepper
          value={style.opacity}
          min={0}
          max={100}
          onChange={(opacity) => applyStyle({ opacity })}
          className="article-text-tool__slider-value"
        />
      </div>

      <div className="article-text-tool__slider-row">
        <Label className="article-text-tool__slider-label">Scale</Label>
        <input
          type="range"
          min={10}
          max={200}
          value={style.scale}
          onChange={(e) => applyStyle({ scale: Number(e.target.value) })}
          className="article-text-tool__slider"
        />
        <NumberStepper
          value={style.scale}
          min={10}
          max={200}
          onChange={(scale) => applyStyle({ scale })}
          className="article-text-tool__slider-value"
        />
      </div>

      <div className="article-text-tool__field px-2 pb-2">
        <Label className="text-[11px] text-muted-foreground">Blend mode</Label>
        <Select value={style.blendMode} onValueChange={(blendMode) => applyStyle({ blendMode: blendMode as BlendMode })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLEND_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="article-image-tool__shapes">
        <button
          type="button"
          className="article-image-tool__shapes-header"
          onClick={() => setShapesOpen((open) => !open)}
        >
          <span>Shapes</span>
          <Minus className="h-3.5 w-3.5" />
        </button>

        {shapesOpen ? (
          <div className="article-image-tool__shapes-body">
            <div className="article-image-tool__shape-tabs">
              <button
                type="button"
                className={cn(shapesTab === 'basic' && 'article-image-tool__shape-tabs--active')}
                onClick={() => setShapesTab('basic')}
              >
                Basic
              </button>
              <button
                type="button"
                className={cn(shapesTab === 'shapes' && 'article-image-tool__shape-tabs--active')}
                onClick={() => setShapesTab('shapes')}
              >
                Shapes
              </button>
            </div>

            {shapesTab === 'basic' ? (
              <>
                <div className="article-image-tool__shape-radios">
                  {SHAPE_OPTIONS.map((shape) => (
                    <label key={shape.value} className="article-image-tool__shape-radio">
                      <input
                        type="radio"
                        name={`image-shape-${primaryBlockId}`}
                        checked={style.imageShape === shape.value}
                        onChange={() => applyStyle({ imageShape: shape.value })}
                      />
                      <span>{shape.label}</span>
                    </label>
                  ))}
                </div>

                <div className="article-text-tool__slider-row article-image-tool__roundness">
                  <label className="article-image-tool__shape-radio">
                    <input
                      type="radio"
                      readOnly
                      checked={style.imageShape === 'rectangle'}
                      className="pointer-events-none"
                    />
                    <span>Roundness</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={style.roundness}
                    disabled={style.imageShape !== 'rectangle'}
                    onChange={(e) => applyStyle({ roundness: Number(e.target.value) })}
                    className="article-text-tool__slider"
                  />
                  <NumberStepper
                    value={style.roundness}
                    min={0}
                    max={100}
                    disabled={style.imageShape !== 'rectangle'}
                    onChange={(roundness) => applyStyle({ roundness })}
                    className="article-text-tool__slider-value"
                  />
                </div>
              </>
            ) : (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Custom shape masks coming soon. Use Basic shapes for now.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="article-text-tool__more-body px-2 pb-3">
        <p className="text-[11px] font-medium text-muted-foreground">Effects</p>
        <div className="article-text-tool__effects-grid">
          {EFFECT_LABELS.map(({ key, label }) => (
            <label key={key} className="article-text-tool__effect">
              <Checkbox
                checked={style.effects[key]}
                onCheckedChange={() => onChange(toggleBlocksEffect(data, selectedBlockIds, key))}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {objectCount > 1 ? (
        <p className="border-t border-border px-2 py-2 text-xs text-muted-foreground">
          {objectCount} images selected — changes apply to all.
        </p>
      ) : null}
      </div>
    </div>
  )
}
