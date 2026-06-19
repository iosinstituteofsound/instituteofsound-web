import type { Data } from '@measured/puck'
import {
  createBlockId,
  defaultLayoutForType,
  defaultStyleForType,
  ensureCanvasLayouts,
  parseBlockStyle,
} from '@/modules/editor/lib/canvas-block-utils'
import {
  createEmptyPuckData,
  parseArticleEditorMeta,
} from '@/modules/editor/lib/article-puck-data'
import { ARTICLE_PUCK_VERSION } from '@/modules/editor/types/article-editor.types'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import type { CanvasBlockLayout, CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { TEXT_CANVAS_BLOCK_TYPES } from '@/modules/editor/types/article-canvas.types'

type LayoutPreset = Pick<CanvasBlockLayout, 'x' | 'y' | 'width' | 'sizing'>

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hasExplicitLayout(props: Record<string, unknown>): boolean {
  const layout = props.layout
  if (!layout || typeof layout !== 'object') return false
  const candidate = layout as Partial<CanvasBlockLayout>
  return typeof candidate.x === 'number' && typeof candidate.y === 'number' && typeof candidate.width === 'number'
}

/** Stack blocks top-to-bottom so hero, images, and audio appear without scrolling far. */
function editorialStackLayouts(blocks: Data['content']): LayoutPreset[] {
  let y = 6

  return blocks.map((block) => {
    const type = block.type as CanvasBlockType
    const isText = TEXT_CANVAS_BLOCK_TYPES.includes(type)
    const width = defaultLayoutForType(type, 0).width
    const layout: LayoutPreset = {
      x: type === 'ArticleImage' || type === 'ArticleHero' ? 8 : 10,
      y,
      width,
      sizing: isText ? 'hug' : 'fixed',
    }

    if (type === 'ArticleHero') y += 22
    else if (type === 'ArticleImage') y += 18
    else if (type === 'ArticleAudio' || type === 'ArticleVideo') y += 12
    else y += 10

    return layout
  })
}

function applyCanvasLayoutsToPuck(puck: Data): Data {
  const presets = editorialStackLayouts(puck.content)

  return {
    ...puck,
    content: puck.content.map((block, index) => {
      const type = block.type as CanvasBlockType
      const props = cloneValue(block.props as Record<string, unknown>)
      const preset = presets[index] ?? defaultLayoutForType(type, index)

      const layout: CanvasBlockLayout = hasExplicitLayout(props)
        ? {
            ...(props.layout as CanvasBlockLayout),
            placement: 'flow',
            zIndex: index,
          }
        : {
            ...defaultLayoutForType(type, index),
            ...preset,
            placement: 'flow',
            zIndex: index,
          }

      return {
        ...block,
        props: {
          ...props,
          blockId: createBlockId(),
          layout,
          style: parseBlockStyle(props.style ?? defaultStyleForType(type)),
        },
      }
    }),
  }
}

function resolvePuck(raw: Record<string, unknown>): Data | null {
  const puck = raw.puck
  if (!puck || typeof puck !== 'object') return null
  const candidate = puck as Data
  if (!Array.isArray(candidate.content)) return null
  return candidate
}

export function prepareTemplateForWorkspace(
  raw: Record<string, unknown>,
  _templateId?: string,
): ArticlePuckDocument {
  const puck = resolvePuck(raw)
  if (!puck) return createEmptyPuckData()

  const rawMeta = (raw.meta ?? {}) as Record<string, unknown>
  const meta = parseArticleEditorMeta(rawMeta)

  if (!meta.sessionAudioUrl && typeof raw.sessionAudioUrl === 'string') {
    meta.sessionAudioUrl = raw.sessionAudioUrl.trim()
  }
  if (typeof rawMeta.seoDescription === 'string' && rawMeta.seoDescription.trim()) {
    meta.seoDescription = rawMeta.seoDescription.trim()
  }

  for (const block of puck.content) {
    if (block.type !== 'ArticleAudio') continue
    const props = block.props as Record<string, unknown>
    if (!meta.sessionAudioUrl && typeof props.audioUrl === 'string' && props.audioUrl.trim()) {
      meta.sessionAudioUrl = props.audioUrl.trim()
    }
    if (typeof props.sessionLabel === 'string' && props.sessionLabel.trim()) {
      meta.sessionLabel = props.sessionLabel.trim()
    }
  }

  return {
    version: typeof raw.version === 'number' ? raw.version : ARTICLE_PUCK_VERSION,
    puck: ensureCanvasLayouts(applyCanvasLayoutsToPuck(puck)),
    meta,
  }
}
