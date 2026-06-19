import { Loader2 } from 'lucide-react'
import type { Data } from '@measured/puck'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArticleEditAudioModal } from '@/modules/editor/components/article-edit-audio-modal'
import { ArticleEditBackgroundModal } from '@/modules/editor/components/article-edit-background-modal'
import { ArticleEditBgArtifactsModal } from '@/modules/editor/components/article-edit-bg-artifacts-modal'
import { ArticleEditArtifactsFxModal } from '@/modules/editor/components/article-edit-artifacts-fx-modal'
import { ArticleEditEffectsModal } from '@/modules/editor/components/article-editor-effects-panel'
import { ArticleEditVideoModal } from '@/modules/editor/components/article-edit-video-modal'
import { ArticleEditBlockTiles } from '@/modules/editor/components/article-edit-block-tiles'
import { ArticleSelectedBlockTools } from '@/modules/editor/components/article-selected-block-tools'
import { ArticleText3dEffectsModal } from '@/modules/editor/components/article-text-3d-effects-modal'
import { ArticleText2dEffectsModal } from '@/modules/editor/components/article-text-2d-effects-modal'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  addCanvasBlockWithId,
  CANVAS_BLOCK_DROP_POSITION,
  ensureCanvasLayouts,
  updateCanvasBlock,
} from '@/modules/editor/lib/canvas-block-utils'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import {
  isAudioCanvasBlock,
  isImageCanvasBlock,
  isTextCanvasBlock,
  isVideoCanvasBlock,
} from '@/modules/editor/types/article-canvas.types'

interface ArticleEditorEditPanelProps {
  data: Data
  selectedBlockIds: string[]
  deckEditActive?: boolean
  excerpt?: string
  excerptMax?: number
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
  onDeselectBlocks: () => void
  onExcerptChange?: (value: string) => void
}

export function ArticleEditorEditPanel({
  data,
  selectedBlockIds,
  deckEditActive = false,
  excerpt = '',
  excerptMax = 500,
  onChange,
  onSelectBlocks,
  onDeselectBlocks,
  onExcerptChange,
}: ArticleEditorEditPanelProps) {
  const normalizedData = useMemo(() => ensureCanvasLayouts(data), [data])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [backgroundPanelOpen, setBackgroundPanelOpen] = useState(false)
  const [artifactsPanelOpen, setArtifactsPanelOpen] = useState(false)
  const [effectsPanelOpen, setEffectsPanelOpen] = useState(false)
  const [artifactsFxPanelOpen, setArtifactsFxPanelOpen] = useState(false)
  const [text2dPanelOpen, setText2dPanelOpen] = useState(false)
  const [text3dPanelOpen, setText3dPanelOpen] = useState(false)

  const selectedBlocks = normalizedData.content.filter((block) =>
    selectedBlockIds.includes(String((block.props as Record<string, unknown>).blockId)),
  )
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

  const mediaModalOpen =
    audioModalOpen ||
    videoModalOpen ||
    backgroundPanelOpen ||
    artifactsPanelOpen ||
    effectsPanelOpen ||
    artifactsFxPanelOpen ||
    text2dPanelOpen ||
    text3dPanelOpen

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

  useEffect(() => {
    if (audioModalOpen && audioBlockIds.length > 0) setAudioModalOpen(false)
  }, [audioModalOpen, audioBlockIds.length])

  useEffect(() => {
    if (videoModalOpen && videoBlockIds.length > 0) setVideoModalOpen(false)
  }, [videoModalOpen, videoBlockIds.length])

  const addTextBlock = () => {
    setAudioModalOpen(false)
    setVideoModalOpen(false)
    setBackgroundPanelOpen(false)
    setArtifactsPanelOpen(false)
    setEffectsPanelOpen(false)
    setArtifactsFxPanelOpen(false)
    setText2dPanelOpen(false)
    setText3dPanelOpen(false)
    const { data: next, blockId } = addCanvasBlockWithId(
      normalizedData,
      'ArticleBody',
      CANVAS_BLOCK_DROP_POSITION,
    )
    onChange(next)
    onSelectBlocks([blockId])
  }

  const handleImageFile = async (file: File) => {
    if (imageUploading) return
    setAudioModalOpen(false)
    setVideoModalOpen(false)
    setBackgroundPanelOpen(false)
    setArtifactsPanelOpen(false)
    setEffectsPanelOpen(false)
    setArtifactsFxPanelOpen(false)
    setText2dPanelOpen(false)
    setText3dPanelOpen(false)
    setImageUploading(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      const { data: next, blockId } = addCanvasBlockWithId(
        normalizedData,
        'ArticleImage',
        CANVAS_BLOCK_DROP_POSITION,
      )
      onChange(updateCanvasBlock(next, blockId, { imageUrl: uploaded.url }))
      onSelectBlocks([blockId])
    } finally {
      setImageUploading(false)
    }
  }

  const activeTile = showTextTool
    ? 'text'
    : showImageTool || imageUploading
      ? 'image'
      : showAudioTool || audioModalOpen
        ? 'audio'
        : showVideoTool || videoModalOpen
          ? 'video'
          : backgroundPanelOpen
            ? 'background'
            : artifactsPanelOpen
              ? 'artifacts'
              : effectsPanelOpen
                ? 'effects'
                : artifactsFxPanelOpen
                  ? 'artifactFx'
                  : text2dPanelOpen
                    ? 'text2d'
                    : text3dPanelOpen
                      ? 'text3d'
                      : null

  return (
    <div className="space-y-3">
      <ArticleEditBlockTiles
        activeTile={activeTile}
        onTextClick={addTextBlock}
        onImageClick={() => {
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          imageInputRef.current?.click()
        }}
        onAudioClick={() => {
          onDeselectBlocks()
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setAudioModalOpen(true)
        }}
        onVideoClick={() => {
          onDeselectBlocks()
          setAudioModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setVideoModalOpen(true)
        }}
        onBackgroundClick={() => {
          onDeselectBlocks()
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setBackgroundPanelOpen(true)
        }}
        onBgArtifactsClick={() => {
          onDeselectBlocks()
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setArtifactsPanelOpen(true)
        }}
        onEffectsClick={() => {
          onDeselectBlocks()
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setEffectsPanelOpen(true)
        }}
        onArtifactsFxClick={() => {
          onDeselectBlocks()
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setText2dPanelOpen(false)
          setText3dPanelOpen(false)
          setArtifactsFxPanelOpen(true)
        }}
        onText2dClick={() => {
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText3dPanelOpen(false)
          setText2dPanelOpen(true)
        }}
        onText3dClick={() => {
          setAudioModalOpen(false)
          setVideoModalOpen(false)
          setBackgroundPanelOpen(false)
          setArtifactsPanelOpen(false)
          setEffectsPanelOpen(false)
          setArtifactsFxPanelOpen(false)
          setText2dPanelOpen(false)
          if (textBlockIds.length === 0) onDeselectBlocks()
          setText3dPanelOpen(true)
        }}
        imageUploading={imageUploading}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleImageFile(file)
          e.target.value = ''
        }}
      />

      {imageUploading ? (
        <div className="article-edit-uploading">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Uploading image…</p>
        </div>
      ) : null}

      {audioModalOpen ? <ArticleEditAudioModal onClose={() => setAudioModalOpen(false)} /> : null}
      {videoModalOpen ? <ArticleEditVideoModal onClose={() => setVideoModalOpen(false)} /> : null}
      {backgroundPanelOpen ? (
        <ArticleEditBackgroundModal
          data={normalizedData}
          onChange={onChange}
          onClose={() => setBackgroundPanelOpen(false)}
        />
      ) : null}
      {artifactsPanelOpen ? (
        <ArticleEditBgArtifactsModal
          data={normalizedData}
          onChange={onChange}
          onClose={() => setArtifactsPanelOpen(false)}
        />
      ) : null}
      {effectsPanelOpen ? (
        <ArticleEditEffectsModal
          data={normalizedData}
          onChange={onChange}
          onClose={() => setEffectsPanelOpen(false)}
        />
      ) : null}
      {artifactsFxPanelOpen ? (
        <ArticleEditArtifactsFxModal
          data={normalizedData}
          onChange={onChange}
          onClose={() => setArtifactsFxPanelOpen(false)}
        />
      ) : null}
      {text2dPanelOpen ? (
        <ArticleText2dEffectsModal
          data={normalizedData}
          selectedBlockIds={textBlockIds}
          onChange={onChange}
          onClose={() => setText2dPanelOpen(false)}
        />
      ) : null}
      {text3dPanelOpen ? (
        <ArticleText3dEffectsModal
          data={normalizedData}
          selectedBlockIds={textBlockIds}
          onChange={onChange}
          onClose={() => setText3dPanelOpen(false)}
        />
      ) : null}

      {deckEditActive ? (
        <div className="article-edit-deck-panel space-y-2 rounded-lg border border-border p-3">
          <Label htmlFor="sidebar-hero-deck">Hero deck / excerpt</Label>
          <Textarea
            id="sidebar-hero-deck"
            value={excerpt}
            onChange={(event) => onExcerptChange?.(event.target.value)}
            placeholder="Short summary under the headline…"
            maxLength={excerptMax}
            rows={5}
          />
          <p className="text-right text-xs text-muted-foreground">
            {excerpt.length}/{excerptMax}
          </p>
        </div>
      ) : (
        <ArticleSelectedBlockTools
          data={normalizedData}
          selectedBlockIds={selectedBlockIds}
          onChange={onChange}
          onDeselect={onDeselectBlocks}
          imageUploading={imageUploading}
          mediaModalOpen={mediaModalOpen}
        />
      )}
    </div>
  )
}
