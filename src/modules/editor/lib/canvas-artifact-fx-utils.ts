import type { CSSProperties } from 'react'
import type { Data } from '@measured/puck'
import {
  artifactFxFilterToCss,
  artifactFxPresetToMeshStyle,
  artifactFxPresetToOverlayStyle,
  findArtifactFxPreset,
  resolveArtifactFxFilter,
} from '@/modules/editor/lib/article-artifact-fx-library'
import {
  DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX,
  hasCanvasArtifactFx,
  type ArticleCanvasArtifactFx,
} from '@/modules/editor/types/article-canvas-artifact-fx.types'
import { cloneCanvasRootProps, withCanvasRootProps } from '@/modules/editor/lib/canvas-root-props'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function parseCanvasArtifactFx(raw: unknown): ArticleCanvasArtifactFx {
  const props = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    presetId: asString(props.canvasArtifactFxPresetId),
    intensity: Math.max(
      0,
      Math.min(100, asNumber(props.canvasArtifactFxIntensity, DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX.intensity)),
    ),
    hidden: props.canvasArtifactFxHidden === true,
  }
}

export function readCanvasArtifactFx(data: Data): ArticleCanvasArtifactFx {
  return parseCanvasArtifactFx(data.root?.props)
}

export function updateCanvasArtifactFx(data: Data, patch: Partial<ArticleCanvasArtifactFx>): Data {
  const current = readCanvasArtifactFx(data)
  const next: ArticleCanvasArtifactFx = {
    presetId: patch.presetId ?? current.presetId,
    intensity: patch.intensity ?? current.intensity,
    hidden: patch.hidden ?? current.hidden,
  }
  const props = cloneCanvasRootProps(data)

  if (next.presetId.trim() && next.presetId !== 'none') {
    props.canvasArtifactFxPresetId = next.presetId.trim()
  } else {
    delete props.canvasArtifactFxPresetId
  }

  if (next.intensity !== DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX.intensity) {
    props.canvasArtifactFxIntensity = next.intensity
  } else {
    delete props.canvasArtifactFxIntensity
  }

  if (next.hidden) {
    props.canvasArtifactFxHidden = true
  } else {
    delete props.canvasArtifactFxHidden
  }

  if (!props.canvasArtifactFxPresetId) {
    delete props.canvasArtifactFxIntensity
    delete props.canvasArtifactFxHidden
  }

  return withCanvasRootProps(data, props)
}

export function clearCanvasArtifactFx(data: Data): Data {
  const props = cloneCanvasRootProps(data)
  delete props.canvasArtifactFxPresetId
  delete props.canvasArtifactFxIntensity
  delete props.canvasArtifactFxHidden
  return withCanvasRootProps(data, props)
}

export function canvasArtifactFxFilterStyle(fx: ArticleCanvasArtifactFx): CSSProperties {
  if (!hasCanvasArtifactFx(fx) || fx.hidden) return {}
  const preset = findArtifactFxPreset(fx.presetId)
  if (!preset) return {}
  const filter = resolveArtifactFxFilter(preset, fx.intensity)
  const css = artifactFxFilterToCss(filter)
  return css !== 'none' ? { filter: css } : {}
}

export function canvasArtifactFxOverlayStyle(fx: ArticleCanvasArtifactFx): CSSProperties {
  if (!hasCanvasArtifactFx(fx) || fx.hidden) return {}
  const overlay = artifactFxPresetToOverlayStyle(fx.presetId, fx.intensity)
  if (!overlay) return {}
  return {
    background: overlay.background,
    mixBlendMode: overlay.mixBlendMode as CSSProperties['mixBlendMode'],
    opacity: overlay.opacity,
  }
}

export function canvasArtifactFxMeshStyle(fx: ArticleCanvasArtifactFx): CSSProperties {
  if (!hasCanvasArtifactFx(fx) || fx.hidden) return {}
  const mesh = artifactFxPresetToMeshStyle(fx.presetId, fx.intensity)
  if (!mesh) return {}
  return {
    background: mesh.background,
    backgroundSize: mesh.backgroundSize,
    mixBlendMode: mesh.mixBlendMode as CSSProperties['mixBlendMode'],
    opacity: mesh.opacity,
  }
}

export function isDefaultCanvasArtifactFx(fx: ArticleCanvasArtifactFx): boolean {
  return !hasCanvasArtifactFx(fx) && fx.intensity === DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX.intensity
}
