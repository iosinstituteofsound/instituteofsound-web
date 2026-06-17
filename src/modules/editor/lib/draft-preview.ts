import type { Data } from '@measured/puck'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import { articleToPuckDocument } from '@/modules/editor/lib/article-puck-data'
import {
  readCanvasBackground,
  resolveCanvasBackgroundColor,
} from '@/modules/editor/lib/canvas-background-utils'
import { getBlockTextContent } from '@/modules/editor/lib/canvas-block-utils'
import {
  extractCoverUrl,
  extractGalleryUrls,
  extractTitleFromPuck,
} from '@/modules/editor/lib/puck-to-html'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { isTextCanvasBlock } from '@/modules/editor/types/article-canvas.types'

export interface DraftPreview {
  imageUrl?: string
  backgroundColor?: string
  previewText?: string
}

function getPuckData(draft: ArticleDto): Data | null {
  const raw = draft.puckData
  if (raw && typeof raw === 'object' && 'puck' in raw && raw.puck && typeof raw.puck === 'object') {
    const puck = raw.puck as Data
    if (Array.isArray(puck.content)) return puck
  }

  try {
    return articleToPuckDocument(draft).puck
  } catch {
    return null
  }
}

function extractVideoPoster(puck: Data): string | undefined {
  for (const block of puck.content) {
    if (block.type !== 'ArticleVideo') continue
    const posterUrl = block.props.posterUrl
    if (typeof posterUrl === 'string' && posterUrl.trim()) return posterUrl.trim()
  }
  return undefined
}

function trimPreviewText(value: string, max = 48): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed
}

function extractPreviewText(puck: Data, fallbackTitle?: string): string | undefined {
  const title = extractTitleFromPuck(puck) || fallbackTitle?.trim()
  if (title) return trimPreviewText(title)

  for (const block of puck.content) {
    const type = block.type as CanvasBlockType
    if (!isTextCanvasBlock(type)) continue
    const text = getBlockTextContent(block)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) return trimPreviewText(text)
  }

  return undefined
}

export function resolveDraftPreview(draft: ArticleDto): DraftPreview {
  const savedImage = draft.coverUrl ?? draft.galleryUrls?.[0]
  if (savedImage) {
    return {
      imageUrl: savedImage,
      previewText: draft.title?.trim() || undefined,
    }
  }

  const puck = getPuckData(draft)
  if (!puck) {
    const title = draft.title?.trim()
    return title ? { previewText: trimPreviewText(title) } : {}
  }

  const canvasBackground = readCanvasBackground(puck)
  const imageUrl =
    extractCoverUrl(puck) ??
    (canvasBackground.imageUrl.trim() || undefined) ??
    extractVideoPoster(puck) ??
    extractGalleryUrls(puck)[0]

  const backgroundColor = resolveCanvasBackgroundColor(canvasBackground)
  const previewText = extractPreviewText(puck, draft.title)

  if (imageUrl) return { imageUrl, previewText }
  if (backgroundColor) return { backgroundColor, previewText }
  if (previewText) return { previewText }
  return {}
}
