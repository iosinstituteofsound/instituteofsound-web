import { serializePuckDocument } from '@/modules/editor/lib/article-puck-data'
import {
  extractCoverUrl,
  extractGalleryUrls,
  extractTitleFromPuck,
  puckToBodyHtml,
} from '@/modules/editor/lib/puck-to-html'
import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'

export function buildArticleSavePayload(doc: ArticlePuckDocument, excerpt = '') {
  const puck = doc.puck
  const title = extractTitleFromPuck(puck)

  return {
    title: title || 'Untitled draft',
    excerpt: excerpt || undefined,
    bodyHtml: puckToBodyHtml(puck),
    coverUrl: extractCoverUrl(puck),
    galleryUrls: extractGalleryUrls(puck),
    type: doc.meta.type,
    isCoverStory: doc.meta.isCoverStory,
    puckData: serializePuckDocument(doc),
  }
}
