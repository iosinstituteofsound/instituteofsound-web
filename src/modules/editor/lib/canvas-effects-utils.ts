import type { CSSProperties } from 'react'
import type { Data } from '@measured/puck'
import {
  canvasEffectFilterToCss,
  canvasEffectPresetToOverlayStyle,
  findCanvasEffectPreset,
  resolveCanvasEffectFilter,
} from '@/modules/editor/lib/article-canvas-effects-library'
import {
  DEFAULT_ARTICLE_CANVAS_EFFECTS,
  hasCanvasEffects,
  type ArticleCanvasEffects,
} from '@/modules/editor/types/article-canvas-effects.types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function parseCanvasEffects(raw: unknown): ArticleCanvasEffects {
  const props = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    presetId: asString(props.canvasEffectPresetId),
    intensity: Math.max(0, Math.min(100, asNumber(props.canvasEffectIntensity, DEFAULT_ARTICLE_CANVAS_EFFECTS.intensity))),
    hidden: props.canvasEffectHidden === true,
  }
}

export function readCanvasEffects(data: Data): ArticleCanvasEffects {
  return parseCanvasEffects(data.root?.props)
}

export function updateCanvasEffects(data: Data, patch: Partial<ArticleCanvasEffects>): Data {
  const current = readCanvasEffects(data)
  const next: ArticleCanvasEffects = {
    presetId: patch.presetId ?? current.presetId,
    intensity: patch.intensity ?? current.intensity,
    hidden: patch.hidden ?? current.hidden,
  }
  const props = { ...(data.root?.props ?? {}) }

  if (next.presetId.trim() && next.presetId !== 'none') {
    props.canvasEffectPresetId = next.presetId.trim()
  } else {
    delete props.canvasEffectPresetId
  }

  if (next.intensity !== DEFAULT_ARTICLE_CANVAS_EFFECTS.intensity) {
    props.canvasEffectIntensity = next.intensity
  } else {
    delete props.canvasEffectIntensity
  }

  if (next.hidden) {
    props.canvasEffectHidden = true
  } else {
    delete props.canvasEffectHidden
  }

  if (!props.canvasEffectPresetId) {
    delete props.canvasEffectIntensity
    delete props.canvasEffectHidden
  }

  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

export function clearCanvasEffects(data: Data): Data {
  const props = { ...(data.root?.props ?? {}) }
  delete props.canvasEffectPresetId
  delete props.canvasEffectIntensity
  delete props.canvasEffectHidden
  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

export function canvasEffectsFilterStyle(effects: ArticleCanvasEffects): CSSProperties {
  if (!hasCanvasEffects(effects) || effects.hidden) return {}
  const preset = findCanvasEffectPreset(effects.presetId)
  if (!preset) return {}
  const filter = resolveCanvasEffectFilter(preset, effects.intensity)
  return { filter: canvasEffectFilterToCss(filter) }
}

export function canvasEffectsOverlayStyle(effects: ArticleCanvasEffects): CSSProperties {
  if (!hasCanvasEffects(effects) || effects.hidden) return {}
  const overlay = canvasEffectPresetToOverlayStyle(effects.presetId, effects.intensity)
  if (!overlay) return {}
  return {
    background: overlay.background,
    mixBlendMode: overlay.mixBlendMode as CSSProperties['mixBlendMode'],
    opacity: overlay.opacity,
  }
}

export function canvasEffectPreviewThumbStyle(presetId: string): CSSProperties {
  const preset = findCanvasEffectPreset(presetId)
  if (!preset) return {}
  const filter = resolveCanvasEffectFilter(preset, 100)
  return { filter: canvasEffectFilterToCss(filter) }
}

export function isDefaultCanvasEffects(effects: ArticleCanvasEffects): boolean {
  return !hasCanvasEffects(effects) && effects.intensity === DEFAULT_ARTICLE_CANVAS_EFFECTS.intensity
}
