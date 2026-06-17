import type { CSSProperties } from 'react'
import {
  findText3dEffectPreset,
  resolveText3dEffectCss,
} from '@/modules/editor/lib/article-text-3d-effects-library'
import type { CanvasBlockStyle } from '@/modules/editor/types/article-canvas.types'
import {
  DEFAULT_TEXT_3D_EFFECT,
  hasText3dEffect,
  type Text3dEffectState,
} from '@/modules/editor/types/article-text-3d-effect.types'

export function readText3dEffectFromStyle(style: CanvasBlockStyle): Text3dEffectState {
  return {
    presetId: style.text3dPresetId ?? '',
    intensity: style.text3dIntensity ?? DEFAULT_TEXT_3D_EFFECT.intensity,
  }
}

export function buildText3dEffectCss(style: CanvasBlockStyle): CSSProperties {
  const state = readText3dEffectFromStyle(style)
  if (!hasText3dEffect(state)) return {}

  const preset = findText3dEffectPreset(state.presetId)
  if (!preset) return {}

  return resolveText3dEffectCss(preset, state.intensity) as CSSProperties
}

export function clearText3dEffectPatch(): Partial<CanvasBlockStyle> {
  return {
    text3dPresetId: '',
    text3dIntensity: DEFAULT_TEXT_3D_EFFECT.intensity,
  }
}
