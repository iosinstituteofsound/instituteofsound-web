import { getIllustratorArtwork, saveIllustratorArtwork } from '@/modules/illustrator/api/illustrator.api'
import {
  deserializeCanvasElement,
  restoreLayersFromPersisted,
  type PersistedStudioDocument,
} from '@/modules/illustrator/lib/studio-document-persistence'
import { createStudioPreviewDataUrl } from '@/modules/illustrator/lib/studio-preview'
import { compressStudioStateJson } from '@/modules/illustrator/lib/studio-state-compression'

export async function backfillStudioPreviewFromServer(artworkId: string): Promise<boolean> {
  const detail = await getIllustratorArtwork(artworkId)
  const studioState = detail.studioState
  if (!studioState || typeof studioState !== 'object') return false

  const doc = studioState as PersistedStudioDocument
  const layers = restoreLayersFromPersisted(doc.layers)
  const elements = doc.elements.map(deserializeCanvasElement)
  const previewDataUrl = createStudioPreviewDataUrl(layers, doc.activeLayerId, elements)
  if (!previewDataUrl) return false

  const payload: PersistedStudioDocument = {
    ...doc,
    artworkId: detail.id,
    title: detail.title,
    status: detail.status,
  }

  await saveIllustratorArtwork(detail.id, {
    title: payload.title,
    status: payload.status,
    document: payload.document,
    stateGzipBase64: await compressStudioStateJson(JSON.stringify(payload)),
    previewDataUrl,
  })

  return true
}
