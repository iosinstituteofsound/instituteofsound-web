import type { CSSProperties } from 'react'
import type { Data } from '@measured/puck'
import {
  artifactDesignToBackgroundImage,
  findArtifactDesign,
} from '@/modules/editor/lib/article-bg-artifacts-library'
import {
  DEFAULT_ARTICLE_CANVAS_ARTIFACT,
  DEFAULT_CANVAS_ARTIFACT_TRANSFORM,
  type ArticleCanvasArtifact,
  type CanvasArtifactTransform,
} from '@/modules/editor/types/article-canvas-artifact.types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function parseTransform(raw: Record<string, unknown>): CanvasArtifactTransform {
  return {
    rotate: asNumber(raw.canvasArtifactRotate, DEFAULT_CANVAS_ARTIFACT_TRANSFORM.rotate),
    scale: asNumber(raw.canvasArtifactScale, DEFAULT_CANVAS_ARTIFACT_TRANSFORM.scale),
    effectSize: asNumber(raw.canvasArtifactEffectSize, DEFAULT_CANVAS_ARTIFACT_TRANSFORM.effectSize),
    offsetX: asNumber(raw.canvasArtifactOffsetX, DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetX),
    offsetY: asNumber(raw.canvasArtifactOffsetY, DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetY),
  }
}

function normalizeArtifactZIndex(value: unknown): number {
  return Math.max(0, asNumber(value, 0))
}

export function parseCanvasArtifact(raw: unknown): ArticleCanvasArtifact {
  const props = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    categoryId: asString(props.canvasArtifactCategoryId),
    designId: asString(props.canvasArtifactDesignId),
    transform: parseTransform(props),
    hidden: props.canvasArtifactHidden === true,
    zIndex: normalizeArtifactZIndex(props.canvasArtifactZIndex),
  }
}

export function readCanvasArtifact(data: Data): ArticleCanvasArtifact {
  return parseCanvasArtifact(data.root?.props)
}

export function updateCanvasArtifact(
  data: Data,
  patch: Partial<ArticleCanvasArtifact> & { transform?: Partial<CanvasArtifactTransform> },
): Data {
  const current = readCanvasArtifact(data)
  const nextTransform = { ...current.transform, ...patch.transform }
  const nextZIndex = normalizeArtifactZIndex(patch.zIndex ?? current.zIndex)
  const next: ArticleCanvasArtifact = {
    categoryId: patch.categoryId ?? current.categoryId,
    designId: patch.designId ?? current.designId,
    transform: nextTransform,
    hidden: patch.hidden ?? current.hidden,
    zIndex: nextZIndex,
  }
  const props = { ...(data.root?.props ?? {}) }

  if (next.categoryId.trim()) {
    props.canvasArtifactCategoryId = next.categoryId.trim()
  } else {
    delete props.canvasArtifactCategoryId
  }

  if (next.designId.trim()) {
    props.canvasArtifactDesignId = next.designId.trim()
  } else {
    delete props.canvasArtifactDesignId
  }

  if (nextTransform.rotate !== DEFAULT_CANVAS_ARTIFACT_TRANSFORM.rotate) {
    props.canvasArtifactRotate = nextTransform.rotate
  } else {
    delete props.canvasArtifactRotate
  }

  if (nextTransform.scale !== DEFAULT_CANVAS_ARTIFACT_TRANSFORM.scale) {
    props.canvasArtifactScale = nextTransform.scale
  } else {
    delete props.canvasArtifactScale
  }

  if (nextTransform.effectSize !== DEFAULT_CANVAS_ARTIFACT_TRANSFORM.effectSize) {
    props.canvasArtifactEffectSize = nextTransform.effectSize
  } else {
    delete props.canvasArtifactEffectSize
  }

  if (nextTransform.offsetX !== DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetX) {
    props.canvasArtifactOffsetX = nextTransform.offsetX
  } else {
    delete props.canvasArtifactOffsetX
  }

  if (nextTransform.offsetY !== DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetY) {
    props.canvasArtifactOffsetY = nextTransform.offsetY
  } else {
    delete props.canvasArtifactOffsetY
  }

  if (next.hidden) {
    props.canvasArtifactHidden = true
  } else {
    delete props.canvasArtifactHidden
  }

  if (nextZIndex !== 0) {
    props.canvasArtifactZIndex = nextZIndex
  } else {
    delete props.canvasArtifactZIndex
  }

  if (!props.canvasArtifactCategoryId && !props.canvasArtifactDesignId) {
    delete props.canvasArtifactRotate
    delete props.canvasArtifactScale
    delete props.canvasArtifactEffectSize
    delete props.canvasArtifactOffsetX
    delete props.canvasArtifactOffsetY
    delete props.canvasArtifactHidden
    delete props.canvasArtifactZIndex
  }

  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

export function clearCanvasArtifact(data: Data): Data {
  const props = { ...(data.root?.props ?? {}) }
  delete props.canvasArtifactCategoryId
  delete props.canvasArtifactDesignId
  delete props.canvasArtifactRotate
  delete props.canvasArtifactScale
  delete props.canvasArtifactEffectSize
  delete props.canvasArtifactOffsetX
  delete props.canvasArtifactOffsetY
  delete props.canvasArtifactHidden
  delete props.canvasArtifactZIndex

  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

const ARTIFACT_SVG_SIZE = 120

export function artifactDesignBackgroundSize(
  fit: 'tile' | 'cover',
  scale: number,
): string {
  const scaleFactor = Math.max(25, scale) / 100
  if (fit === 'tile') {
    const tileSize = Math.round(ARTIFACT_SVG_SIZE * scaleFactor)
    return `${tileSize}px ${tileSize}px`
  }
  const coverScale = Math.max(25, scale)
  return `${coverScale}% ${coverScale}%`
}

export function artifactDesignToThumbStyle(svg: string, fit: 'tile' | 'cover' = 'tile'): CSSProperties {
  return {
    backgroundImage: artifactDesignToBackgroundImage(svg),
    backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat',
    backgroundSize: fit === 'tile' ? '18px 18px' : '100% 100%',
    backgroundPosition: 'center',
  }
}

export function canvasArtifactToStyle(artifact: ArticleCanvasArtifact): CSSProperties {
  const design = findArtifactDesign(artifact.categoryId, artifact.designId)
  if (!design) return {}

  const { rotate, scale, effectSize, offsetX, offsetY } = artifact.transform
  const fit = design.fit ?? 'tile'
  const transforms: string[] = []
  if (rotate) transforms.push(`rotate(${rotate}deg)`)
  if (effectSize !== 100) transforms.push(`scale(${Math.max(25, effectSize) / 100})`)

  return {
    backgroundImage: artifactDesignToBackgroundImage(design.svg),
    backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat',
    backgroundSize: artifactDesignBackgroundSize(fit, scale),
    backgroundPosition: `${50 + offsetX}% ${50 + offsetY}%`,
    transform: transforms.length ? transforms.join(' ') : undefined,
    transformOrigin: 'center center',
  }
}

export function isDefaultArtifactTransform(transform: CanvasArtifactTransform): boolean {
  return (
    transform.rotate === DEFAULT_CANVAS_ARTIFACT_TRANSFORM.rotate &&
    transform.scale === DEFAULT_CANVAS_ARTIFACT_TRANSFORM.scale &&
    transform.effectSize === DEFAULT_CANVAS_ARTIFACT_TRANSFORM.effectSize &&
    transform.offsetX === DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetX &&
    transform.offsetY === DEFAULT_CANVAS_ARTIFACT_TRANSFORM.offsetY
  )
}

export function emptyCanvasArtifact(): ArticleCanvasArtifact {
  return { ...DEFAULT_ARTICLE_CANVAS_ARTIFACT, transform: { ...DEFAULT_CANVAS_ARTIFACT_TRANSFORM } }
}
