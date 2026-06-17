import { GripVertical, X } from 'lucide-react'
import { useState } from 'react'
import { ArticleAudioSearchPicker } from '@/modules/editor/components/article-audio-search-picker'
import { ArticleExternalAudioLinkPicker } from '@/modules/editor/components/article-external-audio-link-picker'
import { ArticleSessionAudioPlayer } from '@/modules/editor/components/article-session-audio-player'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import {
  type AudioBlockDragPayload,
  IOS_BLOCK_PAYLOAD_MIME,
  IOS_BLOCK_TYPE_MIME,
} from '@/modules/editor/lib/canvas-block-utils'
import {
  audioDraftFromSiteTrack,
  type AudioBlockDraft,
} from '@/modules/editor/lib/external-audio-link'
import { resolveSiteAudioCollection } from '@/modules/editor/lib/resolve-audio-collection'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'
import { cn } from '@/shared/lib/cn'

interface ArticleEditAudioModalProps {
  onClose: () => void
}

export function ArticleEditAudioModal({ onClose }: ArticleEditAudioModalProps) {
  const [selected, setSelected] = useState<AudioBlockDraft | null>(null)
  const { data: explore } = useExplore()

  const handleSiteSelect = (track: SiteAudioTrack) => {
    const sessionTracks = explore ? resolveSiteAudioCollection(explore, track) : undefined
    setSelected(audioDraftFromSiteTrack(track, sessionTracks))
  }

  const handleDragStart = (event: React.DragEvent) => {
    if (!selected?.audioUrl) return
    const payload: AudioBlockDragPayload = {
      audioUrl: selected.audioUrl,
      trackTitle: selected.title,
      sessionLabel: selected.sessionLabel,
      durationSec: selected.durationSec ?? 0,
      sessionTracks: selected.sessionTracks,
    }
    event.dataTransfer.setData(IOS_BLOCK_TYPE_MIME, 'ArticleAudio')
    event.dataTransfer.setData(IOS_BLOCK_PAYLOAD_MIME, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="article-edit-audio-modal article-edit-tool-panel">
      <div className="article-edit-tool-panel__header">
        <span className="article-edit-tool-panel__title">Session audio</span>
        <button type="button" className="article-edit-tool-panel__close" onClick={onClose} aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-edit-tool-panel__body article-edit-audio-modal__body">
        <ArticleAudioSearchPicker
          selectedTrackId={selected?.id ?? null}
          onSelect={handleSiteSelect}
        />

        <div className="article-edit-audio-modal__divider">
          <span>or</span>
        </div>

        <ArticleExternalAudioLinkPicker onSelect={setSelected} />

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
              <ArticleSessionAudioPlayer
                audioUrl={selected.audioUrl}
                trackTitle={selected.title}
                sessionLabel={selected.sessionLabel}
                sessionTracks={selected.sessionTracks}
                variant="compact"
                interactive={false}
              />
            </div>
          </div>
        ) : null}

        <p className="article-edit-audio-modal__hint">
          {selected
            ? 'Drag the player onto the canvas.'
            : 'Search site audio or paste an external link, then drag it onto your board.'}
        </p>
      </div>
    </div>
  )
}
