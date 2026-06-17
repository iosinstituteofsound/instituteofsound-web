import type { CSSProperties } from 'react'
import {
  findText2dEffectPreset,
  scaleFilterForIntensity,
  scaleTextShadowForIntensity,
} from '@/modules/editor/lib/article-text-2d-effects-library'
import type { CanvasBlockStyle } from '@/modules/editor/types/article-canvas.types'
import {
  DEFAULT_TEXT_2D_EFFECT,
  hasText2dEffect,
  type Text2dEffectState,
} from '@/modules/editor/types/article-text-2d-effect.types'

export function readText2dEffectFromStyle(style: CanvasBlockStyle): Text2dEffectState {
  return {
    presetId: style.text2dPresetId ?? '',
    intensity: style.text2dIntensity ?? DEFAULT_TEXT_2D_EFFECT.intensity,
  }
}

export function buildText2dEffectCss(style: CanvasBlockStyle): CSSProperties {
  const state = readText2dEffectFromStyle(style)
  if (!hasText2dEffect(state)) return {}

  const preset = findText2dEffectPreset(state.presetId)
  if (!preset) return {}

  const css: CSSProperties = {}

  const scaledShadow = preset.textShadow
    ? scaleTextShadowForIntensity(preset.textShadow, state.intensity)
    : undefined
  if (scaledShadow) css.textShadow = scaledShadow

  if (preset.webkitTextStroke) css.WebkitTextStroke = preset.webkitTextStroke

  if (preset.backgroundImage && preset.backgroundClipText) {
    css.backgroundImage = preset.backgroundImage
    css.WebkitBackgroundClip = 'text'
    css.backgroundClip = 'text'
    css.color = 'transparent'
  } else if (preset.color) {
    css.color = preset.color
  }

  if (preset.filter) {
    const scaledFilter = scaleFilterForIntensity(preset.filter, state.intensity)
    if (scaledFilter) css.filter = scaledFilter
  }

  if (preset.transform) css.transform = preset.transform
  if (preset.letterSpacing) css.letterSpacing = preset.letterSpacing
  if (preset.textTransform) css.textTransform = preset.textTransform as CSSProperties['textTransform']
  if (preset.fontWeight) css.fontWeight = preset.fontWeight

  return css
}

export function clearText2dEffectPatch(): Partial<CanvasBlockStyle> {
  return {
    text2dPresetId: '',
    text2dIntensity: DEFAULT_TEXT_2D_EFFECT.intensity,
  }
}
