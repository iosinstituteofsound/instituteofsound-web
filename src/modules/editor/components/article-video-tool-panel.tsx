import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react'
import type { Data } from '@measured/puck'
import { ArticleExternalVideoLinkPicker } from '@/modules/editor/components/article-external-video-link-picker'
import { ArticleSessionVideoPlayer } from '@/modules/editor/components/article-session-video-player'
import { ArticleVideoSearchPicker } from '@/modules/editor/components/article-video-search-picker'
import {
  duplicateCanvasBlock,
  removeCanvasBlocks,
  reorderBlock,
  rotateBlockAngle,
  updateCanvasBlock,
} from '@/modules/editor/lib/canvas-block-utils'
import type { VideoBlockDraft } from '@/modules/editor/lib/external-video-link'
import { videoDraftFromSiteItem } from '@/modules/editor/lib/external-video-link'
import type { SiteVideoItem } from '@/modules/editor/lib/site-video-library'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleVideoToolPanelProps {
  data: Data
  selectedBlockIds: string[]
  objectCount: number
  onChange: (data: Data) => void
  onDeselect: () => void
}

function ToolIconButton({
  title,
  onClick,
  children,
  destructive,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'article-text-tool__icon-btn',
        destructive && 'article-text-tool__icon-btn--destructive',
      )}
    >
      {children}
    </button>
  )
}

export function ArticleVideoToolPanel({
  data,
  selectedBlockIds,
  objectCount,
  onChange,
  onDeselect,
}: ArticleVideoToolPanelProps) {
  const [sourceMode, setSourceMode] = useState<'closed' | 'search' | 'external'>('closed')

  const primaryBlockId = selectedBlockIds[0]
  const selectedBlock = primaryBlockId
    ? data.content.find((block) => (block.props as Record<string, unknown>).blockId === primaryBlockId)
    : null
  if (!selectedBlock || !primaryBlockId || objectCount !== 1) return null

  const props = selectedBlock.props as Record<string, unknown>
  const videoUrl = String(props.videoUrl ?? '')
  const videoTitle = String(props.videoTitle ?? 'Session video')
  const caption = String(props.caption ?? 'Watch the session')
  const posterUrl = typeof props.posterUrl === 'string' ? props.posterUrl : undefined

  const patchProps = (patch: Record<string, unknown>) => {
    onChange(updateCanvasBlock(data, primaryBlockId, patch))
  }

  const handlePickSite = (item: SiteVideoItem) => {
    const draft = videoDraftFromSiteItem(item)
    patchProps({
      videoUrl: draft.videoUrl,
      videoTitle: draft.title,
      caption: draft.caption,
      posterUrl: draft.posterUrl ?? '',
    })
    setSourceMode('closed')
  }

  const handlePickExternal = (draft: VideoBlockDraft) => {
    patchProps({
      videoUrl: draft.videoUrl,
      videoTitle: draft.title,
      caption: draft.caption,
      posterUrl: draft.posterUrl ?? '',
    })
    setSourceMode('closed')
  }

  return (
    <div className="article-text-tool article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Video</span>
        <button type="button" className="article-edit-tool-panel__close" title="Close" onClick={onDeselect}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body">
        {videoUrl ? (
          <div className="article-edit-audio-modal__preview pointer-events-none">
            <ArticleSessionVideoPlayer
              videoUrl={videoUrl}
              videoTitle={videoTitle}
              caption={caption}
              posterUrl={posterUrl}
              interactive={false}
            />
          </div>
        ) : null}

        <div className="article-audio-tool__source-actions">
          <button
            type="button"
            className="article-image-tool__replace-btn"
            onClick={() => setSourceMode((mode) => (mode === 'search' ? 'closed' : 'search'))}
          >
            <span>{sourceMode === 'search' ? 'Hide search' : 'Search site video'}</span>
          </button>
          <button
            type="button"
            className="article-image-tool__replace-btn"
            onClick={() => setSourceMode((mode) => (mode === 'external' ? 'closed' : 'external'))}
          >
            <span>{sourceMode === 'external' ? 'Hide link' : 'Paste external link'}</span>
          </button>
        </div>

        {sourceMode === 'search' ? (
          <ArticleVideoSearchPicker onSelect={handlePickSite} className="px-2 pb-2" />
        ) : null}

        {sourceMode === 'external' ? (
          <ArticleExternalVideoLinkPicker onSelect={handlePickExternal} className="px-2 pb-2" />
        ) : null}

        <div className="article-text-tool__actions">
          <ToolIconButton
            title="Delete"
            destructive
            onClick={() => {
              onChange(removeCanvasBlocks(data, selectedBlockIds))
              onDeselect()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="Duplicate" onClick={() => onChange(duplicateCanvasBlock(data, primaryBlockId))}>
            <Copy className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="Send backward" onClick={() => onChange(reorderBlock(data, primaryBlockId, 'back'))}>
            <ArrowDownToLine className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="Bring forward" onClick={() => onChange(reorderBlock(data, primaryBlockId, 'front'))}>
            <ArrowUpToLine className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="Rotate left" onClick={() => onChange(rotateBlockAngle(data, primaryBlockId, -15))}>
            <RotateCcw className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="Rotate right" onClick={() => onChange(rotateBlockAngle(data, primaryBlockId, 15))}>
            <RotateCw className="h-4 w-4" />
          </ToolIconButton>
          <ToolIconButton title="More" onClick={() => undefined}>
            <MoreHorizontal className="h-4 w-4" />
          </ToolIconButton>
        </div>

        <div className="space-y-3 px-2 pb-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Video title</Label>
            <Input
              value={videoTitle}
              onChange={(e) => patchProps({ videoTitle: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Caption</Label>
            <Input
              value={caption}
              onChange={(e) => patchProps({ caption: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
