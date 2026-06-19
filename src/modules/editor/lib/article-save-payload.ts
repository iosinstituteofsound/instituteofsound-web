import { serializePuckDocument } from '@/modules/editor/lib/article-puck-data'
import { normalizeMediaUrl, normalizeMediaUrls } from '@/modules/editor/lib/normalize-media-url'
import {
  extractCoverUrl,
  extractGalleryUrls,
  extractTitleFromPuck,
  puckToBodyHtml,
} from '@/modules/editor/lib/puck-to-html'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'

export function buildArticleSavePayload(
  doc: ArticlePuckDocument,
  excerpt = '',
  slug = '',
) {
  const puck = doc.puck
  const title = extractTitleFromPuck(puck)
  const normalizedSlug = slug.trim()

  return {
    title: title || 'Untitled draft',
    excerpt: excerpt || undefined,
    slug: normalizedSlug || undefined,
    bodyHtml: puckToBodyHtml(puck),
    coverUrl: normalizeMediaUrl(extractCoverUrl(puck)),
    galleryUrls: normalizeMediaUrls(extractGalleryUrls(puck)),
    type: doc.meta.type,
    isCoverStory: doc.meta.isCoverStory,
    puckData: serializePuckDocument(doc),
  }
}
