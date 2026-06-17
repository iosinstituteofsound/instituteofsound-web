import { colorTokenToCss } from '@/modules/editor/lib/article-color-tokens'
import { resolveFontFamily } from '@/modules/editor/lib/article-font-library'
import { buildText3dEffectCss, readText3dEffectFromStyle } from '@/modules/editor/lib/canvas-text-3d-effects-utils'
import type { CanvasBlockStyle, TextFillType } from '@/modules/editor/types/article-canvas.types'
import { buildText2dEffectCss, readText2dEffectFromStyle } from '@/modules/editor/lib/canvas-text-2d-effects-utils'
import { hasText2dEffect } from '@/modules/editor/types/article-text-2d-effect.types'
import { hasText3dEffect } from '@/modules/editor/types/article-text-3d-effect.types'

function fillColor(style: CanvasBlockStyle): string {
  const token = colorTokenToCss(style.colorToken)
  switch (style.fillType) {
    case 'pattern':
      return token
    case 'gradient':
      return 'transparent'
    case 'radial':
      return 'transparent'
    default:
      return token
  }
}

function buildFillBackground(style: CanvasBlockStyle): string | undefined {
  const fg = colorTokenToCss(style.colorToken)
  const primary = colorTokenToCss('primary')
  const muted = colorTokenToCss('muted-foreground')
  const destructive = colorTokenToCss('destructive')

  switch (style.fillType) {
    case 'pattern':
      return `radial-gradient(circle, ${fg} 18%, transparent 19%)`
    case 'gradient':
      return `linear-gradient(135deg, ${primary}, ${destructive})`
    case 'radial':
      return `radial-gradient(circle at 30% 30%, ${primary}, ${muted})`
    default:
      return undefined
  }
}

function buildTextShadows(style: CanvasBlockStyle): string[] {
  const shadows: string[] = []
  const fg = colorTokenToCss(style.colorToken)

  if (style.effects.dropShadow) {
    shadows.push(`4px 4px 10px color-mix(in oklch, ${fg} 55%, transparent)`)
  }
  if (style.effects.longShadow) {
    shadows.push(`2px 2px 0 ${fg}, 4px 4px 0 ${fg}, 6px 6px 0 ${fg}, 8px 8px 0 color-mix(in oklch, ${fg} 70%, transparent)`)
  }
  if (style.effects.emboss) {
    shadows.push(
      `1px 1px 0 color-mix(in oklch, ${fg} 80%, white), -1px -1px 0 color-mix(in oklch, ${fg} 40%, black)`,
    )
  }

  return shadows
}

function buildTextBoxShadows(style: CanvasBlockStyle): string[] {
  const shadows: string[] = []
  const fg = colorTokenToCss(style.colorToken)

  if (style.effects.innerGlow) {
    shadows.push(`inset 0 0 14px color-mix(in oklch, ${fg} 55%, transparent)`)
  }
  if (style.effects.innerShadow) {
    shadows.push(`inset 2px 2px 8px color-mix(in oklch, ${fg} 45%, black)`)
  }

  return shadows
}

function buildTextFill(style: CanvasBlockStyle): React.CSSProperties {
  const fillBg = buildFillBackground(style)

  if (style.fillType === 'gradient' || style.fillType === 'radial') {
    return {
      backgroundImage: fillBg,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }
  }

  if (style.fillType === 'pattern') {
    return {
      backgroundImage: fillBg,
      backgroundSize: '8px 8px',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }
  }

  return { color: fillColor(style) }
}

export function buildCanvasTextFrameCss(style: CanvasBlockStyle): React.CSSProperties {
  return {
    backgroundColor: style.backgroundEnabled ? colorTokenToCss(style.backgroundColorToken) : undefined,
    padding: style.backgroundEnabled ? '0.25rem 0.5rem' : undefined,
    borderRadius: style.backgroundEnabled ? '0.25rem' : undefined,
  }
}

export function buildCanvasTextContentCss(style: CanvasBlockStyle): React.CSSProperties {
  const fg = colorTokenToCss(style.colorToken)
  const text2dCss = buildText2dEffectCss(style)
  const text3dCss = buildText3dEffectCss(style)
  const hasText2d = hasText2dEffect(readText2dEffectFromStyle(style))
  const hasText3d = hasText3dEffect(readText3dEffectFromStyle(style))
  const hasStyledText = hasText2d || hasText3d
  const textShadows = hasStyledText ? [] : buildTextShadows(style)
  const boxShadows = buildTextBoxShadows(style)
  const filters: string[] = []

  if (!hasStyledText && style.effects.outerGlow) filters.push(`drop-shadow(0 0 10px ${fg})`)
  if (!hasStyledText && style.effects.transform) filters.push('contrast(1.08) saturate(1.05)')

  const styledGradientFill = text2dCss.backgroundImage || text3dCss.backgroundImage
  const baseFill = styledGradientFill ? {} : buildTextFill(style)

  const mergedTextShadow = [
    ...(textShadows.length ? [textShadows.join(', ')] : []),
    ...(text2dCss.textShadow ? [text2dCss.textShadow] : []),
    ...(text3dCss.textShadow ? [text3dCss.textShadow] : []),
  ].filter(Boolean)

  const mergedFilters = [
    ...filters,
    ...(text2dCss.filter ? [text2dCss.filter] : []),
    ...(text3dCss.filter ? [text3dCss.filter] : []),
  ].filter(Boolean)

  const {
    textShadow: _t2dShadow,
    filter: _t2dFilter,
    transform: _t2dTransform,
    ...text2dRest
  } = text2dCss
  const {
    textShadow: _t3dShadow,
    filter: _t3dFilter,
    transform: _t3dTransform,
    ...text3dRest
  } = text3dCss

  const textTransform =
    text3dCss.textTransform ?? text2dCss.textTransform
  const letterSpacing =
    text3dCss.letterSpacing ?? text2dCss.letterSpacing ?? (style.letterSpacing ? `${style.letterSpacing}px` : undefined)
  const fontWeight = text3dCss.fontWeight ?? text2dCss.fontWeight ?? style.fontWeight
  const webkitTextStroke =
    text3dCss.WebkitTextStroke ??
    text2dCss.WebkitTextStroke ??
    (style.effects.outline && !hasStyledText ? `1px ${fg}` : undefined)

  return {
    ...baseFill,
    ...text2dRest,
    ...text3dRest,
    opacity: style.opacity / 100,
    fontFamily: resolveFontFamily(style.fontFamilyId),
    fontSize: `${style.fontSize}px`,
    fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration === 'none' ? undefined : style.textDecoration,
    letterSpacing,
    textTransform: textTransform as React.CSSProperties['textTransform'],
    lineHeight: style.lineSpacing ? 1 + style.lineSpacing / 100 : 'normal',
    mixBlendMode: style.blendMode === 'normal' ? undefined : style.blendMode,
    WebkitTextStroke: webkitTextStroke,
    textShadow: mergedTextShadow.length ? mergedTextShadow.join(', ') : undefined,
    boxShadow: boxShadows.length ? boxShadows.join(', ') : undefined,
    filter: mergedFilters.length ? mergedFilters.join(' ') : undefined,
    transform: text3dCss.transform ?? text2dCss.transform,
    transformOrigin: text3dCss.transformOrigin,
    transformStyle: text3dCss.transformStyle,
    WebkitMaskImage: style.effects.overlaysMasks
      ? 'linear-gradient(180deg, black 70%, transparent 100%)'
      : undefined,
    maskImage: style.effects.overlaysMasks
      ? 'linear-gradient(180deg, black 70%, transparent 100%)'
      : undefined,
    backgroundColor: 'transparent',
  }
}

export function buildCanvasBlockCss(style: CanvasBlockStyle): React.CSSProperties {
  const content = buildCanvasTextContentCss(style)
  const frame = buildCanvasTextFrameCss(style)
  const text2dCss = buildText2dEffectCss(style)
  const text3dCss = buildText3dEffectCss(style)
  const hasLegacyTransform =
    style.effects.transform && !text2dCss.transform && !text3dCss.transform

  return {
    ...content,
    ...frame,
    transform: hasLegacyTransform ? 'skewX(-2deg)' : undefined,
  }
}

export function fillSwatchClass(fillType: TextFillType): string {
  return `article-text-tool__fill-swatch article-text-tool__fill-swatch--${fillType}`
}

function buildImageEffectFilters(style: CanvasBlockStyle): string[] {
  const filters: string[] = []
  const fg = colorTokenToCss(style.colorToken)

  if (style.effects.outerGlow) filters.push(`drop-shadow(0 0 8px ${fg})`)
  if (style.effects.dropShadow) filters.push(`drop-shadow(4px 4px 8px color-mix(in oklch, ${fg} 35%, transparent)`)
  if (style.effects.emboss) filters.push('contrast(1.12) brightness(1.05)')
  if (style.effects.transform) filters.push('contrast(1.08) saturate(1.1)')

  return filters
}

export function buildCanvasImageCss(style: CanvasBlockStyle): {
  wrapper: React.CSSProperties
  img: React.CSSProperties
  placeholder: React.CSSProperties
} {
  const fg = colorTokenToCss(style.colorToken)
  const fillBg = buildFillBackground(style)
  let borderRadius = `${style.roundness}px`
  let clipPath: string | undefined

  if (style.imageShape === 'circle') {
    borderRadius = '50%'
    clipPath = 'circle(50% at center)'
  } else if (style.imageShape === 'ellipse') {
    borderRadius = '50% / 40%'
    clipPath = 'ellipse(50% 42% at center)'
  }

  const filters = buildImageEffectFilters(style)
  const scale = style.scale / 100

  const wrapper: React.CSSProperties = {
    opacity: style.opacity / 100,
    mixBlendMode: style.blendMode === 'normal' ? undefined : style.blendMode,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'center center',
    backgroundColor: style.backgroundEnabled ? colorTokenToCss(style.backgroundColorToken) : undefined,
    backgroundImage: style.fillEnabled ? fillBg : undefined,
    borderRadius,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  }

  const img: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: style.preserveAspectRatio ? 'contain' : 'cover',
    borderRadius,
    clipPath,
    imageRendering: style.antiAlias ? 'auto' : 'pixelated',
    filter: filters.length ? filters.join(' ') : undefined,
    boxShadow: style.effects.innerGlow
      ? `inset 0 0 12px color-mix(in oklch, ${fg} 45%, transparent)`
      : style.effects.innerShadow
        ? `inset 2px 2px 6px color-mix(in oklch, ${fg} 30%, black)`
        : undefined,
    WebkitMaskImage: style.masksEnabled || style.effects.overlaysMasks
      ? 'linear-gradient(180deg, black 72%, transparent 100%)'
      : undefined,
    maskImage: style.masksEnabled || style.effects.overlaysMasks
      ? 'linear-gradient(180deg, black 72%, transparent 100%)'
      : undefined,
  }

  const placeholder: React.CSSProperties = {
    borderRadius,
    backgroundColor: style.backgroundEnabled ? colorTokenToCss(style.backgroundColorToken) : undefined,
    backgroundImage: style.fillEnabled ? fillBg : undefined,
    opacity: style.opacity / 100,
  }

  if (style.colorEnabled) {
    wrapper.boxShadow = `inset 0 0 0 9999px color-mix(in oklch, ${colorTokenToCss(style.imageColorToken)} 28%, transparent)`
  }

  if (style.effects.outline) {
    wrapper.outline = `2px solid ${fg}`
    wrapper.outlineOffset = '2px'
  }

  return { wrapper, img, placeholder }
}
