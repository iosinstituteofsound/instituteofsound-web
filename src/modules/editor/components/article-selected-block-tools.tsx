import { Loader2 } from 'lucide-react'
import type { Data } from '@measured/puck'
import { useMemo } from 'react'
import { ArticleAudioToolPanel } from '@/modules/editor/components/article-audio-tool-panel'
import { ArticleImageToolPanel } from '@/modules/editor/components/article-image-tool-panel'
import { ArticleTextToolPanel } from '@/modules/editor/components/article-text-tool-panel'
import { ArticleVideoToolPanel } from '@/modules/editor/components/article-video-tool-panel'
import { ensureCanvasLayouts } from '@/modules/editor/lib/canvas-block-utils'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import {
  isAudioCanvasBlock,
  isImageCanvasBlock,
  isTextCanvasBlock,
  isVideoCanvasBlock,
} from '@/modules/editor/types/article-canvas.types'

interface ArticleSelectedBlockToolsProps {
  data: Data
  selectedBlockIds: string[]
  onChange: (data: Data | ((prev: Data) => Data)) => void
  onDeselect: () => void
  imageUploading?: boolean
  mediaModalOpen?: boolean
}

export function ArticleSelectedBlockTools({
  data,
  selectedBlockIds,
  onChange,
  onDeselect,
  imageUploading = false,
  mediaModalOpen = false,
}: ArticleSelectedBlockToolsProps) {
  const normalizedData = useMemo(() => ensureCanvasLayouts(data), [data])

  const selectedBlocks = normalizedData.content.filter((block) =>
    selectedBlockIds.includes(String((block.props as Record<string, unknown>).blockId)),
  )
  const primaryBlock = selectedBlocks[0] ?? null
  const primaryBlockId = primaryBlock
    ? String((primaryBlock.props as Record<string, unknown>).blockId)
    : null

  const textBlockIds = selectedBlocks
    .filter((block) => isTextCanvasBlock(block.type as CanvasBlockType))
    .map((block) => String((block.props as Record<string, unknown>).blockId))
  const imageBlockIds = selectedBlocks
    .filter((block) => isImageCanvasBlock(block.type as CanvasBlockType))
    .map((block) => String((block.props as Record<string, unknown>).blockId))
  const audioBlockIds = selectedBlocks
    .filter((block) => isAudioCanvasBlock(block.type as CanvasBlockType))
    .map((block) => String((block.props as Record<string, unknown>).blockId))
  const videoBlockIds = selectedBlocks
    .filter((block) => isVideoCanvasBlock(block.type as CanvasBlockType))
    .map((block) => String((block.props as Record<string, unknown>).blockId))

  const showTextTool =
    textBlockIds.length > 0 &&
    imageBlockIds.length === 0 &&
    audioBlockIds.length === 0 &&
    videoBlockIds.length === 0 &&
    !mediaModalOpen
  const showImageTool =
    imageBlockIds.length > 0 &&
    textBlockIds.length === 0 &&
    audioBlockIds.length === 0 &&
    videoBlockIds.length === 0 &&
    !imageUploading &&
    !mediaModalOpen
  const showAudioTool =
    audioBlockIds.length > 0 &&
    textBlockIds.length === 0 &&
    imageBlockIds.length === 0 &&
    videoBlockIds.length === 0 &&
    !mediaModalOpen
  const showVideoTool =
    videoBlockIds.length > 0 &&
    textBlockIds.length === 0 &&
    imageBlockIds.length === 0 &&
    audioBlockIds.length === 0 &&
    !mediaModalOpen

  if (imageUploading) {
    return (
      <div className="article-edit-uploading">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Uploading image…</p>
      </div>
    )
  }

  if (showTextTool && primaryBlock && primaryBlockId) {
    return (
      <ArticleTextToolPanel
        data={normalizedData}
        selectedBlockIds={textBlockIds}
        blockType={primaryBlock.type as CanvasBlockType}
        objectCount={selectedBlocks.length}
        onChange={onChange}
        onDeselect={onDeselect}
      />
    )
  }

  if (showImageTool && primaryBlock && primaryBlockId) {
    return (
      <ArticleImageToolPanel
        data={normalizedData}
        selectedBlockIds={imageBlockIds}
        blockType={primaryBlock.type as CanvasBlockType}
        objectCount={selectedBlocks.length}
        onChange={onChange}
        onDeselect={onDeselect}
      />
    )
  }

  if (showAudioTool && primaryBlock && primaryBlockId) {
    return (
      <ArticleAudioToolPanel
        data={normalizedData}
        selectedBlockIds={audioBlockIds}
        objectCount={selectedBlocks.length}
        onChange={onChange}
        onDeselect={onDeselect}
      />
    )
  }

  if (showVideoTool && primaryBlock && primaryBlockId) {
    return (
      <ArticleVideoToolPanel
        data={normalizedData}
        selectedBlockIds={videoBlockIds}
        objectCount={selectedBlocks.length}
        onChange={onChange}
        onDeselect={onDeselect}
      />
    )
  }

  if (
    selectedBlocks.length > 0 &&
    !showTextTool &&
    !showImageTool &&
    !showAudioTool &&
    !showVideoTool &&
    !mediaModalOpen
  ) {
    return (
      <div className="article-edit-empty">
        <p className="article-edit-empty__title">{selectedBlocks.length} objects selected</p>
        <p className="text-xs text-muted-foreground">
          Mixed selection — select only one block type to open the tool panel.
        </p>
      </div>
    )
  }

  return null
}

export function blockToolLabel(data: Data, selectedBlockIds: string[]): string {
  if (!selectedBlockIds.length) return 'Edit'
  const block = ensureCanvasLayouts(data).content.find(
    (item) => String((item.props as Record<string, unknown>).blockId) === selectedBlockIds[0],
  )
  if (!block) return 'Edit'
  const type = block.type as CanvasBlockType
  if (isTextCanvasBlock(type)) {
    if (type === 'ArticleTitle') return 'Edit headline'
    if (type === 'ArticleLead') return 'Edit intro'
    if (type === 'ArticleSection') return 'Edit section'
    return 'Edit text'
  }
  if (isImageCanvasBlock(type)) return type === 'ArticleHero' ? 'Edit hero image' : 'Edit image'
  if (isAudioCanvasBlock(type)) return 'Edit audio'
  if (isVideoCanvasBlock(type)) return 'Edit video'
  return 'Edit block'
}
