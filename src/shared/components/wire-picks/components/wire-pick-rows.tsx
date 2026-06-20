import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Play, Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  releaseGenreLabel,
  releaseInitials,
  releasePlaysFormatted,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import type { ReleaseDto, WirePickItem } from '@/modules/explore/types/explore.types'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import {
  feedItemArtist,
  feedItemStreamUrl,
  feedItemTitle,
  type ResolvedWirePick,
  type WirePickDragIds,
} from '@/shared/components/wire-picks/lib/wire-pick-utils'
import { cn } from '@/shared/lib/cn'

export function WireLineupDropZone({
  dropId,
  isEmpty,
  children,
}: {
  dropId: string
  isEmpty: boolean
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'wire-desk__dropzone',
        isEmpty && 'wire-desk__dropzone--empty',
        isOver && 'wire-desk__dropzone--over',
      )}
    >
      {children}
    </div>
  )
}

export function WireDragPreviewRow({
  rank,
  title,
  subtitle,
  coverUrl,
}: {
  rank: string
  title: string
  subtitle: string
  coverUrl?: string
}) {
  return (
    <div className="wire-desk__row wire-desk__row--overlay">
      <span className="wire-desk__rank">{rank}</span>
      <div className="wire-desk__art">
        {coverUrl ? (
          <img src={coverUrl} alt="" />
        ) : (
          <div className="wire-desk__art-fallback">{releaseInitials(title)}</div>
        )}
      </div>
      <div className="wire-desk__info">
        <p className="wire-desk__track-title">{title}</p>
        <p className="wire-desk__track-meta">{subtitle}</p>
      </div>
    </div>
  )
}

export function WireLineupRow({
  item,
  index,
  resolved,
  dragIds,
  onRemove,
}: {
  item: WirePickItem
  index: number
  resolved: ResolvedWirePick
  dragIds: WirePickDragIds
  onRemove: () => void
}) {
  const playTrack = usePlayerStore((state) => state.playTrack)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragIds.lineupDragId(item),
  })

  const handlePlay = () => {
    if (!resolved.streamUrl) return
    playTrack({
      id: item.releaseId ?? item.feedItemId ?? resolved.key,
      title: resolved.title,
      artist: resolved.subtitle,
      audioUrl: resolved.streamUrl,
      artworkUrl: resolved.coverUrl,
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('wire-desk__row', isDragging && 'wire-desk__row--dragging')}
    >
      <span className="wire-desk__rank">#{String(index + 1).padStart(2, '0')}</span>
      <div className="wire-desk__art">
        {resolved.coverUrl ? (
          <img src={resolved.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="wire-desk__art-fallback">{releaseInitials(resolved.title)}</div>
        )}
      </div>
      <div className="wire-desk__info">
        <p className="wire-desk__track-title">{resolved.title}</p>
        <p className="wire-desk__track-meta">{resolved.subtitle}</p>
        {resolved.badges.length ? (
          <div className="wire-desk__badges">
            {resolved.badges.map((badge) => (
              <span key={badge} className="wire-desk__badge">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="wire-desk__actions">
        {resolved.streamUrl ? (
          <button
            type="button"
            className="wire-desk__icon-btn wire-desk__icon-btn--accent"
            aria-label={`Play ${resolved.title}`}
            onClick={handlePlay}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" />
          </button>
        ) : null}
        <button type="button" className="wire-desk__grab" aria-label="Reorder" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <button type="button" className="wire-desk__icon-btn" aria-label="Remove" onClick={onRemove}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export function WireCandidateReleaseRow({
  release,
  picked,
  dragIds,
  onAdd,
}: {
  release: ReleaseDto
  picked: boolean
  dragIds: WirePickDragIds
  onAdd: () => void
}) {
  const playTrack = usePlayerStore((state) => state.playTrack)
  const plays = releasePlaysFormatted(release)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragIds.candidateReleaseDragId(release.id),
    disabled: picked,
    data: { type: 'release', release },
  })

  const handlePlay = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!release.streamUrl) return
    playTrack({
      id: release.id,
      title: release.title,
      artist: release.artistName ?? 'Unknown',
      audioUrl: release.streamUrl,
      artworkUrl: release.coverUrl,
    })
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'wire-desk__row',
        'wire-desk__row--draggable',
        picked && 'wire-desk__row--picked',
        isDragging && 'wire-desk__row--ghost',
      )}
      {...attributes}
      {...listeners}
    >
      <span className="wire-desk__grab" aria-hidden>
        <GripVertical size={16} />
      </span>
      <div className="wire-desk__art">
        {release.coverUrl ? (
          <img src={release.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="wire-desk__art-fallback">{releaseInitials(release.title)}</div>
        )}
      </div>
      <div className="wire-desk__info">
        <p className="wire-desk__track-title">{release.title}</p>
        <p className="wire-desk__track-meta">
          {release.artistName ?? 'Unknown artist'}
          {plays ? ` · ${plays} plays` : ''}
        </p>
        <div className="wire-desk__badges">
          <span className="wire-desk__badge">{releaseGenreLabel(release)}</span>
          {release.isFeatured ? <span className="wire-desk__badge">Trending</span> : null}
        </div>
      </div>
      <div className="wire-desk__actions">
        {release.streamUrl ? (
          <button
            type="button"
            className="wire-desk__icon-btn wire-desk__icon-btn--accent"
            onClick={handlePlay}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={`Play ${release.title}`}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" />
          </button>
        ) : null}
        <button
          type="button"
          className="wire-desk__add-btn"
          disabled={picked}
          onClick={onAdd}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Add to wire"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export function WireCandidateFeedRow({
  feed,
  picked,
  dragIds,
  onAdd,
}: {
  feed: FeedItemDto
  picked: boolean
  dragIds: WirePickDragIds
  onAdd: () => void
}) {
  const playTrack = usePlayerStore((state) => state.playTrack)
  const streamUrl = feedItemStreamUrl(feed)
  const reactions = feed.engagement?.reactionTotal
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragIds.candidateFeedDragId(feed.id),
    disabled: picked,
    data: { type: 'feed', feed },
  })

  const handlePlay = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!streamUrl) return
    playTrack({
      id: feed.id,
      title: feedItemTitle(feed),
      artist: feedItemArtist(feed),
      audioUrl: streamUrl,
    })
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'wire-desk__row',
        'wire-desk__row--draggable',
        picked && 'wire-desk__row--picked',
        isDragging && 'wire-desk__row--ghost',
      )}
      {...attributes}
      {...listeners}
    >
      <span className="wire-desk__grab" aria-hidden>
        <GripVertical size={16} />
      </span>
      <div className="wire-desk__art">
        <div className="wire-desk__art-fallback">{releaseInitials(feedItemTitle(feed))}</div>
      </div>
      <div className="wire-desk__info">
        <p className="wire-desk__track-title">{feedItemTitle(feed)}</p>
        <p className="wire-desk__track-meta">{feedItemArtist(feed)}</p>
        <div className="wire-desk__badges">
          <span className="wire-desk__badge">Community</span>
          {reactions ? <span className="wire-desk__badge">{reactions} reactions</span> : null}
        </div>
      </div>
      <div className="wire-desk__actions">
        {streamUrl ? (
          <button
            type="button"
            className="wire-desk__icon-btn wire-desk__icon-btn--accent"
            onClick={handlePlay}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={`Play ${feedItemTitle(feed)}`}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" />
          </button>
        ) : null}
        <button
          type="button"
          className="wire-desk__add-btn"
          disabled={picked}
          onClick={onAdd}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Add to wire"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
