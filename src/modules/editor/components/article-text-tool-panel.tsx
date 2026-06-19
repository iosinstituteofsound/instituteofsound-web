import { useState } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  ChevronDown,
  Copy,
  Italic,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Trash2,
  Underline,
  Wand2,
  X,
} from 'lucide-react'
import type { Data } from '@measured/puck'
import { ArticleFontLibraryPicker } from '@/modules/editor/components/article-font-library-picker'
import { ArticleText2dEffectsModal } from '@/modules/editor/components/article-text-2d-effects-modal'
import { ARTICLE_COLOR_TOKENS, colorTokenToCss } from '@/modules/editor/lib/article-color-tokens'
import { getFontLabel, resolveFontFamily } from '@/modules/editor/lib/article-font-library'
import { fillSwatchClass } from '@/modules/editor/lib/canvas-style-to-css'
import {
  duplicateCanvasBlock,
  getBlockBodyQuote,
  getBlockQuoteAttribution,
  getBlockSectionBody,
  getBlockTextContent,
  parseBlockStyle,
  removeCanvasBlocks,
  reorderBlock,
  rotateBlockAngle,
  setBlockQuoteContent,
  setBlockSectionBody,
  setBlockTextContent,
  toggleBlocksEffect,
  updateCanvasBlocksStyle,
} from '@/modules/editor/lib/canvas-block-utils'
import type {
  BlendMode,
  CanvasBlockEffects,
  CanvasBlockStyle,
  TextFillType,
} from '@/modules/editor/types/article-canvas.types'
import {
  hasText2dEffect,
} from '@/modules/editor/types/article-text-2d-effect.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { isTextCanvasBlock } from '@/modules/editor/types/article-canvas.types'
import { Button } from '@/shared/components/ui/button'
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

interface ArticleTextToolPanelProps {
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

function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className={cn('article-text-tool__stepper', className)}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="article-text-tool__stepper-input"
      />
      <div className="article-text-tool__stepper-arrows">
        <button type="button" onClick={() => onChange(clamp(value + step))} aria-label="Increase">
          ▲
        </button>
        <button type="button" onClick={() => onChange(clamp(value - step))} aria-label="Decrease">
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

export function ArticleTextToolPanel({
  data,
  selectedBlockIds,
  blockType,
  objectCount,
  onChange,
  onDeselect,
}: ArticleTextToolPanelProps) {
  const [moreOpen, setMoreOpen] = useState(true)
  const [fontPickerOpen, setFontPickerOpen] = useState(false)
  const [text2dOpen, setText2dOpen] = useState(false)

  const primaryBlockId = selectedBlockIds[0]
  const selectedBlock = primaryBlockId
    ? data.content.find((block) => (block.props as Record<string, unknown>).blockId === primaryBlockId)
    : null
  if (!selectedBlock || !primaryBlockId) return null

  const style = parseBlockStyle((selectedBlock.props as Record<string, unknown>).style)
  const isText = isTextCanvasBlock(blockType)

  const applyStyle = (patch: Partial<CanvasBlockStyle>) => {
    onChange(updateCanvasBlocksStyle(data, selectedBlockIds, patch))
  }

  const textContent = objectCount === 1 ? getBlockTextContent(selectedBlock) : ''
  const sectionBody = objectCount === 1 ? getBlockSectionBody(selectedBlock) : ''
  const quoteAttribution = objectCount === 1 ? getBlockQuoteAttribution(selectedBlock) : ''
  const isQuoteBlock = objectCount === 1 && Boolean(getBlockBodyQuote(selectedBlock))
  const isSectionBlock = blockType === 'ArticleSection'
  const panelTitle =
    objectCount > 1
      ? `Text (${objectCount})`
      : isQuoteBlock
        ? 'Quote'
        : isSectionBlock
          ? 'Section'
          : 'Text'

  return (
    <div className="article-text-tool article-edit-tool-panel">
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
        <ToolIconButton
          title="Duplicate"
          onClick={() => onChange(duplicateCanvasBlock(data, primaryBlockId))}
        >
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
        <ToolIconButton title="More" onClick={() => setMoreOpen((o) => !o)}>
          <MoreHorizontal className="h-4 w-4" />
        </ToolIconButton>
      </div>

      {isText ? (
        <>
          {objectCount === 1 ? (
            isSectionBlock ? (
              <div className="article-text-tool__section-fields">
                <div className="article-text-tool__field">
                  <Label className="article-text-tool__section-label">Heading</Label>
                  <textarea
                    value={textContent}
                    onChange={(e) => onChange(setBlockTextContent(data, primaryBlockId, e.target.value))}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={2}
                    className="article-text-tool__textarea"
                    placeholder="Section heading…"
                  />
                </div>
                <div className="article-text-tool__field">
                  <Label className="article-text-tool__section-label">Body text</Label>
                  <textarea
                    value={sectionBody}
                    onChange={(e) => onChange(setBlockSectionBody(data, primaryBlockId, e.target.value))}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={6}
                    className="article-text-tool__textarea"
                    placeholder="Section body copy…"
                  />
                </div>
              </div>
            ) : isQuoteBlock ? (
              <div className="article-text-tool__quote-fields space-y-2">
                <textarea
                  value={textContent}
                  onChange={(e) =>
                    onChange(setBlockQuoteContent(data, primaryBlockId, e.target.value, quoteAttribution))
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  rows={4}
                  className="article-text-tool__textarea"
                  placeholder="Quote text..."
                />
                <input
                  type="text"
                  value={quoteAttribution}
                  onChange={(e) =>
                    onChange(setBlockQuoteContent(data, primaryBlockId, textContent, e.target.value))
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  className="article-text-tool__textarea h-8 px-2 text-xs"
                  placeholder="Attribution (e.g. Static Artist)"
                />
              </div>
            ) : (
              <textarea
                value={textContent}
                onChange={(e) => onChange(setBlockTextContent(data, primaryBlockId, e.target.value))}
                onKeyDown={(e) => e.stopPropagation()}
                rows={3}
                className="article-text-tool__textarea"
                placeholder="Type your text..."
              />
            )
          ) : (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              {objectCount} text objects — style changes apply to all selected.
            </p>
          )}

          {!isQuoteBlock ? (
          <>
          <div className="article-text-tool__font-row">
            <button
              type="button"
              className="article-text-tool__font-trigger"
              style={{ fontFamily: resolveFontFamily(style.fontFamilyId) }}
              onClick={(e) => {
                e.stopPropagation()
                setFontPickerOpen(true)
              }}
            >
              <span className="truncate">{getFontLabel(style.fontFamilyId)}</span>
              <span className="text-muted-foreground">▾</span>
            </button>
            <NumberStepper
              value={style.fontSize}
              min={8}
              max={400}
              step={1}
              onChange={(fontSize) => applyStyle({ fontSize })}
              className="article-text-tool__size-stepper"
            />
          </div>

          <div className="article-text-tool__format-row">
            <ToolIconButton
              title="2D Text Effects"
              active={text2dOpen || hasText2dEffect({ presetId: style.text2dPresetId, intensity: style.text2dIntensity })}
              onClick={() => setText2dOpen((open) => !open)}
            >
              <Wand2 className="h-4 w-4" />
            </ToolIconButton>
            <span className="article-text-tool__divider" />
            <ToolIconButton
              title="Bold"
              active={style.fontWeight === 'bold'}
              onClick={() => applyStyle({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}
            >
              <Bold className="h-4 w-4" />
            </ToolIconButton>
            <ToolIconButton
              title="Italic"
              active={style.fontStyle === 'italic'}
              onClick={() => applyStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
            >
              <Italic className="h-4 w-4" />
            </ToolIconButton>
            <ToolIconButton
              title="Underline"
              active={style.textDecoration === 'underline'}
              onClick={() =>
                applyStyle({
                  textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
            >
              <Underline className="h-4 w-4" />
            </ToolIconButton>
            <ToolIconButton
              title="Strikethrough"
              active={style.textDecoration === 'line-through'}
              onClick={() =>
                applyStyle({
                  textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through',
                })
              }
            >
              <Strikethrough className="h-4 w-4" />
            </ToolIconButton>
            <span className="article-text-tool__divider" />
            {(
              [
                { align: 'left' as const, icon: AlignLeft },
                { align: 'center' as const, icon: AlignCenter },
                { align: 'right' as const, icon: AlignRight },
                { align: 'justify' as const, icon: AlignJustify },
              ] as const
            ).map(({ align, icon: Icon }) => (
              <ToolIconButton
                key={align}
                title={`Align ${align}`}
                active={style.textAlign === align}
                onClick={() => applyStyle({ textAlign: align })}
              >
                <Icon className="h-4 w-4" />
              </ToolIconButton>
            ))}
          </div>

          <div className="article-text-tool__fill-row">
            {(['solid', 'pattern', 'gradient', 'radial'] as TextFillType[]).map((fillType) => (
              <button
                key={fillType}
                type="button"
                title={fillType}
                onClick={() => applyStyle({ fillType })}
                className={cn(
                  fillSwatchClass(fillType),
                  style.fillType === fillType && 'article-text-tool__fill-swatch--active',
                )}
              />
            ))}
          </div>

          <div className="article-text-tool__theme-colors">
            {ARTICLE_COLOR_TOKENS.map((token) => (
              <button
                key={token.id}
                type="button"
                title={token.label}
                onClick={() => applyStyle({ colorToken: token.id })}
                className={cn(
                  'article-text-tool__color-dot',
                  style.colorToken === token.id && 'article-text-tool__color-dot--active',
                )}
                style={{ backgroundColor: colorTokenToCss(token.id) }}
              />
            ))}
          </div>
          </>
          ) : null}
        </>
      ) : null}

      {!isQuoteBlock ? (
      <>
      <div className="article-text-tool__checkbox-row">
        <label className="article-text-tool__checkbox">
          <Checkbox
            checked={style.preserveAspectRatio}
            onCheckedChange={(checked) => applyStyle({ preserveAspectRatio: Boolean(checked) })}
          />
          <span>Preserve aspect ratio</span>
        </label>
        <label className="article-text-tool__checkbox">
          <Checkbox
            checked={style.backgroundEnabled}
            onCheckedChange={(checked) => applyStyle({ backgroundEnabled: Boolean(checked) })}
          />
          <span>Background</span>
        </label>
        {style.backgroundEnabled ? (
          <div className="article-text-tool__bg-swatches">
            {ARTICLE_COLOR_TOKENS.slice(0, 4).map((token) => (
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
      </div>

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

      {moreOpen ? (
        <div className="article-text-tool__more">
          <button
            type="button"
            className="article-text-tool__more-toggle"
            onClick={() => setMoreOpen(false)}
          >
            <span>More options</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <div className="article-text-tool__more-body">
            <div className="article-text-tool__field">
              <Label className="text-[11px] text-muted-foreground">Blend mode</Label>
              <Select
                value={style.blendMode}
                onValueChange={(blendMode) => applyStyle({ blendMode: blendMode as BlendMode })}
              >
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

            <div className="article-text-tool__spacing-row">
              <div className="article-text-tool__field">
                <Label className="text-[11px] text-muted-foreground">Letter spacing</Label>
                <NumberStepper
                  value={style.letterSpacing}
                  min={-50}
                  max={50}
                  onChange={(letterSpacing) => applyStyle({ letterSpacing })}
                />
              </div>
              <div className="article-text-tool__field">
                <Label className="text-[11px] text-muted-foreground">Line spacing</Label>
                <NumberStepper
                  value={style.lineSpacing}
                  min={-50}
                  max={50}
                  onChange={(lineSpacing) => applyStyle({ lineSpacing })}
                />
              </div>
            </div>

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
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={() => setMoreOpen(true)}
        >
          Show more options
        </Button>
      )}
      </>
      ) : null}
      </div>

      {text2dOpen ? (
        <ArticleText2dEffectsModal
          data={data}
          selectedBlockIds={selectedBlockIds}
          onChange={onChange}
          onClose={() => setText2dOpen(false)}
        />
      ) : null}

      <ArticleFontLibraryPicker
        open={fontPickerOpen}
        onOpenChange={setFontPickerOpen}
        value={style.fontFamilyId}
        onApply={(fontFamilyId) => applyStyle({ fontFamilyId })}
      />
    </div>
  )
}
