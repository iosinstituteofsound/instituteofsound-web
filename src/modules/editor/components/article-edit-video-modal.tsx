import { GripVertical, X } from 'lucide-react'
import { useState } from 'react'
import { ArticleExternalVideoLinkPicker } from '@/modules/editor/components/article-external-video-link-picker'
import { ArticleSessionVideoPlayer } from '@/modules/editor/components/article-session-video-player'
import { ArticleVideoSearchPicker } from '@/modules/editor/components/article-video-search-picker'
import {
  type VideoBlockDragPayload,
  IOS_BLOCK_PAYLOAD_MIME,
  IOS_BLOCK_TYPE_MIME,
} from '@/modules/editor/lib/canvas-block-utils'
import { videoDraftFromSiteItem, type VideoBlockDraft } from '@/modules/editor/lib/external-video-link'
import type { SiteVideoItem } from '@/modules/editor/lib/site-video-library'
import { cn } from '@/shared/lib/cn'

interface ArticleEditVideoModalProps {
  onClose: () => void
}

export function ArticleEditVideoModal({ onClose }: ArticleEditVideoModalProps) {
  const [selected, setSelected] = useState<VideoBlockDraft | null>(null)

  const handleSiteSelect = (item: SiteVideoItem) => {
    setSelected(videoDraftFromSiteItem(item))
  }

  const handleDragStart = (event: React.DragEvent) => {
    if (!selected?.videoUrl) return
    const payload: VideoBlockDragPayload = {
      videoUrl: selected.videoUrl,
      videoTitle: selected.title,
      caption: selected.caption,
      posterUrl: selected.posterUrl,
    }
    event.dataTransfer.setData(IOS_BLOCK_TYPE_MIME, 'ArticleVideo')
    event.dataTransfer.setData(IOS_BLOCK_PAYLOAD_MIME, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="article-edit-video-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Session video</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-video-modal__body">
        <ArticleVideoSearchPicker selectedVideoId={selected?.id ?? null} onSelect={handleSiteSelect} />

        <div className="article-edit-audio-modal__divider">
          <span>or</span>
        </div>

        <ArticleExternalVideoLinkPicker onSelect={setSelected} />

        {selected ? (
          <div
            draggable
            onDragStart={handleDragStart}
            className={cn('article-edit-audio-modal__drag-card', 'article-edit-audio-modal__drag-card--ready')}
          >
            <div className="article-edit-audio-modal__drag-handle" aria-hidden>
              <GripVertical className="h-4 w-4" />
              <span>Drag to board</span>
            </div>
            <div className="article-edit-audio-modal__preview pointer-events-none">
              <ArticleSessionVideoPlayer
                videoUrl={selected.videoUrl}
                videoTitle={selected.title}
                caption={selected.caption}
                posterUrl={selected.posterUrl}
                interactive={false}
              />
            </div>
          </div>
        ) : null}

        <p className="article-edit-audio-modal__hint">
          {selected
            ? 'Drag the player onto the canvas.'
            : 'Search site video or paste an external link, then drag it onto your board.'}
        </p>
      </div>
    </div>
  )
}
