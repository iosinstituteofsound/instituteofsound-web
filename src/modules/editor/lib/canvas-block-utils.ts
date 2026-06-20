import type { Data } from '@measured/puck'
import {
  DEFAULT_BLOCK_WIDTHS,
  DEFAULT_CANVAS_BLOCK_EFFECTS,
  DEFAULT_CANVAS_BLOCK_STYLE,
  type CanvasBlockEffects,
  type CanvasBlockLayout,
  type CanvasBlockStyle,
  type CanvasBlockType,
} from '@/modules/editor/types/article-canvas.types'
import { TEXT_CANVAS_BLOCK_TYPES } from '@/modules/editor/types/article-canvas.types'
import {
  buildQuoteBodyHtml,
  isQuoteBodyHtml,
  parseQuoteFromBodyHtml,
  stripBodyHtmlToPlain,
  type BodyQuoteContent,
} from '@/modules/editor/lib/quote-body-utils'
import { withPuckId } from '@/modules/editor/lib/puck-block-id'

export function createBlockId(): string {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function defaultLayoutForType(type: CanvasBlockType, index: number): CanvasBlockLayout {
  const isText = TEXT_CANVAS_BLOCK_TYPES.includes(type)
  return {
    x: 14 + (index % 3) * 4,
    y: 8 + index * 14,
    width: DEFAULT_BLOCK_WIDTHS[type] ?? 56,
    sizing: isText ? 'hug' : 'fixed',
  }
}

export function defaultStyleForType(type: CanvasBlockType): CanvasBlockStyle {
  const base = { ...DEFAULT_CANVAS_BLOCK_STYLE }
  if (type === 'ArticleTitle') {
    return { ...base, fontSize: 42, fontWeight: 'bold', fontFamilyId: 'editorial-serif' }
  }
  if (type === 'ArticleLead') {
    return { ...base, fontSize: 22, colorToken: 'muted-foreground', fontFamilyId: 'editorial-serif' }
  }
  if (type === 'ArticleImage' || type === 'ArticleHero') {
    return {
      ...base,
      preserveAspectRatio: true,
      antiAlias: true,
      scale: 100,
      imageShape: 'rectangle',
      roundness: 20,
    }
  }
  if (type === 'ArticleAudio' || type === 'ArticleVideo') {
    return { ...base, preserveAspectRatio: true }
  }
  return { ...base, fontFamilyId: 'editorial-serif' }
}

export function parseBlockStyle(raw: unknown): CanvasBlockStyle {
  const style = (raw && typeof raw === 'object' ? raw : {}) as Partial<CanvasBlockStyle>
  const effects = {
    ...DEFAULT_CANVAS_BLOCK_EFFECTS,
    ...(style.effects && typeof style.effects === 'object' ? style.effects : {}),
  }
  return { ...DEFAULT_CANVAS_BLOCK_STYLE, ...style, effects }
}

function readLayoutNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function parseBlockLayout(raw: unknown, type: CanvasBlockType, index: number): CanvasBlockLayout {
  const layout = (raw && typeof raw === 'object' ? raw : {}) as Partial<CanvasBlockLayout>
  const defaults = defaultLayoutForType(type, index)
  return {
    x: readLayoutNumber(layout.x, defaults.x),
    y: readLayoutNumber(layout.y, defaults.y),
    width: readLayoutNumber(layout.width, defaults.width),
    zIndex: readLayoutNumber(layout.zIndex, index),
    sizing:
      layout.sizing === 'fixed' || layout.sizing === 'hug'
        ? layout.sizing
        : defaults.sizing ?? 'fixed',
    placement: layout.placement === 'free' ? 'free' : 'flow',
    hidden: layout.hidden === true,
  }
}

export function isFreeCanvasBlock(block: Data['content'][number], index = 0): boolean {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>
  return parseBlockLayout(props.layout, type, index).placement === 'free'
}

export function getFreeCanvasBlocks(
  data: Data,
): Array<{ block: Data['content'][number]; blockId: string; index: number }> {
  const normalized = ensureCanvasLayouts(data)
  return normalized.content
    .map((block, index) => ({
      block,
      blockId: String((block.props as Record<string, unknown>).blockId),
      index,
    }))
    .filter(({ block, index }) => isFreeCanvasBlock(block, index))
}

export function addFreeCanvasBlockWithId(
  data: Data,
  type: CanvasBlockType,
  position?: Partial<CanvasBlockLayout>,
): { data: Data; blockId: string } {
  return addCanvasBlockWithId(data, type, { ...position, placement: 'free' })
}

export function isCanvasBlockHidden(block: Data['content'][number], index = 0): boolean {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>
  return parseBlockLayout(props.layout, type, index).hidden === true
}

export function isCanvasBlockHiddenById(data: Data, blockId: string | undefined): boolean {
  if (!blockId) return false

  const index = data.content.findIndex(
    (block) => String((block.props as Record<string, unknown>).blockId) === blockId,
  )
  if (index < 0) return false

  return isCanvasBlockHidden(data.content[index]!, index)
}

export function createCanvasBlock(
  type: CanvasBlockType,
  position?: Partial<CanvasBlockLayout>,
): Data['content'][number] {
  const baseProps = (() => {
    switch (type) {
      case 'ArticleTitle':
        return { text: 'Text' }
      case 'ArticleLead':
      case 'ArticleBody':
        return { body: '<p>Text</p>' }
      case 'ArticleHero':
      case 'ArticleImage':
        return { imageUrl: '', caption: '' }
      case 'ArticleAudio':
        return {
          audioUrl: '',
          trackTitle: 'Session',
          sessionLabel: 'Listen to the session',
          durationSec: 0,
          sessionTracks: [],
        }
      case 'ArticleVideo':
        return {
          videoUrl: '',
          videoTitle: 'Session video',
          caption: 'Watch the session',
          posterUrl: '',
        }
      case 'ArticleSection':
        return { heading: 'Section', body: '<p></p>' }
      case 'ArticleDivider':
        return {}
      default:
        return { body: '<p></p>' }
    }
  })()

  const layout = {
    ...defaultLayoutForType(type, 0),
    ...position,
  }

  return {
    type,
    props: withPuckId({
      ...baseProps,
      blockId: createBlockId(),
      layout,
      style: defaultStyleForType(type),
    }),
  }
}

function isLegacyQuoteRemnant(block: Data['content'][number]): boolean {
  if (block.type === 'ArticleQuote') return true
  if (block.type !== 'ArticleTitle') return false

  const props = block.props as Record<string, unknown>
  const text = String(props.text ?? '').trim()
  if (text.toLowerCase() === 'quote') return true

  const blockStyle = parseBlockStyle(props.style)
  const quoteLikeStyle =
    blockStyle.fontStyle === 'italic' ||
    blockStyle.colorToken === 'primary' ||
    blockStyle.fontSize === 24

  return text === 'Text' && quoteLikeStyle
}

function resolveBlockId(type: CanvasBlockType, index: number, props: Record<string, unknown>): string {
  const existing = props.blockId
  if (typeof existing === 'string' && existing.trim()) return existing.trim()
  return `legacy-${index}-${type}`
}

export function getCanvasBlockIds(data: Data): string[] {
  return ensureCanvasLayouts(data).content.map((block) =>
    String((block.props as Record<string, unknown>).blockId),
  )
}

export function sanitizeSelectedBlockIds(data: Data, selectedBlockIds: string[]): string[] {
  const valid = new Set(getCanvasBlockIds(data))
  return selectedBlockIds.filter((id) => valid.has(id))
}

export function puckNeedsLayoutSync(data: Data): boolean {
  const needsBlockMeta = data.content.some((block, index) => {
    const props = block.props as Record<string, unknown>
    const id = props.blockId
    if (typeof id !== 'string' || !id.trim()) return true
    if (!props.layout || typeof props.layout !== 'object') return true
    if (!props.style || typeof props.style !== 'object') return true
    const type = block.type as CanvasBlockType
    const layout = props.layout as Partial<CanvasBlockLayout>
    const defaults = defaultLayoutForType(type, index)
    if (layout.x === undefined && layout.y === undefined) return true
    if (
      layout.x !== undefined &&
      typeof layout.x !== 'number' &&
      (typeof layout.x !== 'string' || Number.isNaN(Number(layout.x)))
    ) {
      return true
    }
    if (
      layout.y !== undefined &&
      typeof layout.y !== 'number' &&
      (typeof layout.y !== 'string' || Number.isNaN(Number(layout.y)))
    ) {
      return true
    }
    void defaults
    return false
  })
  if (needsBlockMeta) return true

  const ensured = ensureCanvasLayouts(data)
  if (data.content.length !== ensured.content.length) return true

  return data.content.some((block, index) => {
    const rawId = (block.props as Record<string, unknown>).blockId
    const ensuredId = (ensured.content[index]?.props as Record<string, unknown> | undefined)?.blockId
    return rawId !== ensuredId
  })
}

export function ensureCanvasLayouts(data: Data): Data {
  return {
    ...data,
    content: data.content
      .filter((block) => !isLegacyQuoteRemnant(block))
      .map((block, index) => {
      const type = block.type as CanvasBlockType
      const props = block.props as Record<string, unknown>
      return {
        ...block,
        props: withPuckId({
          ...props,
          blockId: resolveBlockId(type, index, props),
          layout: parseBlockLayout(props.layout, type, index),
          style: parseBlockStyle(props.style ?? defaultStyleForType(type)),
        }),
      }
    }),
  }
}

export function updateCanvasBlock(
  data: Data,
  blockId: string,
  patch: Record<string, unknown>,
): Data {
  return {
    ...data,
    content: data.content.map((block) => {
      const props = block.props as Record<string, unknown>
      if (String(props.blockId) !== blockId) return block
      return { ...block, props: withPuckId({ ...props, ...patch }) }
    }),
  }
}

export function updateCanvasBlockLayout(
  data: Data,
  blockId: string,
  layout: Partial<CanvasBlockLayout>,
): Data {
  return {
    ...data,
    content: data.content.map((block) => {
      const props = block.props as Record<string, unknown>
      if (String(props.blockId) !== blockId) return block
      const current = parseBlockLayout(props.layout, block.type as CanvasBlockType, 0)
      return {
        ...block,
        props: withPuckId({
          ...props,
          layout: { ...current, ...layout },
        }),
      }
    }),
  }
}

export function updateCanvasBlockStyle(
  data: Data,
  blockId: string,
  style: Partial<CanvasBlockStyle>,
): Data {
  return {
    ...data,
    content: data.content.map((block) => {
      const props = block.props as Record<string, unknown>
      if (String(props.blockId) !== blockId) return block
      const current = parseBlockStyle(props.style)
      return {
        ...block,
        props: withPuckId({
          ...props,
          style: { ...current, ...style },
        }),
      }
    }),
  }
}

export function removeCanvasBlock(data: Data, blockId: string): Data {
  return {
    ...data,
    content: data.content.filter((block) => (block.props as Record<string, unknown>).blockId !== blockId),
  }
}

export function removeCanvasBlocks(data: Data, blockIds: string[]): Data {
  const idSet = new Set(blockIds)
  return {
    ...data,
    content: data.content.filter((block) => !idSet.has(String((block.props as Record<string, unknown>).blockId))),
  }
}

export function updateCanvasBlocksStyle(
  data: Data,
  blockIds: string[],
  style: Partial<CanvasBlockStyle>,
): Data {
  const idSet = new Set(blockIds)
  return {
    ...data,
    content: data.content.map((block) => {
      const props = block.props as Record<string, unknown>
      if (!idSet.has(String(props.blockId))) return block
      const current = parseBlockStyle(props.style)
      return {
        ...block,
        props: withPuckId({
          ...props,
          style: { ...current, ...style },
        }),
      }
    }),
  }
}

export function moveCanvasBlocks(
  data: Data,
  blockIds: string[],
  delta: { x: number; y: number },
): Data {
  const idSet = new Set(blockIds)
  return {
    ...data,
    content: data.content.map((block) => {
      const props = block.props as Record<string, unknown>
      const blockId = String(props.blockId)
      if (!idSet.has(blockId)) return block
      const layout = parseBlockLayout(props.layout, block.type as CanvasBlockType, 0)
      return {
        ...block,
        props: withPuckId({
          ...props,
          layout: {
            ...layout,
            x: Math.min(92, Math.max(2, layout.x + delta.x)),
            y: Math.min(96, Math.max(2, layout.y + delta.y)),
          },
        }),
      }
    }),
  }
}

export function toggleBlocksEffect(
  data: Data,
  blockIds: string[],
  effect: keyof CanvasBlockEffects,
): Data {
  return blockIds.reduce((acc, blockId) => toggleBlockEffect(acc, blockId, effect), data)
}

export function addCanvasBlock(
  data: Data,
  type: CanvasBlockType,
  position?: Partial<CanvasBlockLayout>,
): Data {
  return {
    ...data,
    content: [...data.content, createCanvasBlock(type, position)],
  }
}

export function addCanvasBlockWithId(
  data: Data,
  type: CanvasBlockType,
  position?: Partial<CanvasBlockLayout>,
): { data: Data; blockId: string } {
  const block = createCanvasBlock(type, position)
  const blockId = String((block.props as Record<string, unknown>).blockId)
  return {
    data: { ...data, content: [...data.content, block] },
    blockId,
  }
}

export const CANVAS_BLOCK_DROP_POSITION = { x: 18, y: 22 }

export const IOS_BLOCK_TYPE_MIME = 'application/x-ios-block-type'
export const IOS_BLOCK_PAYLOAD_MIME = 'application/x-ios-block-payload'

export interface VideoBlockDragPayload {
  videoUrl: string
  videoTitle: string
  caption: string
  posterUrl?: string
}

export interface AudioBlockDragPayload {
  audioUrl: string
  trackTitle: string
  sessionLabel: string
  durationSec?: number
  sessionTracks?: Array<{
    id: string
    title: string
    artistName: string
    durationSec: number
    streamUrl: string
  }>
}

export function fileBaseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Session'
}

export function findBlockIndex(data: Data, blockId: string): number {
  return data.content.findIndex((block) => (block.props as Record<string, unknown>).blockId === blockId)
}

export function getBlockBodyQuote(block: Data['content'][number]): BodyQuoteContent | null {
  if (block.type !== 'ArticleBody' && block.type !== 'ArticleLead') return null
  const body = String((block.props as Record<string, unknown>).body ?? '')
  if (!isQuoteBodyHtml(body)) return null
  return parseQuoteFromBodyHtml(body).quote ?? { text: '', attribution: undefined }
}

export function getBlockSectionBody(block: Data['content'][number]): string {
  if (block.type !== 'ArticleSection') return ''
  const body = String((block.props as Record<string, unknown>).body ?? '')
  return stripBodyHtmlToPlain(body)
}

export function setBlockSectionBody(data: Data, blockId: string, text: string): Data {
  const block = data.content.find(
    (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
  )
  if (!block || block.type !== 'ArticleSection') return data
  return patchBlockProps(data, blockId, { body: plainTextToBodyHtml(text) })
}

export function getBlockTextContent(block: Data['content'][number]): string {
  const props = block.props as Record<string, unknown>
  switch (block.type) {
    case 'ArticleTitle':
      return String(props.text ?? '')
    case 'ArticleSection':
      return String(props.heading ?? '')
    case 'ArticleLead':
    case 'ArticleBody': {
      const body = String(props.body ?? '')
      const quote = parseQuoteFromBodyHtml(body).quote
      if (quote) return quote.text
      return stripBodyHtmlToPlain(body)
    }
    default:
      return ''
  }
}

export function getBlockQuoteAttribution(block: Data['content'][number]): string {
  return getBlockBodyQuote(block)?.attribution ?? ''
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function plainTextToBodyHtml(text: string): string {
  if (!text) return '<p></p>'
  const lines = text.split('\n')
  return lines.map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('')
}

export function setBlockQuoteContent(
  data: Data,
  blockId: string,
  text: string,
  attribution?: string,
): Data {
  const block = data.content.find(
    (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
  )
  if (!block || (block.type !== 'ArticleBody' && block.type !== 'ArticleLead')) return data

  return patchBlockProps(data, blockId, {
    body: buildQuoteBodyHtml(text, attribution),
  })
}

function patchBlockProps(
  data: Data,
  blockId: string,
  patch: Record<string, unknown>,
): Data {
  return {
    ...data,
    content: data.content.map((item) => {
      const itemProps = item.props as Record<string, unknown>
      if (String(itemProps.blockId) !== blockId) return item
      return {
        ...item,
        props: withPuckId({
          ...itemProps,
          ...patch,
          layout: itemProps.layout,
          style: itemProps.style,
        }),
      }
    }),
  }
}

export function setBlockTextContent(
  data: Data,
  blockId: string,
  text: string,
): Data {
  const block = data.content.find(
    (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
  )
  if (!block) return data

  const props = block.props as Record<string, unknown>

  const patch: Record<string, unknown> = (() => {
    switch (block.type) {
      case 'ArticleTitle':
        return { text }
      case 'ArticleSection':
        return { heading: text }
      case 'ArticleLead':
      case 'ArticleBody': {
        const body = String(props.body ?? '')
        if (isQuoteBodyHtml(body)) {
          const quote = parseQuoteFromBodyHtml(body).quote
          return { body: buildQuoteBodyHtml(text, quote?.attribution) }
        }
        return { body: plainTextToBodyHtml(text) }
      }
      default:
        return {}
    }
  })()

  if (!Object.keys(patch).length) return data
  return patchBlockProps(data, blockId, patch)
}

export function duplicateCanvasBlock(data: Data, blockId: string): Data {
  const index = findBlockIndex(data, blockId)
  if (index < 0) return data
  const block = data.content[index]!
  const props = block.props as Record<string, unknown>
  const layout = parseBlockLayout(props.layout, block.type as CanvasBlockType, index)
  const duplicate = {
    ...block,
    props: withPuckId({
      ...props,
      blockId: createBlockId(),
      layout: {
        ...layout,
        x: Math.min(88, layout.x + 4),
        y: Math.min(90, layout.y + 4),
        zIndex: data.content.length,
      },
    }),
  }
  return { ...data, content: [...data.content, duplicate] }
}

export function reorderBlock(
  data: Data,
  blockId: string,
  direction: 'front' | 'back',
): Data {
  const stack = data.content.map((block, index) => {
    const props = block.props as Record<string, unknown>
    const type = block.type as CanvasBlockType
    const layout = parseBlockLayout(props.layout, type, index)
    return {
      blockId: String(props.blockId),
      zIndex: layout.zIndex ?? index,
      order: index,
    }
  })

  const sorted = [...stack].sort((a, b) => a.zIndex - b.zIndex || a.order - b.order)
  const position = sorted.findIndex((entry) => entry.blockId === blockId)
  if (position < 0) return data

  const neighborPosition = direction === 'front' ? position + 1 : position - 1
  if (neighborPosition < 0 || neighborPosition >= sorted.length) return data

  const current = sorted[position]!
  const neighbor = sorted[neighborPosition]!

  return {
    ...data,
    content: data.content.map((block, index) => {
      const props = block.props as Record<string, unknown>
      const id = String(props.blockId)
      if (id !== current.blockId && id !== neighbor.blockId) return block

      const type = block.type as CanvasBlockType
      const layout = parseBlockLayout(props.layout, type, index)
      const nextZIndex = id === current.blockId ? neighbor.zIndex : current.zIndex

      return {
        ...block,
        props: withPuckId({
          ...props,
          layout: {
            ...layout,
            zIndex: nextZIndex,
          },
        }),
      }
    }),
  }
}

export function toggleTextDecoration(
  current: CanvasBlockStyle['textDecoration'],
  part: 'underline' | 'line-through',
): CanvasBlockStyle['textDecoration'] {
  const parts = new Set<'underline' | 'line-through'>()
  if (current.includes('underline')) parts.add('underline')
  if (current.includes('line-through')) parts.add('line-through')

  if (parts.has(part)) parts.delete(part)
  else parts.add(part)

  if (parts.size === 0) return 'none'
  if (parts.size === 2) return 'underline line-through'
  return parts.values().next().value!
}

export function rotateBlockAngle(
  data: Data,
  blockId: string,
  delta: number,
): Data {
  const block = data.content.find((item) => (item.props as Record<string, unknown>).blockId === blockId)
  if (!block) return data
  const style = parseBlockStyle((block.props as Record<string, unknown>).style)
  const angle = ((style.angle + delta) % 360 + 360) % 360
  return updateCanvasBlockStyle(data, blockId, { angle })
}

export function toggleBlockEffect(
  data: Data,
  blockId: string,
  effect: keyof CanvasBlockEffects,
): Data {
  const block = data.content.find((item) => (item.props as Record<string, unknown>).blockId === blockId)
  if (!block) return data
  const style = parseBlockStyle((block.props as Record<string, unknown>).style)
  return updateCanvasBlockStyle(data, blockId, {
    effects: { ...style.effects, [effect]: !style.effects[effect] },
  })
}

export const CANVAS_PALETTE_BLOCKS: Array<{ type: CanvasBlockType; label: string; description: string }> = [
  { type: 'ArticleTitle', label: 'Title', description: 'Headline text block' },
  { type: 'ArticleBody', label: 'Paragraph', description: 'Body text block' },
  { type: 'ArticleLead', label: 'Lead', description: 'Opening paragraph' },
  { type: 'ArticleSection', label: 'Section', description: 'Heading + body' },
  { type: 'ArticleDivider', label: 'Divider', description: 'Horizontal rule' },
]

export const CANVAS_IMAGE_PALETTE_BLOCKS: Array<{ type: CanvasBlockType; label: string; description: string }> = [
  { type: 'ArticleImage', label: 'Image', description: 'Image block' },
  { type: 'ArticleHero', label: 'Hero image', description: 'Wide hero image' },
]
