import type { Data } from '@measured/puck'
import {
  readCanvasArtifact,
  updateCanvasArtifact,
} from '@/modules/editor/lib/canvas-artifact-utils'
import {
  getBlockTextContent,
  parseBlockLayout,
  updateCanvasBlockLayout,
} from '@/modules/editor/lib/canvas-block-utils'
import {
  readCanvasBackground,
  updateCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import { hasCustomCanvasBackground } from '@/modules/editor/types/article-canvas-background.types'
import {
  hasCanvasArtifact,
} from '@/modules/editor/types/article-canvas-artifact.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import {
  isAudioCanvasBlock,
  isImageCanvasBlock,
  isTextCanvasBlock,
  isVideoCanvasBlock,
} from '@/modules/editor/types/article-canvas.types'

export type CanvasLayerKind = 'background' | 'artifact' | 'block'

export type CanvasLayerThumbnail = 'background' | 'artifact' | 'text' | 'image' | 'audio' | 'video' | 'generic'

export interface CanvasLayerEntry {
  id: string
  kind: CanvasLayerKind
  blockId?: string
  label: string
  zIndex: number
  thumbnail: CanvasLayerThumbnail
  previewText?: string
  imageUrl?: string
  visible: boolean
  locked: boolean
}

const BLOCK_TYPE_LABELS: Partial<Record<CanvasBlockType, string>> = {
  ArticleTitle: 'Title',
  ArticleLead: 'Lead',
  ArticleBody: 'Text',
  ArticleSection: 'Section',
  ArticleQuote: 'Quote',
  ArticleImage: 'Image',
  ArticleHero: 'Hero',
  ArticleAudio: 'Audio',
  ArticleVideo: 'Video',
  ArticleDivider: 'Divider',
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getBlockLayerLabel(block: Data['content'][number]): string {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>
  const base = BLOCK_TYPE_LABELS[type] ?? type

  if (isTextCanvasBlock(type)) {
    const text = stripHtml(getBlockTextContent(block))
    if (text) return text.length > 18 ? `${text.slice(0, 18)}…` : text
  }

  if (isImageCanvasBlock(type)) {
    const alt = typeof props.alt === 'string' ? props.alt.trim() : ''
    return alt || base
  }

  if (isAudioCanvasBlock(type)) {
    const title = typeof props.title === 'string' ? props.title.trim() : ''
    return title || base
  }

  if (isVideoCanvasBlock(type)) {
    const title = typeof props.title === 'string' ? props.title.trim() : ''
    return title || base
  }

  return base
}

function getBlockThumbnail(block: Data['content'][number]): Pick<CanvasLayerEntry, 'thumbnail' | 'previewText' | 'imageUrl'> {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>

  if (isTextCanvasBlock(type)) {
    const text = stripHtml(getBlockTextContent(block))
    return {
      thumbnail: 'text',
      previewText: text ? text.charAt(0).toUpperCase() : 'T',
    }
  }

  if (isImageCanvasBlock(type)) {
    const imageUrl = typeof props.imageUrl === 'string' ? props.imageUrl.trim() : ''
    return { thumbnail: 'image', imageUrl: imageUrl || undefined }
  }

  if (isAudioCanvasBlock(type)) {
    return { thumbnail: 'audio' }
  }

  if (isVideoCanvasBlock(type)) {
    return { thumbnail: 'video' }
  }

  return { thumbnail: 'generic' }
}

export const ARTIFACT_LAYER_ID = '__artifact__'

export function buildCanvasBlockLayers(data: Data): CanvasLayerEntry[] {
  return data.content
    .map((block, index) => {
      const props = block.props as Record<string, unknown>
      const blockId = String(props.blockId ?? `fallback-${index}`)
      const type = block.type as CanvasBlockType
      const layout = parseBlockLayout(props.layout, type, index)

      return {
        id: blockId,
        kind: 'block' as const,
        blockId,
        label: getBlockLayerLabel(block),
        zIndex: layout.zIndex ?? index,
        visible: !layout.hidden,
        locked: false,
        ...getBlockThumbnail(block),
      }
    })
    .sort((a, b) => b.zIndex - a.zIndex)
}

export function buildCanvasStackLayers(data: Data): CanvasLayerEntry[] {
  const layers = buildCanvasBlockLayers(data)
  const artifact = readCanvasArtifact(data)

  if (hasCanvasArtifact(artifact)) {
    layers.push({
      id: ARTIFACT_LAYER_ID,
      kind: 'artifact',
      label: 'BG Artifact',
      zIndex: artifact.zIndex ?? 0,
      thumbnail: 'artifact',
      visible: !artifact.hidden,
      locked: false,
    })
  }

  return layers.sort((a, b) => b.zIndex - a.zIndex)
}

export function resolveInitialArtifactZIndex(data: Data): number {
  if (!data.content.length) return 0

  const zIndexes = data.content.map((block, index) => {
    const props = block.props as Record<string, unknown>
    const type = block.type as CanvasBlockType
    return parseBlockLayout(props.layout, type, index).zIndex ?? index
  })

  // Never negative — values below 0 render behind the canvas background and disappear.
  return Math.max(0, Math.min(...zIndexes) - 1)
}

export function buildCanvasBackgroundLayer(data: Data): CanvasLayerEntry {
  const background = readCanvasBackground(data)

  return {
    id: '__background__',
    kind: 'background',
    label: hasCustomCanvasBackground(background) ? 'Background' : 'Theme background',
    zIndex: 0,
    thumbnail: 'background',
    visible: !background.hidden,
    locked: true,
  }
}

/** @deprecated use buildCanvasBackgroundLayer */
export function buildCanvasFixedLayers(data: Data): CanvasLayerEntry[] {
  return [buildCanvasBackgroundLayer(data)]
}

export function reorderCanvasStackLayers(data: Data, orderedLayerIds: string[]): Data {
  if (!orderedLayerIds.length) return data

  const maxZ = orderedLayerIds.length - 1
  let next = data

  orderedLayerIds.forEach((layerId, listIndex) => {
    const zIndex = maxZ - listIndex

    if (layerId === ARTIFACT_LAYER_ID) {
      next = updateCanvasArtifact(next, { zIndex })
      return
    }

    next = {
      ...next,
      content: next.content.map((block, index) => {
        const props = block.props as Record<string, unknown>
        const blockId = String(props.blockId ?? `fallback-${index}`)
        if (blockId !== layerId) return block

        const type = block.type as CanvasBlockType
        const layout = parseBlockLayout(props.layout, type, index)

        return {
          ...block,
          props: {
            ...props,
            layout: {
              ...layout,
              zIndex,
            },
          },
        }
      }),
    }
  })

  return next
}

export function reorderCanvasBlockLayers(data: Data, orderedBlockIds: string[]): Data {
  return reorderCanvasStackLayers(data, orderedBlockIds)
}

export function toggleCanvasBlockVisibility(data: Data, blockId: string): Data {
  const block = data.content.find((item) => String((item.props as Record<string, unknown>).blockId) === blockId)
  if (!block) return data

  const type = block.type as CanvasBlockType
  const layout = parseBlockLayout((block.props as Record<string, unknown>).layout, type, 0)
  return updateCanvasBlockLayout(data, blockId, { hidden: !layout.hidden })
}

export function toggleCanvasArtifactVisibility(data: Data): Data {
  const artifact = readCanvasArtifact(data)
  if (!hasCanvasArtifact(artifact)) return data
  return updateCanvasArtifact(data, { hidden: !artifact.hidden })
}

export function toggleCanvasBackgroundVisibility(data: Data): Data {
  const background = readCanvasBackground(data)
  return updateCanvasBackground(data, { hidden: !background.hidden })
}

export function moveCanvasStackLayer(
  data: Data,
  layerId: string,
  direction: 'up' | 'down',
): Data {
  const layers = buildCanvasStackLayers(data)
  const ids = layers.map((layer) => layer.id)
  const index = ids.indexOf(layerId)
  if (index < 0) return data

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= ids.length) return data

  const nextIds = [...ids]
  ;[nextIds[index], nextIds[targetIndex]] = [nextIds[targetIndex]!, nextIds[index]!]
  return reorderCanvasStackLayers(data, nextIds)
}

export function moveCanvasBlockLayer(
  data: Data,
  blockId: string,
  direction: 'up' | 'down',
): Data {
  return moveCanvasStackLayer(data, blockId, direction)
}
