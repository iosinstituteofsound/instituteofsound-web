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
import { ArticleAudioSearchPicker } from '@/modules/editor/components/article-audio-search-picker'
import { ArticleExternalAudioLinkPicker } from '@/modules/editor/components/article-external-audio-link-picker'
import { ArticleSessionAudioPlayer } from '@/modules/editor/components/article-session-audio-player'
import {
  duplicateCanvasBlock,
  removeCanvasBlocks,
  reorderBlock,
  rotateBlockAngle,
  updateCanvasBlock,
} from '@/modules/editor/lib/canvas-block-utils'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { resolveSiteAudioCollection } from '@/modules/editor/lib/resolve-audio-collection'
import type { AudioBlockDraft } from '@/modules/editor/lib/external-audio-link'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'
import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'

interface ArticleAudioToolPanelProps {
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

export function ArticleAudioToolPanel({
  data,
  selectedBlockIds,
  objectCount,
  onChange,
  onDeselect,
}: ArticleAudioToolPanelProps) {
  const [sourceMode, setSourceMode] = useState<'closed' | 'search' | 'external'>('closed')
  const { data: explore } = useExplore()

  const primaryBlockId = selectedBlockIds[0]
  const selectedBlock = primaryBlockId
    ? data.content.find((block) => (block.props as Record<string, unknown>).blockId === primaryBlockId)
    : null
  if (!selectedBlock || !primaryBlockId || objectCount !== 1) return null

  const props = selectedBlock.props as Record<string, unknown>
  const audioUrl = String(props.audioUrl ?? '')
  const trackTitle = String(props.trackTitle ?? 'Session')
  const sessionLabel = String(props.sessionLabel ?? 'Listen to the session')

  const sessionTracks = Array.isArray(props.sessionTracks)
    ? (props.sessionTracks as SessionAudioTrack[])
    : undefined

  const patchProps = (patch: Record<string, unknown>) => {
    onChange(updateCanvasBlock(data, primaryBlockId, patch))
  }

  const handlePickTrack = (track: SiteAudioTrack) => {
    const tracks = explore ? resolveSiteAudioCollection(explore, track) : undefined
    patchProps({
      audioUrl: track.streamUrl,
      trackTitle: track.title,
      durationSec: track.durationSec ?? 0,
      sessionTracks: tracks,
    })
    setSourceMode('closed')
  }

  const handlePickExternal = (draft: AudioBlockDraft) => {
    patchProps({
      audioUrl: draft.audioUrl,
      trackTitle: draft.title,
      sessionLabel: draft.sessionLabel,
      durationSec: draft.durationSec ?? 0,
      sessionTracks: draft.sessionTracks ?? [],
    })
    setSourceMode('closed')
  }

  return (
    <div className="article-text-tool article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Audio</span>
        <button type="button" className="article-edit-tool-panel__close" title="Close" onClick={onDeselect}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body">
        {audioUrl ? (
          <div className="article-edit-audio-modal__preview pointer-events-none">
            <ArticleSessionAudioPlayer
              audioUrl={audioUrl}
              trackTitle={trackTitle}
              sessionLabel={sessionLabel}
              sessionTracks={sessionTracks}
              variant="compact"
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
            <span>{sourceMode === 'search' ? 'Hide search' : 'Search site audio'}</span>
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
          <ArticleAudioSearchPicker onSelect={handlePickTrack} className="px-2 pb-2" />
        ) : null}

        {sourceMode === 'external' ? (
          <ArticleExternalAudioLinkPicker onSelect={handlePickExternal} className="px-2 pb-2" />
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
            <Label className="text-[11px] text-muted-foreground">Track title</Label>
            <Input
              value={trackTitle}
              onChange={(e) => patchProps({ trackTitle: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Session label</Label>
            <Input
              value={sessionLabel}
              onChange={(e) => patchProps({ sessionLabel: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
