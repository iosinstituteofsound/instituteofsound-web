import type { Data } from '@measured/puck'
import type { ArticlePuckComponents } from '@/modules/editor/lib/article-puck-config'

type BlockType = keyof ArticlePuckComponents

export function createBlock(type: BlockType): Data['content'][number] {
  switch (type) {
    case 'ArticleTitle':
      return { type, props: { text: '' } }
    case 'ArticleLead':
    case 'ArticleBody':
      return { type, props: { body: '<p></p>' } }
    case 'ArticleHero':
    case 'ArticleImage':
      return { type, props: { imageUrl: '', caption: '' } }
    case 'ArticleSection':
      return { type, props: { heading: '', body: '<p></p>' } }
    case 'ArticleDivider':
      return { type, props: {} }
    default:
      return { type: 'ArticleBody', props: { body: '<p></p>' } }
  }
}

export function updateBlockProps(
  data: Data,
  index: number,
  patch: Record<string, unknown>,
): Data {
  return {
    ...data,
    content: data.content.map((block, i) =>
      i === index ? { ...block, props: { ...block.props, ...patch } } : block,
    ),
  }
}

export function removeBlockAt(data: Data, index: number): Data {
  const block = data.content[index]
  if (!block || block.type === 'ArticleTitle') return data
  return {
    ...data,
    content: data.content.filter((_, i) => i !== index),
  }
}

export function insertBlockAt(data: Data, index: number, type: BlockType): Data {
  const next = [...data.content]
  next.splice(index, 0, createBlock(type))
  return { ...data, content: next }
}

export function appendBlock(data: Data, type: BlockType): Data {
  return insertBlockAt(data, data.content.length, type)
}
