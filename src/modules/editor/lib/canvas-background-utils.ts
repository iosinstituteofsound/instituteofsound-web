import type { CSSProperties } from 'react'
import type { Data } from '@measured/puck'
import {
  DEFAULT_ARTICLE_CANVAS_BACKGROUND,
  type ArticleCanvasBackground,
  type CanvasBackgroundFit,
  surfaceTokenToCss,
} from '@/modules/editor/types/article-canvas-background.types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asFit(value: unknown): CanvasBackgroundFit {
  return value === 'contain' || value === 'tile' ? value : 'cover'
}

export function parseCanvasBackground(raw: unknown): ArticleCanvasBackground {
  const props = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    imageUrl: asString(props.canvasBackgroundUrl),
    colorToken: asString(props.canvasBackgroundColorToken),
    customColor: asString(props.canvasBackgroundCustomColor),
    fit: asFit(props.canvasBackgroundFit),
    hidden: props.canvasBackgroundHidden === true,
  }
}

export function resolveCanvasBackgroundColor(bg: ArticleCanvasBackground): string | undefined {
  if (bg.customColor.trim()) return bg.customColor.trim()
  if (bg.colorToken.trim()) return surfaceTokenToCss(bg.colorToken)
  return undefined
}

export function readCanvasBackground(data: Data): ArticleCanvasBackground {
  return parseCanvasBackground(data.root?.props)
}

export function updateCanvasBackground(
  data: Data,
  patch: Partial<ArticleCanvasBackground>,
): Data {
  const current = readCanvasBackground(data)
  const next: ArticleCanvasBackground = { ...current, ...patch }
  const props = { ...(data.root?.props ?? {}) }

  if (next.imageUrl.trim()) {
    props.canvasBackgroundUrl = next.imageUrl.trim()
  } else {
    delete props.canvasBackgroundUrl
  }

  if (next.colorToken.trim()) {
    props.canvasBackgroundColorToken = next.colorToken.trim()
  } else {
    delete props.canvasBackgroundColorToken
  }

  if (next.customColor.trim()) {
    props.canvasBackgroundCustomColor = next.customColor.trim()
  } else {
    delete props.canvasBackgroundCustomColor
  }

  props.canvasBackgroundFit = next.fit

  if (next.hidden) {
    props.canvasBackgroundHidden = true
  } else {
    delete props.canvasBackgroundHidden
  }

  if (
    !props.canvasBackgroundUrl &&
    !props.canvasBackgroundColorToken &&
    !props.canvasBackgroundCustomColor &&
    props.canvasBackgroundFit === DEFAULT_ARTICLE_CANVAS_BACKGROUND.fit
  ) {
    delete props.canvasBackgroundFit
  }

  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

export function clearCanvasBackground(data: Data): Data {
  const props = { ...(data.root?.props ?? {}) }
  delete props.canvasBackgroundUrl
  delete props.canvasBackgroundColorToken
  delete props.canvasBackgroundCustomColor
  delete props.canvasBackgroundFit
  delete props.canvasBackgroundHidden

  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  }
}

export function canvasBackgroundToStyle(bg: ArticleCanvasBackground): CSSProperties {
  if (bg.hidden) return {}

  const imageUrl = bg.imageUrl.trim()
  const resolvedColor = resolveCanvasBackgroundColor(bg)

  if (!imageUrl && !resolvedColor) {
    return {}
  }

  const style: CSSProperties = {
    backgroundColor: resolvedColor ?? 'var(--background)',
  }

  if (imageUrl) {
    style.backgroundImage = `url("${imageUrl}")`
    style.backgroundPosition = 'center'
    if (bg.fit === 'tile') {
      style.backgroundRepeat = 'repeat'
      style.backgroundSize = 'auto'
    } else {
      style.backgroundRepeat = 'no-repeat'
      style.backgroundSize = bg.fit
    }
  }

  return style
}
