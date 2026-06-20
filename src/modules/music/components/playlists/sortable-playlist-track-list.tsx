import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import type { PlaylistDetailDto, PlaylistTrackRefDto } from '@/modules/music/types/music.types'
import {
  formatDateAdded,
  formatTrackDuration,
} from '@/modules/music/lib/playlist-detail-format'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist.css'

type SortablePlaylistTrackListProps = {
  playlist: PlaylistDetailDto
  onPlayTrack: (index: number) => void
  onRemoveTrack: (trackId: string) => void
  onReorder: (trackIds: string[]) => void
  isRemoving?: boolean
  isReordering?: boolean
}

function trackThumb(track: PlaylistTrackRefDto, playlist: PlaylistDetailDto) {
  const src = track.coverUrl ?? playlist.coverUrl
  if (src) return <img src={src} alt="" className="playlist-track-list__thumb" loading="lazy" />
  return (
    <span className="playlist-track-list__thumb-fallback" aria-hidden>
      ♪
    </span>
  )
}

function SortableTrackRow({
  track,
  index,
  playlist,
  onPlayTrack,
  onRemoveTrack,
  isRemoving,
}: {
  track: PlaylistTrackRefDto
  index: number
  playlist: PlaylistDetailDto
  onPlayTrack: (index: number) => void
  onRemoveTrack: (trackId: string) => void
  isRemoving?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.trackId,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('playlist-track-list__row', isDragging && 'playlist-track-list__row--dragging')}
      role="row"
    >
      <button
        type="button"
        className="playlist-track-list__handle"
        aria-label={`Drag ${track.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} aria-hidden />
      </button>
      <span className="playlist-track-list__index">{index + 1}</span>
      <button
        type="button"
        className="playlist-track-list__main"
        onClick={() => onPlayTrack(index)}
      >
        {trackThumb(track, playlist)}
        <span className="playlist-track-list__copy">
          <span className="playlist-track-list__title">{track.title}</span>
          <span className="playlist-track-list__artist">
            {track.artistSlug ? (
              <Link
                to={`/artist/${track.artistSlug}`}
                className="playlist-track-list__artist-link"
                onClick={(event) => event.stopPropagation()}
              >
                {track.artistName}
              </Link>
            ) : (
              track.artistName
            )}
          </span>
        </span>
      </button>
      <span className="playlist-track-list__added">{formatDateAdded(track.addedAt)}</span>
      <span className="playlist-track-list__duration">{formatTrackDuration(track.durationSec)}</span>
      <div className="playlist-track-list__actions">
        <button
          type="button"
          className="playlist-track-list__remove playlist-track-list__remove--visible"
          aria-label={`Remove ${track.title}`}
          disabled={isRemoving}
          onClick={() => onRemoveTrack(track.trackId)}
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function SortablePlaylistTrackList({
  playlist,
  onPlayTrack,
  onRemoveTrack,
  onReorder,
  isRemoving,
  isReordering,
}: SortablePlaylistTrackListProps) {
  const [items, setItems] = useState(playlist.tracks)

  useEffect(() => {
    setItems(playlist.tracks)
  }, [playlist.tracks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((t) => t.trackId === active.id)
    const newIndex = items.findIndex((t) => t.trackId === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    onReorder(next.map((t) => t.trackId))
  }

  if (!items.length) {
    return <p className="playlist-track-list__empty">No tracks yet. Search below to add songs.</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className={cn('playlist-track-list playlist-track-list--sortable', isReordering && 'opacity-80')}>
        <div className="playlist-track-list__head" role="row">
          <span aria-hidden />
          <span>#</span>
          <span>Title</span>
          <span>Added</span>
          <span aria-label="Duration">Time</span>
          <span className="sr-only">Remove</span>
        </div>
        <SortableContext items={items.map((t) => t.trackId)} strategy={verticalListSortingStrategy}>
          {items.map((track, index) => (
            <SortableTrackRow
              key={track.trackId}
              track={track}
              index={index}
              playlist={playlist}
              onPlayTrack={onPlayTrack}
              onRemoveTrack={onRemoveTrack}
              isRemoving={isRemoving}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
}
