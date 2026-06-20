import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock3, FileAudio, GripVertical } from 'lucide-react'
import { formatArtistTrackTitle } from '@/modules/music/lib/track-title-format'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { formatDuration } from '@/modules/music/types/release-builder.types'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ReleaseTrackDetailsListProps {
  tracks: QueuedUpload[]
  trackDurations: Record<string, number | undefined>
  artistName: string
  onTrackTitleChange: (id: string, title: string) => void
  onReorder: (activeId: string, overId: string) => void
}

function SortableTrackCard({
  track,
  index,
  durationSec,
  onTrackTitleChange,
  reorderEnabled,
  artistName,
}: {
  track: QueuedUpload
  index: number
  durationSec?: number
  onTrackTitleChange: (id: string, title: string) => void
  reorderEnabled: boolean
  artistName: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    disabled: !reorderEnabled,
  })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rbl-track-card', isDragging && 'rbl-track-card--dragging')}
    >
      <header className="rbl-track-card__head">
        <div className="flex min-w-0 items-center gap-2">
          {reorderEnabled ? (
            <button
              type="button"
              className="rbl-queue__handle"
              aria-label={`Reorder track ${index + 1}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
          ) : null}
          <span className="rbl-track-row__num">{String(index + 1).padStart(2, '0')}</span>
          <FileAudio className="rbl-text-accent size-4 shrink-0" />
          <div className="min-w-0">
            <p className="rbl-track-card__filename">{track.file.name}</p>
            <p className="rbl-track-card__meta">
              {(track.file.size / (1024 * 1024)).toFixed(1)} MB
              {durationSec ? ` · ${formatDuration(durationSec)}` : ''}
            </p>
          </div>
        </div>
        {durationSec ? (
          <span className="rbl-track-card__duration">
            <Clock3 className="size-3.5" aria-hidden />
            {formatDuration(durationSec)}
          </span>
        ) : null}
      </header>

      <div className="rbl-track-card__body">
        <div className="rbl-field">
          <label htmlFor={`song-name-${track.id}`}>Song name</label>
          <Input
            id={`song-name-${track.id}`}
            placeholder="e.g. Chal"
            value={track.title}
            onChange={(e) => onTrackTitleChange(track.id, e.target.value)}
          />
          {track.title.trim() ? (
            <p className="rbl-field__hint">
              Publishes as {formatArtistTrackTitle(artistName, track.title)}
            </p>
          ) : (
            <p className="rbl-field__hint">Only the song name — your artist name is added automatically.</p>
          )}
        </div>
      </div>
    </article>
  )
}

export function ReleaseTrackDetailsList({
  tracks,
  trackDurations,
  artistName,
  onTrackTitleChange,
  onReorder,
}: ReleaseTrackDetailsListProps) {
  const reorderEnabled = tracks.length > 1
  const trackIds = tracks.map((track) => track.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={trackIds} strategy={verticalListSortingStrategy}>
        <div className="rbl-track-card-list">
          {tracks.map((track, index) => (
            <SortableTrackCard
              key={track.id}
              track={track}
              index={index}
              durationSec={trackDurations[track.id]}
              onTrackTitleChange={onTrackTitleChange}
              reorderEnabled={reorderEnabled}
              artistName={artistName}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
