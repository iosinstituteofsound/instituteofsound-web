import type { Data } from '@measured/puck'
import { arrayMove } from '@dnd-kit/sortable'
import {
  ensureCanvasLayouts,
  findBlockIndex,
  parseBlockLayout,
} from '@/modules/editor/lib/canvas-block-utils'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'

function blockId(block: Data['content'][number]): string {
  return String((block.props as Record<string, unknown>).blockId)
}

/** Reorder puck.content and restack vertical layout positions (editorial % y). */
export function reorderPuckContent(data: Data, fromBlockId: string, toBlockId: string): Data {
  if (fromBlockId === toBlockId) return data

  const normalized = ensureCanvasLayouts(data)
  const ids = normalized.content.map(blockId)
  const fromIndex = ids.indexOf(fromBlockId)
  const toIndex = ids.indexOf(toBlockId)
  if (fromIndex < 0 || toIndex < 0) return data

  const content = arrayMove(normalized.content, fromIndex, toIndex)
  return applyEditorialStackLayouts({ ...normalized, content })
}

export function reorderPuckContentByIds(data: Data, orderedBlockIds: string[]): Data {
  const normalized = ensureCanvasLayouts(data)
  const byId = new Map(normalized.content.map((block) => [blockId(block), block]))
  const reordered: Data['content'] = []

  for (const id of orderedBlockIds) {
    const block = byId.get(id)
    if (block) reordered.push(block)
  }

  for (const block of normalized.content) {
    const id = blockId(block)
    if (!orderedBlockIds.includes(id)) reordered.push(block)
  }

  return applyEditorialStackLayouts({ ...normalized, content: reordered })
}

export function applyEditorialStackLayouts(data: Data): Data {
  let y = 6

  return {
    ...data,
    content: data.content.map((block, index) => {
      const type = block.type as CanvasBlockType
      const props = block.props as Record<string, unknown>
      const layout = parseBlockLayout(props.layout, type, index)
      const width =
        type === 'ArticleHero'
          ? 86
          : type === 'ArticleImage'
            ? 86
            : type === 'ArticleAudio' || type === 'ArticleVideo'
              ? 52
              : layout.width

      const nextLayout = {
        ...layout,
        x: type === 'ArticleImage' || type === 'ArticleHero' ? 8 : 10,
        y,
        width,
        zIndex: index,
      }

      if (type === 'ArticleHero') y += 22
      else if (type === 'ArticleImage') y += 18
      else if (type === 'ArticleAudio' || type === 'ArticleVideo') y += 12
      else y += 10

      return {
        ...block,
        props: {
          ...props,
          layout: nextLayout,
        },
      }
    }),
  }
}

export function movePuckContentBlock(data: Data, blockIdToMove: string, direction: 'up' | 'down'): Data {
  const index = findBlockIndex(ensureCanvasLayouts(data), blockIdToMove)
  if (index < 0) return data

  const target = direction === 'up' ? index - 1 : index + 1
  const ids = ensureCanvasLayouts(data).content.map(blockId)
  if (target < 0 || target >= ids.length) return data

  return reorderPuckContent(data, blockIdToMove, ids[target]!)
}
