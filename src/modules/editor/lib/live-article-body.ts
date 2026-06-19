import type { Data } from '@measured/puck'
import { isFreeCanvasBlock } from '@/modules/editor/lib/canvas-block-utils'
import type { PuckLiveBlockIds, PuckLivePreviewModel } from '@/modules/editor/lib/puck-live-preview'

export { parseQuoteFromBodyHtml } from '@/modules/editor/lib/quote-body-utils'

export interface LiveBodyBlock {
  block: Data['content'][number]
  blockId: string
}

function readBlockId(block: Data['content'][number]): string {
  return String((block.props as Record<string, unknown>).blockId)
}

export function getHeroBlockIdSet(blockIds: PuckLiveBlockIds): Set<string> {
  const ids = new Set<string>()
  if (blockIds.title) ids.add(blockIds.title)
  if (blockIds.hero) ids.add(blockIds.hero)
  if (blockIds.heroAudio) ids.add(blockIds.heroAudio)
  return ids
}

export function getLiveBodyBlocks(puck: Data, heroIds: Set<string>): LiveBodyBlock[] {
  return puck.content
    .filter((block, index) => !heroIds.has(readBlockId(block)) && !isFreeCanvasBlock(block, index))
    .map((block) => ({
      block,
      blockId: readBlockId(block),
    }))
}

export function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

export function sessionAudioForBlock(
  preview: PuckLivePreviewModel,
  blockId: string,
  blockIds: PuckLiveBlockIds,
): string | undefined {
  if (blockIds.sectionAudios.includes(blockId)) return preview.sessionAudio
  return preview.sessionAudio
}
